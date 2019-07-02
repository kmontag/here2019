/**
 * State for connected devices.
 *
 * TODO: Redux was probably the wrong design choice here, other parts
 * of the global state use their own modules + `PersistentState` for
 * persistence. Redo this at some point.
 */

import { createStore, Reducer, Action } from 'redux';
import { Device } from 'featherstreamer-shared';
import { Map, Record as ImmutableRecord } from 'immutable';
import { Dictionary, Record as RuntypesRecord, String as RuntypesString, Static } from 'runtypes';
import persistentState from './persistentState';
import logger from './logger';
import OPCManager from './OPCManager';

const SavedState = RuntypesRecord({
  // ID -> channel number
  devices: Dictionary(RuntypesString, 'string'),
});
type SavedState = Static<typeof SavedState>;

const PERSISTENT_STATE_KEY = 'devices';
const DEFAULT_CHANNEL_ID = OPCManager.getDefaultChannel();

type ApplicationState = ImmutableRecord<{
  devices: Map<string, ImmutableRecord<Device>>,
}>;

interface RegisterDeviceConnectionAction extends Action {
  type: 'REGISTER_DEVICE_CONNECTION',
  id: string,
}

interface RegisterDeviceDisconnectionAction extends Action {
  type: 'REGISTER_DEVICE_DISCONNECTION',
  id: string,
}

interface ForgetDeviceAction extends Action {
  type: 'FORGET_DEVICE',
  id: string,
}

interface SetDeviceChannelAction extends Action {
  type: 'SET_DEVICE_CHANNEL',
  deviceId: string,
  channelId: string,
}

type ApplicationAction =
  RegisterDeviceConnectionAction |
  RegisterDeviceDisconnectionAction |
  ForgetDeviceAction |
  SetDeviceChannelAction |
  never;

const getDefaultState = (): ApplicationState => {
  let savedState: SavedState | undefined = undefined;
  try {
    const obj = persistentState.get(PERSISTENT_STATE_KEY);
    if (!obj) {
      throw new Error('State does not exist.');
    }
    savedState = SavedState.check(obj);
    logger.info('Loaded saved state.');
  } catch {
    logger.warn(`Error reading device state, or no device state found.`);
  }

  const devices: {
    [id: string]: ImmutableRecord<Device>,
  } = {};
  if (savedState) {
    for (const deviceId in savedState.devices) {
      devices[deviceId] = ImmutableRecord({
        connections: 0,
        channelId: savedState.devices[deviceId],
      })();
    }
  }

  return ImmutableRecord({
    devices: Map(devices),
  })();
};

const reducer: Reducer<ApplicationState, ApplicationAction> = (state = getDefaultState(), action) => {
  let newState: ApplicationState;
  let savedStateChanged: boolean = false;
  switch(action.type) {
    case 'REGISTER_DEVICE_CONNECTION':
      // Close scope to prevent naming conflicts.
      (() => {
        const existingDevice = state.get('devices').get(action.id);
        if (!existingDevice) {
          savedStateChanged = true;
        }
        const device: Device = existingDevice ? {
          ...existingDevice.toJS(),
          connections: existingDevice.get('connections') + 1,
        } : {
          connections: 1,
          channelId: DEFAULT_CHANNEL_ID
        };
        newState = state.set('devices', state.get('devices').set(action.id, ImmutableRecord(device)()));
      })();
      break;
    case 'REGISTER_DEVICE_DISCONNECTION':
      (() => {
        const existingDevice = state.get('devices').get(action.id);
        if (!existingDevice) {
          savedStateChanged = true;
        }
        const device: Device = existingDevice ? {
          ...existingDevice.toJS(),
          connections: Math.max(0, existingDevice.get('connections') - 1),
        } : {
          connections: 0,
          channelId: DEFAULT_CHANNEL_ID
        };
        newState = state.set('devices', state.get('devices').set(action.id, ImmutableRecord(device)()));
      })();
      break;
    case 'FORGET_DEVICE':
      const devices = state.get('devices');
      const device = devices.get(action.id);
      if (device && device.get('connections') == 0) {
        newState = state.set('devices', state.get('devices').delete(action.id));
        savedStateChanged = true;
      } else {
        if (device) {
          logger.warn('Trying to delete device with active connections');
        }
        newState = state;
      }
      break;
    case 'SET_DEVICE_CHANNEL':
      (() => {
        const existingDevice = state.get('devices').get(action.deviceId);
        const device: Device = existingDevice ? {
          ...existingDevice.toJS(),
          channelId: action.channelId,
        } : {
          connections: 0,
          channelId: action.channelId,
        };
        newState = state.set('devices', state.get('devices').set(action.deviceId, ImmutableRecord(device)()));
      })();
      savedStateChanged = true;
      break;
    default:
      newState = state;
      break;
  }

  if (savedStateChanged) {
    const savedState: SavedState = {
      devices: {},
    };
    newState.get('devices').forEach((device, id) => {
      savedState.devices[id] = device.get('channelId');
    });
    persistentState.set(PERSISTENT_STATE_KEY, savedState);

    logger.info('Saved updated state.');
  }

  return newState;
}

export const store = createStore<ApplicationState, ApplicationAction, unknown, unknown>(reducer);

export function registerDeviceConnection(id: string) {
  store.dispatch({
    type: 'REGISTER_DEVICE_CONNECTION',
    id,
  });
}

export function registerDeviceDisconnection(id: string) {
  store.dispatch({
    type: 'REGISTER_DEVICE_DISCONNECTION',
    id,
  });
}

export function forgetDevice(id: string) {
  store.dispatch({
    type: 'FORGET_DEVICE',
    id,
  });
}

export function setDeviceChannel({
  deviceId,
  channelId,
}: {
  deviceId: string,
  channelId: string
}) {
  store.dispatch({
    type: 'SET_DEVICE_CHANNEL',
    deviceId,
    channelId,
  });
}
