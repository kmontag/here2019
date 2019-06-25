import logger from './logger';

// Handlers and setup for the rotary encoder.
export function handleTurnCW() {
  logger.info('Clockwise turn');
}

export function handleTurnCCW() {
  logger.info('Counterclockwise turn');
}

export function handlePress() {
  logger.info('Encoder pressed');
}

export function handleRelease() {
  logger.info('Encoder released');
}