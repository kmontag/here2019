import { Reducer } from 'redux';
import { ServerStateAction } from './actions';
import { ServerState } from 'featherstreamer-shared';

export type ServerStateState = Omit<ServerState, 'nodeStatus'> & {
  // Make this property optional, for more sensible initial state.
  nodeStatus?: ServerState['nodeStatus'],
} & {
  isLoading: boolean,
};

export const initialState: ServerStateState = {
  channels: {},
  media: {
    selectedIndex: -1,
    names: [],
  },
  devices: {},
  nodeStatus: undefined,
  ssid: '',
  isLoading: true,
};

const reducer: Reducer<ServerStateState, ServerStateAction> = (state: ServerStateState = initialState, action): ServerStateState => {
  switch(action.type) {
    case '@@serverState/UPDATE':
      return { ...action.serverState, isLoading: false };
    default:
      return state;
  };
};
export default reducer;