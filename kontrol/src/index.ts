import * as delay from 'delay';
import * as fs from 'fs';
import { Socket } from 'net';
import * as createOPCStream from 'opc';
import * as createStrand from 'opc/strand';
import * as path from 'path';
import * as util from 'util'
import { Animation } from 'vidopc';
import { Stream } from 'stream';

// gpio lib is only available on pi
try {
  var pigpio = require('pigpio');
  var Gpio = pigpio.Gpio;
} catch (e) {
  pigpio = null;
  Gpio = null;
}

const OPC_CHANNEL = 0;
const ANIMATIONS_DIR = path.resolve('./build/');

const sockets = {};

interface Pixel {
  r: number,
  g: number,
  b: number,
}

interface TargetConfig {
  brightness: number,
  length: number,
  host: string,
  port: number,
  onPixels?: (pixels: Pixel[]) => any,
}

class Target {

  private socket: (Socket | null) = null;
  private stream: ((Stream & any | null)) = null;
  private strand: any = null;

  private isReady: boolean = false;
  private shouldConnect: boolean = false;

  private socketCount: number = 0;

  private config: TargetConfig;

  private additionalOnPixels: ((pixels: Pixel[]) => any) | void;

  public constructor(config: TargetConfig) {
    this.config = config;
    this.additionalOnPixels = config.onPixels;
  }


  /**
   * Connect and continue reconnecting indefinitely until disconnect()
   * is called.
   */
  public async connect(): Promise<void> {
    const connectTimeout = 2000;
    const connectionCheckDelay = 500;

    if (this.shouldConnect) {
      throw new Error('Already connected to target');
    }
    this.shouldConnect = true;

    this.setupSocket();
    this.socket!.connect(this.config.port, this.config.host);
    let lastConnectTime: number = Date.now();

    // run until disconnect() is called
    while (this.shouldConnect) {
      console.debug(`Checking connection for ${this.config.host}:${this.config.port}...`);
      if (!this.isReady && Date.now() > (lastConnectTime + connectTimeout)) {
        console.log(`Reconnecting to ${this.config.host}:${this.config.port}...`);

        this.setupSocket();
        this.socket!.connect(this.config.port, this.config.host);

        lastConnectTime = Date.now();
      }

      await delay(connectionCheckDelay);
    }
  }

  public disconnect(): void {
    this.shouldConnect = false;

    // Also destroys the current socket, if any.
    this.setupSocket();
  }

  public onPixels(pixels: Pixel[]) {
    if (this.isReady) {
      for (let i in pixels) {
        let pixel = pixels[i];
        if (parseInt(i) < this.config.length) {
          this.strand!.setPixel(i, Math.floor(pixel.r * this.config.brightness), Math.floor(pixel.g * this.config.brightness), Math.floor(pixel.b * this.config.brightness));
        }
      }
      this.stream!.writePixels(OPC_CHANNEL, this.strand!.buffer);
    }
    if (this.additionalOnPixels) {
      this.additionalOnPixels(pixels);
    }
  }

  private setupSocket(): void {
    if (this.socket) {
      this.socket.destroy();
    }
    this.socketCount++;
    this.isReady = false;

    const currSocketCount = this.socketCount;

    this.socket = new Socket();
    this.socket.setNoDelay();

    this.socket.on('connect', () => {
      if (this.socketCount === currSocketCount) {
        console.log(`Successfully connected to ${this.config.host}:${this.config.port}`);
        this.isReady = true;
      }
    });

    this.socket.on('error', (err: Error) => {
      if (this.socketCount !== currSocketCount) {
        console.warn('Received error from destroyed socket:');
      }
      console.error(err.message);
    });

    this.socket.on('close', () => {
      if (this.socketCount === currSocketCount) {
        this.isReady = false;
      }
    });

    this.strand = createStrand(this.config.length);

    this.stream = createOPCStream();
    this.stream!.pipe(this.socket);
  }
}

var ledButtonOutputs = {};
if (pigpio) { // Create Gpio bindings if we're on the pi
  Object.entries({r: 5, g: 6, b: 12}).forEach(
  // Object.entries({r: 12}).forEach(
    ([color, pin]) => {
      ledButtonOutputs[color] = new Gpio(pin, {mode: Gpio.OUTPUT});
    }
  );
}

const PREVIEW_BRIGHTNESS = 0.8;

// Preview the animation on the remote control
const onPoncho1Pixels = (pixels: Pixel[]) => {
  // select the middle-ish pixel
  let pixel: Pixel = pixels[2 * 47 + 20 - 1];

  // The colors have different brightnesses, presumably because of
  // something weird with the inverted PWM.
  let transforms = {
    r: ((r) => 255 - Math.floor(r * 0.3)),
    g: ((g) => 255 - Math.floor(g * 0.6)),
    b: ((b) => 255 - b),
  }
  Object.entries(pixel).forEach(
    ([color, value]) => {
      if (ledButtonOutputs[color]) {
        // Grounding the button turns it on, so we inveert the PWM
        ledButtonOutputs[color].pwmWrite(transforms[color](value));
      }
    }
  );
}

const PONCHO_BRIGHTNESS = 0.45;

const targets: { [key: string]: Target } = {
  poncho1: new Target({
    brightness: PONCHO_BRIGHTNESS,
    length: 47 * 3 + 20,
    host: '192.168.7.61',
    port: 7890,
    onPixels: onPoncho1Pixels,
  }),
  poncho2: new Target({
    brightness: PONCHO_BRIGHTNESS,
    length: 47 * 3 + 20,
    host: '192.168.7.62',
    port: 7890,
  }),
  poncho3: new Target({
    brightness: PONCHO_BRIGHTNESS,
    length: 47 * 3,
    host: '192.168.7.63',
    port: 7890,
  }),
  hat: new Target({
    brightness: PONCHO_BRIGHTNESS,
    length: 2 * 18 + 3,
    host: '192.168.7.67',
    port: 7890,
  }),
  bike: new Target({
    brightness: PONCHO_BRIGHTNESS - 0.05,
    length: 25 * 2 + 7 + 47,
    host: '192.168.7.69',
    port: 7890,
  }),
};


interface AnimationFile {
  filename: string,
  animation: Animation,
}
const go = async () => {
  console.debug = () => {};

  const animations: AnimationFile[] = await Promise.all(
    (await util.promisify(fs.readdir)(ANIMATIONS_DIR))
      .sort()
      .map(async (filename) => {
        filename = path.join(ANIMATIONS_DIR, filename);
        console.log(`Loading ${filename}...`);
        const result: AnimationFile = {
          filename: filename,
          animation: new Animation(await util.promisify(fs.readFile)(filename)),
        };
        return result;
      }));

  if (animations.length == 0) {
    throw new Error(`No animations found in ${ANIMATIONS_DIR}`)
  }

  console.log('Loaded all animations');

  let currentAnimationIndex: number = 0;
  let stopAnimation: (() => any) | null = null;

  const handleFrame = (frame, index) => {
    for (let [name, target] of Object.entries(targets)) {
      if (frame[name]) {
        target.onPixels(frame[name]);
      }
    }
  };

  const setupAnimation = () => {
    if (stopAnimation) {
      stopAnimation();
    }
    console.log(`Playing: ${animations[currentAnimationIndex].filename}`);
    stopAnimation = animations[currentAnimationIndex].animation.play(handleFrame);
  }

  let isPlayingState: boolean = true;

  const play = () => {
    for (const key in targets) {
      targets[key].connect();
    }

    // start first animation
    setupAnimation();
    isPlayingState = true;
  }

  const stop = () => {
    if (stopAnimation) {
      stopAnimation();
    }
    stopAnimation = null; // So it doesn't get double-called
    isPlayingState = false;
    // during the next setup.

    for (const key in targets) {
      targets[key].disconnect();
    }

    // Clear LED
    let pixel = {r: 0, g: 0, b: 0};
    let pixels: Pixel[] = [];
    for (let i = 0; i < 477 * 3 + 20; i++) {
      pixels.push(pixel);
    }
    onPoncho1Pixels(pixels);

    console.log('Stopped');
  }

  play();

  const handleStateToggle = () => {
    if (isPlayingState) {
      stop();
    } else {
      play();
    }
  };

  const handleAnimationChange = () => {
    currentAnimationIndex++;
    currentAnimationIndex %= animations.length;
    if (isPlayingState) {
      console.log('setting up');
      setupAnimation();
    }
  };

  let onExit: ((() => any) | null) = null;
  if (pigpio) {
    console.log('pigpio is available, setting up pi listeners');

    const animationChangeButton = new Gpio(27, {
      mode: Gpio.INPUT,
      pullUpDown: Gpio.PUD_DOWN,
      edge: Gpio.EITHER_EDGE,
      alert: true,
    });
    animationChangeButton.glitchFilter(1000);

    const playStateChangeButton = new Gpio(26, {
      mode: Gpio.INPUT,
      pullUpDown: Gpio.PUD_UP,
      edge: Gpio.EITHER_EDGE,
      alert: true,
    });
    playStateChangeButton.glitchFilter(1000);


    // Button is initally grounded via a pull-down resistor.
    let currentAnimationChangeButtonLevel = 0;
    animationChangeButton.on('alert', (level) => {
      if (level !== currentAnimationChangeButtonLevel) {
        currentAnimationChangeButtonLevel = level;

        // Button pressed, handle animation change.
        if (level === 1) {
          handleAnimationChange();
        }
      }
    });

    let currentPlayStateChangeButtonLevel = 0;
    const handlePlayStateLevel = (level) => {
      if (level !== currentPlayStateChangeButtonLevel) {
        currentPlayStateChangeButtonLevel = level;

        if (level === 1) {
          stop();
        } else {
          play();
        }
      }

    };
    playStateChangeButton.on('alert', handlePlayStateLevel);
    handlePlayStateLevel(playStateChangeButton.digitalRead());

    const playStateLed = new Gpio(21, {mode: Gpio.OUTPUT});
    let hasPlayLedCleared: boolean = false;
    setInterval(() => {
      if (isPlayingState) {
        playStateLed.pwmWrite(100);
        let time = (new Date()).getTime() % 2500;
        let pulseWidth = 1000;
        if (time < pulseWidth) {
          hasPlayLedCleared = false;
          playStateLed.pwmWrite(100 - Math.floor(Math.abs(time - pulseWidth / 2) / (pulseWidth / 2) * 100));
        } else {
          if (true || hasPlayLedCleared) {
            playStateLed.pwmWrite(0);
            hasPlayLedCleared = true;
          }

        }
      } else {
        if (true || !hasPlayLedCleared) {
          playStateLed.pwmWrite(0);
        }
        hasPlayLedCleared = true;
      }
    }, 100);
    onExit = () => {
      playStateLed.pwmWrite(0);
    }
  }

  process.on('SIGINT', () => {
    stop();
    if (onExit) {
      onExit();
    }
    process.exit();
  });
}

go();