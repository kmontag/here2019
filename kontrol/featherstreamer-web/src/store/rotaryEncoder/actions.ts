import { ThunkAction } from 'redux-thunk';
import { ActionCreator, Action } from 'redux';
import axios from 'axios';
import { BACKEND_PREFIX } from '../../routing';

interface PressAction extends Action {
  type: '@@rotaryEncoder/PRESS';
}

export const press: ActionCreator<ThunkAction<Promise<void>, void, void, PressAction>>
  = () => async dispatch => {
    await axios.post(`${BACKEND_PREFIX}/rotaryEncoder/press`);
  };

export type RotaryEncoderAction =
  ReturnType<typeof press>;