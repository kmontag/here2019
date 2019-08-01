import nodeStatusManager from './nodeStatusManager';
import logger from './logger';
import OPCManager from './OPCManager';

let isPressed: boolean = false;

// ms timestamp where we last moved from pressed -> released or vice versa.
let lastChangedPressedAt: number|undefined = undefined;

// Running count incremented every time we press and release the
// encoder button. Used to determine the mode when changing modes.
let clicksCount: number = 0;

// When changing modes, we set a timeout to process input during the
// input window. If a long press is received again during the window,
// we cancel it and restart the timer.
//
// If this value is not undefined, we are currently changing modes, so
// presses should not be treated as on/off toggles.
let processModeChangeInputInterval: NodeJS.Timeout|undefined = undefined;

// If a click is held for this long, start recording additional clicks
// once it's released.
const MODE_CHANGE_HOLD_DURATION = 2000;

// During this window after a long press, record the total number of clicks
const MODE_CHANGE_INPUT_DURATION = 2000;

// Handlers and setup for the rotary encoder.
export function handleTurnCW() {
  logger.debug('Clockwise turn');
  const opcManager = OPCManager.getInstance();
  opcManager.setMediaIndex(opcManager.getMediaIndex() + 1);
}

export function handleTurnCCW() {
  logger.debug('Counterclockwise turn');
  const opcManager = OPCManager.getInstance();
  opcManager.setMediaIndex(opcManager.getMediaIndex() - 1);
}

export function handlePress() {
  logger.debug('Encoder pressed');

  if (!isPressed) {
    isPressed = true;
    lastChangedPressedAt = (new Date()).getTime();
  } else {
    logger.warn('Encoder was already pressed, ignoring');
  }
}

export function handleRelease() {
  logger.debug('Encoder released');
  if (isPressed) {
    isPressed = false;

    const time = (new Date()).getTime();
    if (lastChangedPressedAt && time - lastChangedPressedAt > MODE_CHANGE_HOLD_DURATION) {
      if (processModeChangeInputInterval) {
        clearInterval(processModeChangeInputInterval);
      }

      // Reset clicks
      clicksCount = 0;

      processModeChangeInputInterval = setTimeout(() => {
        processModeChangeInputInterval = undefined;

        // Switch the mode
        switch(clicksCount) {
          case 1:
            nodeStatusManager.setMode('isolated');
            break;
          case 2:
            nodeStatusManager.setMode('slave');
            break;
          case 3:
            nodeStatusManager.setMode('master');
            break;
          case 4:
            nodeStatusManager.setMode('pairing');
            break;
          default:
            break;
        }

      }, MODE_CHANGE_INPUT_DURATION);
    } else {
      clicksCount++;

      // Toggle on/off unless we're currently changing modes
      if (!processModeChangeInputInterval) {
        OPCManager.getInstance().toggleLive();
      }
    }

  } else {
    logger.warn('Encoder was already released, ignoring');
  }
}