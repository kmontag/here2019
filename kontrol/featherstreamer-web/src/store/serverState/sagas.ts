import { List } from 'immutable';
import axios from 'axios';
import { SagaIterator, Saga } from 'redux-saga';
import { delay, put, takeEvery } from 'redux-saga/effects';
import { requestUpdate, RequestUpdateAction, update, ForgetDeviceAction, SetDeviceChannelAction, SetDeviceBrightnessAction, SetDeviceColorAction } from './actions';
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

function * doSetDeviceChannel(action: SetDeviceChannelAction) {
  yield axios({
    url: `${BACKEND_PREFIX}/devices/${action.deviceId}`,
    method: 'PUT',
    data: {
      channelId: action.channelId,
    },
  });
  yield put(requestUpdate());
}

function * watchSetDeviceChannel(): SagaIterator {
  yield takeEvery<SetDeviceChannelAction>('@@serverState/SET_DEVICE_CHANNEL', doSetDeviceChannel);
}

function * doSetDeviceBrightness(action: SetDeviceBrightnessAction) {
  yield axios({
    url: `${BACKEND_PREFIX}/devices/${action.deviceId}`,
    method: 'PUT',
    data: {
      brightness: action.brightness,
    },
  });
  yield put(requestUpdate());
}

function * watchSetDeviceBrightness(): SagaIterator {
  yield takeEvery<SetDeviceBrightnessAction>('@@serverState/SET_DEVICE_BRIGHTNESS', doSetDeviceBrightness);
}


function * doSetDeviceColor(action: SetDeviceColorAction) {
  yield axios({
    url: `${BACKEND_PREFIX}/devices/${action.deviceId}`,
    method: 'PUT',
    data: {
      color: { index: action.index, ...action.color },
    },
  });
  yield put(requestUpdate());
}

function * watchSetDeviceColor(): SagaIterator {
  yield takeEvery<SetDeviceColorAction>('@@serverState/SET_DEVICE_COLOR', doSetDeviceColor);
}


export default List<Saga>([
  watchRequestUpdate,
  requestUpdatePeriodically,
  watchForgetDevice,
  watchSetDeviceChannel,
  watchSetDeviceBrightness,
  watchSetDeviceColor,
]);