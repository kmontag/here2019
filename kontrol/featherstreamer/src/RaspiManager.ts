import logger from './logger';

// @ts-ignore
import { handleTurnCW, handleTurnCCW, handlePress, handleRelease } from './rotaryEncoder';
import { Gpio } from 'pigpio';
import { NodeStatusManager } from './nodeStatusManager';
//import debounce from 'debounce';

let raspi: any = undefined;
// @ts-ignore
let RotaryEncoder: any = undefined;
try {
  raspi = require('raspi');
  RotaryEncoder = require('raspi-rotary-encoder').RotaryEncoder;
} catch (e) {
  logger.warn(`Problem requiring rotary encoder lib: ${e.message}`);
}

const LED_GPIO = 11;
const ROTARY_GPIO_A = 20;
const ROTARY_GPIO_B = 16;
const BUTTON_GPIO = 21;

export default class RaspiManager {
  constructor(
    private readonly nodeStatusManager: NodeStatusManager,
  ) {}
  start() {
    if (raspi) { // && RotaryEncoder) {
      raspi.init(() => {
        // const encoder: any = new RotaryEncoder({
        //   pins: { a: ROTARY_GPIO_A, b: ROTARY_GPIO_B },
        //   pullResistors: { a: 'up', b: 'up' },
        // });


        /**
         * The rotary encoder is tough to get precise clicks
         * with. Each click is normally a delta of 4 in the "count,"
         * but sometimes just 2, and the encoder is quite sensitive to
         * getting jiggled.
         *
         * To make behavior more predictable, we process turns as
         * "batches" of rotary clicks. After the user turns to a delta
         * of +/- 4 from the last processed count (or whenever the
         * button push state is changed, see below), handle this as a
         * turn and ignore all further events until none come in
         * within a "pause" period.
         */
        let prevProcessedCount: number = 0;
        let currCount: number = 0;
        let currTimeout: NodeJS.Timeout | undefined = undefined;

        const flushRotaryValue = () => {
          const delta = Math.abs(prevProcessedCount - currCount);
          if (delta >= 1) {
            if (prevProcessedCount < currCount) {
              logger.debug(`CW to ${currCount}`);
              handleTurnCW();
            } else {
              logger.debug(`CCW to ${currCount}`);
              handleTurnCCW();
            }
            prevProcessedCount = currCount;
          }
        };

        // encoder.addListener('change', (event: any) => {
        //   if (currTimeout) {
        //     clearInterval(currTimeout);
        //   }

        //   currCount = event.value;
        //   logger.debug(`Count: ${currCount}`);
        //   currTimeout = setTimeout(flushRotaryValue, 100);
        // });

        // Numbers 0-3. 0 and 1 represent high and low on pin A, 2 and
        // 3 on pin B.
        const lastEvents: number[] = [0, 0, 0, 0];

        // Tracker to use the array as a ring buffer.
        let lastEventsIndex: number = 0;

        // If we see this pattern of events, it strongly suggests the
        // knob is turning in a particular direction (these are the
        // "correct" patterns if interrupts were actually
        // working). Other patterns will likely appear due to
        // incorrect readings, but we discard them as noise.
        const cwPattern = [0, 2, 1, 3];
        const ccwPattern = [2, 0, 3, 1];

        for(const p of [ROTARY_GPIO_A, ROTARY_GPIO_B]) {
          const wut = new Gpio(p, {
            mode: Gpio.INPUT,
            pullUpDown: Gpio.PUD_UP,
            edge: Gpio.EITHER_EDGE,
            alert: true,
          });
          let pinLastLevel: undefined|number = undefined;
          wut.on('interrupt', (level) => {
            if (level !== pinLastLevel) {
              // Debounce repeated events on the same pin.
              pinLastLevel = level;

              //logger.debug(`GPIO${p}: ${p == 20 || p == 24 ? '      ' : ''} ${level}`);
              lastEvents[lastEventsIndex] = (p == ROTARY_GPIO_B ? 2 : 0) + level;

              // This will be the index for the next event, but it's
              // also currently the index of 4 events ago.
              lastEventsIndex = (lastEventsIndex + 1) % 4;

              let isCw: boolean = true;
              let isCcw: boolean  = true;

              let debugStr = '';
              for (let i = 0; i < 4; i++) {
                const index = (i + lastEventsIndex) % 4;
                debugStr = `${debugStr} ${lastEvents[index]}`
                if (isCw && cwPattern[i] !== lastEvents[index]) {
                  isCw = false;
                }
                if (isCcw && ccwPattern[i] !== lastEvents[index]) {
                  isCcw = false;
                }
              }
              logger.debug(debugStr);

              if (isCw) {
                currCount++;
              }
              if (isCcw) {
                currCount--;
              }

              if (isCw || isCcw) {
                logger.debug(`Count: ${currCount}`);
              }

              if (currTimeout) {
                clearInterval(currTimeout);
              }
              currTimeout = setTimeout(flushRotaryValue, 100);
            }
          });
        }

        const button = new Gpio(BUTTON_GPIO, {
          mode: Gpio.INPUT,
          pullUpDown: Gpio.PUD_UP,
          edge: Gpio.EITHER_EDGE,
          alert: true,
        });
        button.glitchFilter(1000);
        button.on('interrupt', (level) => {
          logger.debug(`Button push: ${level}`);
          flushRotaryValue();
          if (level === 0) {
            handlePress();
          } else {
            handleRelease();
          }
        });

        const led = new Gpio(LED_GPIO, {
          mode: Gpio.OUTPUT,
          pullUpDown: Gpio.PUD_DOWN,
        });
        setInterval(async () => {
          const delay =
            (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
          const mode = this.nodeStatusManager.getMode();
          const blinksMap = {
            'isolated': 1,
            'slave': 2,
            'master': 3,
            'pairing': 4,
          };
          const numBlinks = blinksMap[mode];
          if (!numBlinks) {
            throw new Error('unexpected');
          }

          for (let i = 0; i < numBlinks; i++) {
            led.digitalWrite(1);
            await delay(300);
            led.digitalWrite(0);
            await delay(300);
          }


        }, 3000);
      });
    } else {
      logger.warn('raspi library not found, skipping setup');
    }
  }
}