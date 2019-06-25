import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer, { ApplicationAction } from './reducers/rootReducer';
import { State } from 'featherstreamer-shared';

const initialState: State = {};

export default function configureStore() {
  return createStore<State, ApplicationAction, unknown, unknown> (
    rootReducer,
    initialState,
    applyMiddleware(thunk),
  );
}