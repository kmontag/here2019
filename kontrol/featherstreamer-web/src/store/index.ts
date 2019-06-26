import { combineReducers, Reducer, Dispatch } from 'redux';
import rotaryEncoderReducer, { initialState as rotaryEncoderInitialState, RotaryEncoderState } from './rotaryEncoder/reducer';
import rotaryEncoderSagas from './rotaryEncoder/sagas';
import { RotaryEncoderAction } from './rotaryEncoder/actions';
import { Record as ImmutableRecord } from 'immutable';
import { Saga } from 'redux-saga';
import { List } from 'immutable';

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

let _sagas: List<Saga> = List();
let contextSagas: Iterable<Saga>[] = [
  rotaryEncoderSagas,
];
for (const context of contextSagas) {
  _sagas = _sagas.concat(context);
}

export const sagas: List<Saga> = _sagas;