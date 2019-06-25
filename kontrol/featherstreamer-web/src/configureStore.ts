import { createStore, applyMiddleware, Store } from 'redux';
import thunk from 'redux-thunk';
import { reducer, ApplicationAction, ApplicationState } from './store';

export default function configureStore(
  initialState: ApplicationState,
): Store<ApplicationState> {
  return createStore<ApplicationState, ApplicationAction, unknown, unknown>(
    reducer,
    initialState,
    applyMiddleware(thunk),
  );
}