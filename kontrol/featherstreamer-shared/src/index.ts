import { Record, Static, String, Number, Dictionary, Literal, Union, Boolean, Undefined, Array } from 'runtypes';

const Channel = Record({
  description: String,
});
type Channel = Static<typeof Channel>;
export { Channel };

const Device = Record({
  connections: Number,
  channelId: String,
});
type Device = Static<typeof Device>;
export { Device };

/**
 * Info related to the device's status within the wider network of
 * devices.
 */
const Mode = Union(
  Literal('master'),
  Literal('slave'),
  Literal('isolated'),
  Literal('pairing'),
);
type Mode = Static<typeof Mode>;
export { Mode };
const NodeStatus = Record({
  mode: Mode,
  isNetworkInterfaceUpdating: Boolean,

  // Undefined means irrelevant for the current mode.
  isMasterVisible: Boolean.Or(Undefined),
});
type NodeStatus = Static<typeof NodeStatus>;
export { NodeStatus };

const ServerState = Record({
  channels: Dictionary(Channel, 'string'),
  devices: Dictionary(Device, 'string'),
  nodeStatus: NodeStatus,
  ssid: String,
  media: Record({
    names: Array(String),
    currentSelection: String,
  }),
});
type ServerState = Static<typeof ServerState>;
export { ServerState };