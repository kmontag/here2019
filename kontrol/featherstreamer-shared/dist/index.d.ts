import { Record, Static, String, Number } from 'runtypes';
declare const Channel: Record<{
    description: String;
}, false>;
declare type Channel = Static<typeof Channel>;
export { Channel };
declare const Device: Record<{
    connections: Number;
    channelId: String;
}, false>;
declare type Device = Static<typeof Device>;
export { Device };
declare const ServerState: Record<{
    channels: import("runtypes").StringDictionary<Record<{
        description: String;
    }, false>>;
    devices: import("runtypes").StringDictionary<Record<{
        connections: Number;
        channelId: String;
    }, false>>;
    ssid: String;
}, false>;
declare type ServerState = Static<typeof ServerState>;
export { ServerState };
