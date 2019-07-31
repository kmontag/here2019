import { ServerState } from 'featherstreamer-shared';
import { Action, ActionCreator } from 'redux';

export interface UpdateAction extends Action {
  type: '@@serverState/UPDATE',
  serverState: ServerState,
}

export const update: ActionCreator<UpdateAction> = (serverState: ServerState) => {
  return {
    type: '@@serverState/UPDATE',
    serverState,
  };
}

export interface RequestUpdateAction extends Action {
  type: '@@serverState/REQUEST_UPDATE',
}

export const requestUpdate: ActionCreator<RequestUpdateAction> = () => {
  return {
    type: '@@serverState/REQUEST_UPDATE',
  };
};

export interface SetDeviceChannelAction extends Action {
  type: '@@serverState/SET_DEVICE_CHANNEL',
  deviceId: string,
  channelId: string,
}

export const setDeviceChannel: ActionCreator<SetDeviceChannelAction> = (opts: {
  deviceId: string,
  channelId: string,
}) => {
  return {
    type: '@@serverState/SET_DEVICE_CHANNEL',
    ...opts,
  };
}

export interface SetDeviceBrightnessAction extends Action {
  type: '@@serverState/SET_DEVICE_BRIGHTNESS',
  deviceId: string,
  brightness: number,
}

export const setDeviceBrightness: ActionCreator<SetDeviceBrightnessAction> = (opts: {
  deviceId: string,
  brightness: number,
}) => {
  return {
    type: '@@serverState/SET_DEVICE_BRIGHTNESS',
    ...opts,
  };
}

export interface SetDeviceColorAction extends Action {
  type: '@@serverState/SET_DEVICE_COLOR',
  deviceId: string,
  index: number,
  color: { r: number, g: number, b: number, }
}

export const setDeviceColor: ActionCreator<SetDeviceColorAction> = (opts: {
  deviceId: string,
  index: number,
  color: SetDeviceColorAction['color'],
}) => {
  return {
    type: '@@serverState/SET_DEVICE_COLOR',
    ...opts,
  };
}

export interface ForgetDeviceAction extends Action {
  type: '@@serverState/FORGET_DEVICE',
  id: string,
}

export const forgetDevice: ActionCreator<ForgetDeviceAction> = (id: string) => {
  return {
    type: '@@serverState/FORGET_DEVICE',
    id,
  };
};

export type ServerStateAction =
  UpdateAction |
  RequestUpdateAction |
  SetDeviceChannelAction |
  SetDeviceBrightnessAction |
  SetDeviceColorAction |
  ForgetDeviceAction |
  never;