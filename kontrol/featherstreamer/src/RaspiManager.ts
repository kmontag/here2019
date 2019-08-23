import logger from './logger';

import { handleTurnCW, handleTurnCCW, handlePress, handleRelease } from './rotaryEncoder';
import { NodeStatusManager } from './nodeStatusManager';
import OPCManager from './OPCManager';
import { MasterVisibilityManager } from './masterVisibilityManager';
//import debounce from 'debounce';

let Gpio: typeof import('pigpio').Gpio;

try {
  Gpio = require('pigpio').Gpio;
} catch (e) {
  logger.warn(`Problem requiring GPIO lib: ${e.message}`);
}

const LED_GPIO = 11;
const ROTARY_GPIO_A = 20;
const ROTARY_GPIO_B = 16;
const BUTTON_GPIO = 21;

export default class RaspiManager {
  constructor(
    private readonly nodeStatusManager: NodeStatusManager,
    private readonly opcManager: OPCManager,
    private readonly masterVisibilityManager: MasterVisibilityManager,
  ) {}
  start() {
    if (Gpio) { // && RotaryEncoder) {

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
            //logger.debug(`CW to ${currCount}`);
            handleTurnCW();
          } else {
            //logger.debug(`CCW to ${currCount}`);
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
            // logger.debug(debugStr);

            if (isCw) {
              currCount++;
            }
            if (isCcw) {
              currCount--;
            }

            if (isCw || isCcw) {
              //logger.debug(`Count: ${currCount}`);
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

      const shortBlinkLength = 150;
      const longBlinkLength = 500;

      const modeBlinkWindow = shortBlinkLength * 10;
      const stateBlinkWindow = (longBlinkLength + shortBlinkLength) * 5;

      (async () => {
        const delay =
          (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

        const blink = async (ms: number): Promise<void> => {
          led.digitalWrite(1);
          await delay(ms);
          led.digitalWrite(0);
        };

        while (true) {
          const whenNextSeries = delay(modeBlinkWindow + stateBlinkWindow);
          const whenStateWindowStarted = delay(modeBlinkWindow);

          // Series of short blinks to indicate mode.
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
            await blink(shortBlinkLength);
            await delay(shortBlinkLength);
          }

          await whenStateWindowStarted;

          const stateBlinks: boolean[] = [
            // One long blink to indicate we're now showing state booleans.
            true,

            // On/off state
            this.opcManager.isLive(),

            // Master presence
            this.masterVisibilityManager.isMasterVisible() || false,

            // Network configuration in-progress state
            this.nodeStatusManager.isNetworkInterfaceUpdating(),
          ];
          for (const isLongBlink of stateBlinks) {
            const individualBlinkWindow = delay(shortBlinkLength + longBlinkLength);
            await blink(isLongBlink ? longBlinkLength : shortBlinkLength);
            await individualBlinkWindow;
          }

          await whenNextSeries;
        }

      })();;

    } else {
      logger.warn('pigpio library not found, skipping setup');
    }
  }
}