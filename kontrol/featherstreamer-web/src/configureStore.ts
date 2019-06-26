import { createStore, applyMiddleware, Store } from 'redux';
import { reducer, sagas, ApplicationAction, ApplicationState } from './store';
import createSagaMiddleware from 'redux-saga';

const sagaMiddleware = createSagaMiddleware();

export default function configureStore(
  initialState: ApplicationState,
): Store<ApplicationState> {
  const store = createStore<ApplicationState, ApplicationAction, unknown, unknown>(
    reducer,
    initialState,
    applyMiddleware(sagaMiddleware),
  );

  for (const saga of sagas) {
    sagaMiddleware.run(saga);
  }

  return store;
}

