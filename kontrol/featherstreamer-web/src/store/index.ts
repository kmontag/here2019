import { combineReducers, Reducer, Dispatch } from 'redux';
import rotaryEncoderReducer, { initialState as rotaryEncoderInitialState, RotaryEncoderState } from './rotaryEncoder/reducer';
import { RotaryEncoderAction } from './rotaryEncoder/actions';
import { Record as ImmutableRecord } from 'immutable';

// import { ServerState } from 'featherstreamer-shared';

export interface ApplicationState {
  rotaryEncoder: RotaryEncoderState;
}

export type ApplicationAction =
  RotaryEncoderAction;

export interface ConnectedReduxProps {
  dispatch: Dispatch<ApplicationAction>;
}

export const reducer: Reducer<ApplicationState> = combineReducers({
  rotaryEncoder: rotaryEncoderReducer,
});

export const initialState: ApplicationState = ImmutableRecord({
  rotaryEncoder: rotaryEncoderInitialState,
})();