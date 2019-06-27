import { Record, Static, String, Number, Dictionary } from 'runtypes';

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

const ServerState = Record({
  channels: Dictionary(Channel, 'string'),
  devices: Dictionary(Device, 'string'),
  ssid: String,
});
type ServerState = Static<typeof ServerState>;
export { ServerState };