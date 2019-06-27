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
const ServerState = runtypes_1.Record({
    channels: runtypes_1.Dictionary(Channel, 'string'),
    devices: runtypes_1.Dictionary(Device, 'string'),
    ssid: runtypes_1.String,
});
exports.ServerState = ServerState;
