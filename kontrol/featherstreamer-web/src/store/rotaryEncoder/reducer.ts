import { Reducer } from 'redux';
import { RotaryEncoderAction } from './actions';

export interface RotaryEncoderState {
  isPressed: boolean;
  position: number;
}

export const initialState: RotaryEncoderState = {
  isPressed: false,
  position: 0,
};

const reducer: Reducer<RotaryEncoderState, RotaryEncoderAction> = (state: RotaryEncoderState = initialState, action): RotaryEncoderState => {
  switch (action.type) {
    case '@@rotaryEncoder/PRESS':
      return { ...state, isPressed: true };
    case '@@rotaryEncoder/RELEASE':
      return { ...state, isPressed: false };
    case '@@rotaryEncoder/ROTATE_CLOCKWISE':
      return { ...state, position: state.position + 1 };
    case '@@rotaryEncoder/ROTATE_COUNTERCLOCKWISE':
      return { ...state, position: state.position - 1 };
    default:
      return state;
  };
};
export default reducer;