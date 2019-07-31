import bodyParser from 'body-parser';
import { EventEmitter } from 'events';
import express from 'express';
import { ServerState } from 'featherstreamer-shared';
import createOPCStream from 'opc';
import createParser, { ParserMessage } from 'opc/parser';
import os from 'os';
import { Number as RuntypesNumber, Record as RuntypesRecord, String as RuntypesString, Undefined } from 'runtypes';
import StrictEventEmitter from 'strict-event-emitter-types';
import { forgetDevice, registerDeviceConnection, registerDeviceDisconnection, setDeviceChannel, store as deviceStore, setDeviceBrightness } from './deviceState';
import logger from './logger';
import masterVisibilityManager from './masterVisibilityManager';
import nodeStatusManager from './nodeStatusManager';
import OPCManager from './OPCManager';
import { handlePress, handleRelease, handleTurnCCW, handleTurnCW } from './rotaryEncoder';

const getSSID = () => {
  return os.hostname();
};

interface ColorEvent {
  deviceId: string,
  index: number,
  r: number,
  g: number,
  b: number,
}

interface Events {
  color: ColorEvent,
}

/**
 * Server running in all operational modes.
 */
export default function server({
  opcManager,
}: {
  opcManager: OPCManager,
}) {
  const eventEmitter: StrictEventEmitter<EventEmitter, Events> =
    new EventEmitter();

  const app = express();

  // Parse POST options.
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  /**
   * Get the SSID of the AP that this device runs in default/slave
   * networking modes.
   */
  app.get('/ssid', (req, res) => {
    res.setHeader('content-type', 'text/plain');
    res.send(getSSID());
  });

  app.get('/state', (req, res) => {
    const deviceState = deviceStore.getState();
    const publicState: ServerState = {
      channels: {},
      devices: {},
      media: {
        names: [],
        currentSelection: '',
      },
      nodeStatus: {
        mode: nodeStatusManager.getMode(),
        isNetworkInterfaceUpdating: nodeStatusManager.isNetworkInterfaceUpdating(),
        isMasterVisible: masterVisibilityManager.isMasterVisible(),
      },
      ssid: getSSID(),
    };
    for (const channel of opcManager.getChannels()) {
      publicState.channels[channel] = {
        description: channel,
      };
    }
    deviceState.get('devices').forEach((device, id) => {
      publicState.devices[id] = device.toJS();
    });

    res.json(publicState);
  });

  /**
   * Get an ongoing stream of pixel data in OPC format for the given
   * channel. This is generally called by slave featherstreamer
   * devices when we're in master mode; data is forwarded to connected
   * feathers.
   */
  app.get('/channels/:id/opc', (req, res) => {
    logger.info(`Direct channel connected: ${req.params.id} from ${req.ip}`);
    const removeStream = opcManager.stream(req.params.id, res);
    const handleDisconnect = () => {
      logger.info(`Direct channel disconnected: ${req.params.id} from ${req.ip}`);
      removeStream();
    };

    // https://stackoverflow.com/questions/6572572/node-js-http-server-detect-when-clients-disconnect
    req.on('close', handleDisconnect);
    req.on('end', handleDisconnect);
  });

  /**
   * Get an ongoing stream of pixel and command data in OPC format for
   * the given device. Dynamically swaps the channel being streamed
   * when the device channel changes. This is generally called by
   * feather devices connected directly to LEDs.
   */
  app.get('/devices/:id/opc', (req, res) => {
    const deviceId = req.params.id;

    logger.info(`Device connected: ${deviceId}`);
    registerDeviceConnection(deviceId);

    let removeStream: () => any = () => {};
    let lastChannelId: string|undefined = undefined;
    let lastBrightness: number|undefined = undefined;

    // Setup function to be invoked on init, and then whenever the
    // channel associated with this device may have changed.
    const setup = () => {
      // Get the latest device state.
      const device = deviceStore.getState().get('devices').get(deviceId);
      if (!device) {
        throw new Error('unexpected');
      }
      const channelId = device.get('channelId');
      const brightness = device.get('brightness');

      if (channelId !== lastChannelId || brightness !== lastBrightness) {
        // Clear out previous stream, if any.
        removeStream();

        const parser = createParser();

        const output = createOPCStream();
        output.pipe(res);

        const removeOPCManagerStream = opcManager.stream(channelId, parser);

        // Adjust brightness before sending to the device.. Note this
        // only gets applied here, at the device level - so it won't
        // get double-applied when streaming data from master.
        parser.on('data', (message: ParserMessage) => {
          // Only transform 8-bit color messages.
          if (message.command === 0) {
            output.writeMessage(
              message.channel,
              message.command,
              message.data.map((v) => Math.floor(v * brightness)),
            );
          } else {
            output.writeMessage(message.channel, message.command, message.data);
          }
        });

        lastChannelId = channelId;
        lastBrightness = brightness;

        removeStream = () => {
          removeOPCManagerStream();
          output.unpipe(res);
          parser.end();
        };
      }
    };

    // Watch for color-change calls received for this device.
    const handleColor = (event: ColorEvent) => {
      if (event.deviceId === deviceId) {
        // Stop streaming data momentarily to avoid interleaving.
        removeStream();

        const index = Math.floor(event.index) % 256;
        const r = Math.floor(event.r) % 256;
        const g = Math.floor(event.g) % 256;
        const b = Math.floor(event.b) % 256;
        logger.info(`Set device ${deviceId} color: #${r.toString(16)}${g.toString(16)}${b.toString(16)}`);

        const stream = createOPCStream();
        stream.pipe(res);

        const data = new Uint8Array(6);

        // Sysex command identifier 6.
        data[0] = 6;
        data[1] = 0;

        // Color data for the sysex command.
        data[2] = index;
        data[3] = r;
        data[4] = g;
        data[5] = b;

        // @ts-ignore
        logger.debug(`Sending bytes: ${Array.apply([], data).join(",")}`);

        // 255 is the generic sysex command.
        stream.writeMessage(0, 255, data);

        removeStream = () => {
          stream.unpipe(res);
        };

        lastChannelId = undefined;
        setup();
      }
    };
    eventEmitter.on('color', handleColor);
    
    const unsubscribeDeviceStore = deviceStore.subscribe(() => {
      setup();
    });
    setup();

    const handleDisconnect = () => {
      logger.info(`Device disconnected: ${req.params.id}`);
      removeStream();
      registerDeviceDisconnection(req.params.id);
      eventEmitter.off('color', handleColor);
      unsubscribeDeviceStore();
    };

    // https://stackoverflow.com/questions/6572572/node-js-http-server-detect-when-clients-disconnect
    req.on('close', handleDisconnect);
    req.on('end', handleDisconnect);
  });

  app.delete('/devices/:id', (req, res) => {
    forgetDevice(req.params.id);
    res.status(204).send();
  });

  app.put('/devices/:id', (req, res) => {
    const deviceId = req.params.id;
    const ColorDimension = RuntypesNumber.withConstraint((n) => {
      return n >= 0 && n < 256 && Number.isInteger(n);
    });
    const Params = RuntypesRecord({
      channelId: RuntypesString.Or(Undefined),
      index: RuntypesNumber,
      color: RuntypesRecord({
        r: ColorDimension,
        g: ColorDimension,
        b: ColorDimension,
      }).Or(Undefined),
      brightness: RuntypesNumber.Or(Undefined),
    });

    const body = req.body;
    if (Params.guard(body)) {
      if (body.channelId) {
        setDeviceChannel({
          deviceId,
          channelId: body.channelId
        });
      }
      if (body.color) {
        eventEmitter.emit('color', { deviceId, index: body.index, ...body.color });
      }
      if (body.brightness) {
        setDeviceBrightness({
          deviceId,
          brightness: body.brightness,
        });
      }
      res.status(204).send();
    } else {
      logger.warn(`Invalid request body: ${JSON.stringify(body)}`);
      res.status(422).send();
    }
  });

  /**
   * Actions to simulate interaction with the rotary encoder.
   */
  app.post('/rotaryEncoder/cw', (req, res) => {
    handleTurnCW();
    res.status(204).send();
  });
  app.post('/rotaryEncoder/ccw', (req, res) => {
    handleTurnCCW();
    res.status(204).send();
  });
  app.post('/rotaryEncoder/press', (req, res) => {
    handlePress();
    res.status(204).send();
  });
  app.post('/rotaryEncoder/release', (req, res) => {
    handleRelease();
    res.status(204).send();
  });

  return app;
}