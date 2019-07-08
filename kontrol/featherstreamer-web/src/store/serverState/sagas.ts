import { List } from 'immutable';
import axios from 'axios';
import { SagaIterator, Saga } from 'redux-saga';
import { delay, put, takeEvery } from 'redux-saga/effects';
import { requestUpdate, RequestUpdateAction, update, ForgetDeviceAction, UpdateDeviceChannelAction } from './actions';
import { BACKEND_PREFIX } from '../../routing';
import { ServerState } from 'featherstreamer-shared';

function * doRequestUpdate() {
  const result = yield axios.get(`${BACKEND_PREFIX}/state`);
  const serverState = ServerState.check(result.data);
  yield put(update(serverState));
}

function * watchRequestUpdate(): SagaIterator {
  yield takeEvery<RequestUpdateAction>('@@serverState/REQUEST_UPDATE', doRequestUpdate);
}

function * requestUpdatePeriodically(dispatch: any): SagaIterator {
  while (true) {
    yield put(requestUpdate());
    yield delay(1000);
  }
}

function * doForgetDevice(action: ForgetDeviceAction) {
  yield axios.delete(`${BACKEND_PREFIX}/devices/${action.id}`);
  yield put(requestUpdate());
}

function * watchForgetDevice(): SagaIterator {
  yield takeEvery<ForgetDeviceAction>('@@serverState/FORGET_DEVICE', doForgetDevice);
}

function * doUpdateDeviceChannel(action: UpdateDeviceChannelAction) {
  yield axios({
    url: `${BACKEND_PREFIX}/devices/${action.deviceId}`,
    method: 'PUT',
    data: {
      channelId: action.channelId,
    },
  });
  yield put(requestUpdate());
}

function * watchUpdateDeviceChannel(): SagaIterator {
  yield takeEvery<UpdateDeviceChannelAction>('@@serverState/UPDATE_DEVICE_CHANNEL', doUpdateDeviceChannel);
}

export default List<Saga>([
  watchRequestUpdate,
  requestUpdatePeriodically,
  watchForgetDevice,
  watchUpdateDeviceChannel,
]);