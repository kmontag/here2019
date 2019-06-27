import logger from './logger';

// Handlers and setup for the rotary encoder.
export function handleTurnCW() {
  logger.debug('Clockwise turn');
}

export function handleTurnCCW() {
  logger.debug('Counterclockwise turn');
}

export function handlePress() {
  logger.debug('Encoder pressed');
}

export function handleRelease() {
  logger.debug('Encoder released');
}