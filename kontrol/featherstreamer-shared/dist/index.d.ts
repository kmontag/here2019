import { Record, Static, String, Number, Literal, Boolean } from 'runtypes';
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
/**
 * Info related to the device's status within the wider network of
 * devices.
 */
declare const Mode: import("runtypes").Union4<Literal<"master">, Literal<"slave">, Literal<"isolated">, Literal<"pairing">>;
declare type Mode = Static<typeof Mode>;
export { Mode };
declare const NodeStatus: Record<{
    mode: import("runtypes").Union4<Literal<"master">, Literal<"slave">, Literal<"isolated">, Literal<"pairing">>;
    isNetworkInterfaceUpdating: Boolean;
    isMasterVisible: Boolean;
}, false>;
declare type NodeStatus = Static<typeof NodeStatus>;
export { NodeStatus };
declare const ServerState: Record<{
    channels: import("runtypes").StringDictionary<Record<{
        description: String;
    }, false>>;
    devices: import("runtypes").StringDictionary<Record<{
        connections: Number;
        channelId: String;
    }, false>>;
    nodeStatus: Record<{
        mode: import("runtypes").Union4<Literal<"master">, Literal<"slave">, Literal<"isolated">, Literal<"pairing">>;
        isNetworkInterfaceUpdating: Boolean;
        isMasterVisible: Boolean;
    }, false>;
    ssid: String;
}, false>;
declare type ServerState = Static<typeof ServerState>;
export { ServerState };
