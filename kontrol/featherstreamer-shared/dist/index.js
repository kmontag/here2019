"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runtypes_1 = require("runtypes");
const Channel = runtypes_1.Record({
    description: runtypes_1.String,
});
exports.Channel = Channel;
const Device = runtypes_1.Record({
    connections: runtypes_1.Number,
    channelId: runtypes_1.String,
});
exports.Device = Device;
/**
 * Info related to the device's status within the wider network of
 * devices.
 */
const Mode = runtypes_1.Union(runtypes_1.Literal('master'), runtypes_1.Literal('slave'), runtypes_1.Literal('isolated'), runtypes_1.Literal('pairing'));
exports.Mode = Mode;
const NodeStatus = runtypes_1.Record({
    mode: Mode,
    isNetworkInterfaceUpdating: runtypes_1.Boolean,
    // Undefined means irrelevant for the current mode.
    isMasterVisible: runtypes_1.Boolean.Or(runtypes_1.Undefined),
});
exports.NodeStatus = NodeStatus;
const ServerState = runtypes_1.Record({
    channels: runtypes_1.Dictionary(Channel, 'string'),
    devices: runtypes_1.Dictionary(Device, 'string'),
    nodeStatus: NodeStatus,
    ssid: runtypes_1.String,
});
exports.ServerState = ServerState;
