import { ActionCreator, Action } from 'redux';

export interface PressAction extends Action {
  type: '@@rotaryEncoder/PRESS';
}

export const press: ActionCreator<PressAction> = () => {
  return {
    type: '@@rotaryEncoder/PRESS',
  };
};

export interface ReleaseAction extends Action {
  type: '@@rotaryEncoder/RELEASE',
}

export const release: ActionCreator<ReleaseAction> = () => {
  return {
    type: '@@rotaryEncoder/RELEASE',
  };
};

export interface RotateClockwiseAction extends Action {
  type: '@@rotaryEncoder/ROTATE_CLOCKWISE',
}

export const rotateClockwise: ActionCreator<RotateClockwiseAction> = () => {
  return {
    type: '@@rotaryEncoder/ROTATE_CLOCKWISE',
  };
};

export interface RotateCounterclockwiseAction extends Action {
  type: '@@rotaryEncoder/ROTATE_COUNTERCLOCKWISE',
}

export const rotateCounterclockwise: ActionCreator<RotateCounterclockwiseAction> = () => {
  return {
    type: '@@rotaryEncoder/ROTATE_COUNTERCLOCKWISE',
  };
};

export type RotaryEncoderAction =
  PressAction |
  ReleaseAction |
  RotateClockwiseAction |
  RotateCounterclockwiseAction |
  never;
