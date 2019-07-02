import nodeStatusManager from './nodeStatusManager';
import logger from './logger';

let isPressed: boolean = false;
let turnsSincePress: number = 0;

// Handlers and setup for the rotary encoder.
export function handleTurnCW() {
    logger.debug('Clockwise turn');
  if (isPressed) {
    turnsSincePress++;
  }
}

export function handleTurnCCW() {
  logger.debug('Counterclockwise turn');
}

export function handlePress() {
  logger.debug('Encoder pressed');
  if (!isPressed) {
    isPressed = true;
    turnsSincePress = 0;
  } else {
    logger.warn('Encoder was already pressed, ignoring');
  }
}

export function handleRelease() {
  logger.debug('Encoder released');
  if (isPressed) {
    isPressed = false;

    // Switch the mode
    switch(turnsSincePress) {
      case 0:
        logger.warn('TODO: turn off lights');
        break;
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
  } else {
    logger.warn('Encoder was already released, ignoring');
  }
}