import { combineReducers, Reducer, Dispatch } from 'redux';
import rotaryEncoderReducer, { initialState as rotaryEncoderInitialState, RotaryEncoderState } from './rotaryEncoder/reducer';
import rotaryEncoderSagas from './rotaryEncoder/sagas';
import serverStateReducer, { initialState as serverStateInitialState, ServerStateState } from './serverState/reducer';
import serverStateSagas from './serverState/sagas';
import { RotaryEncoderAction } from './rotaryEncoder/actions';
import { Saga } from 'redux-saga';
import { List } from 'immutable';
import { ServerStateAction } from './serverState/actions';

// import { ServerState } from 'featherstreamer-shared';

export interface ApplicationState {
  rotaryEncoder: RotaryEncoderState;
  serverState: ServerStateState;
}

export type ApplicationAction =
  RotaryEncoderAction |
  ServerStateAction |
  never;

export interface ConnectedReduxProps {
  dispatch: Dispatch<ApplicationAction>;
}

export const reducer: Reducer<ApplicationState> = combineReducers({
  rotaryEncoder: rotaryEncoderReducer,
  serverState: serverStateReducer,
});

export const initialState: ApplicationState = {
  rotaryEncoder: rotaryEncoderInitialState,
  serverState: serverStateInitialState,
};

let _sagas: List<Saga> = List();
let contextSagas: Iterable<Saga>[] = [
  rotaryEncoderSagas,
  serverStateSagas,
];
for (const context of contextSagas) {
  _sagas = _sagas.concat(context);
}

export const sagas: List<Saga> = _sagas;