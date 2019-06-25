import { Reducer } from 'redux';
import { Record as ImmutableRecord } from 'immutable';
import { RotaryEncoderAction } from './actions';

export interface RotaryEncoderState {
  isPressed: boolean;
}

export const initialState: RotaryEncoderState = ImmutableRecord({
  isPressed: false,
})();

const reducer: Reducer<RotaryEncoderState, RotaryEncoderAction> = (state: RotaryEncoderState = initialState, action) => {
  switch (action.type) {
    case '@@rotaryEncoder/PRESS':
      return { ...state, isPressed: true };
    default:
      return state;
  };
};
export default reducer;