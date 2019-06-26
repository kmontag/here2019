import { List } from 'immutable';
import axios from 'axios';
import { SagaIterator, Saga } from 'redux-saga';
import { takeEvery } from 'redux-saga/effects';
import { RotaryEncoderAction } from './actions';
import { BACKEND_PREFIX } from '../../routing';

const postEffect = (backendPath: string) => {
  return function * () {
    yield axios.post(`${BACKEND_PREFIX}${backendPath}`, {

    });
  };
};

const postSaga = (action: RotaryEncoderAction['type'], backendPath: string): Saga => {
  return function * (): SagaIterator {
    yield takeEvery<RotaryEncoderAction>(action, postEffect(backendPath));
  };
}

export default List<Saga>([
  postSaga('@@rotaryEncoder/PRESS', '/rotaryEncoder/press'),
  postSaga('@@rotaryEncoder/RELEASE', '/rotaryEncoder/release'),
  postSaga('@@rotaryEncoder/ROTATE_CLOCKWISE', '/rotaryEncoder/cw'),
  postSaga('@@rotaryEncoder/ROTATE_COUNTERCLOCKWISE', '/rotaryEncoder/ccw'),
]);