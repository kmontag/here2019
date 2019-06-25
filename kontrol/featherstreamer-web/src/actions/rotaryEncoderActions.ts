import { ThunkAction } from 'redux-thunk';
import { ActionCreator, Action } from 'redux';
import axios from 'axios';
import { BACKEND_PREFIX } from '../routing';

export const PRESS_ROTARY_ENCODER = 'PRESS_ROTARY_ENCODER';
type PressRotaryEncoderAction = Action<typeof PRESS_ROTARY_ENCODER>;

export const pressRotaryEncoder: ActionCreator<ThunkAction<Promise<void>, void, void, PressRotaryEncoderAction>>
  = () => async dispatch => {
    await axios.post(`${BACKEND_PREFIX}/rotaryEncoder/press`);
  };
