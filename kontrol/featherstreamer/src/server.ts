import * as express from 'express';
import * as os from 'os';
import * as bodyParser from 'body-parser';
import OPCManager from './OPCManager';
import { handleTurnCW, handleTurnCCW, handlePress, handleRelease } from './rotaryEncoder';
import { registerDeviceConnection, store as deviceStore, forgetDevice, setDeviceChannel, registerDeviceDisconnection } from './deviceState';
import { Record as RuntypesRecord, String as RuntypesString } from 'runtypes';
import { ServerState } from 'featherstreamer-shared';
import nodeStatusManager from './nodeStatusManager';
import logger from './logger';
import masterVisibilityManager from './masterVisibilityManager';

const getSSID = () => {
  return os.hostname();
};

/**
 * Server running in all operational modes.
 */
export default function server({
  opcManager,
}: {
  opcManager: OPCManager,
}) {
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
    logger.info(`Device connected: ${req.params.id}`);
    registerDeviceConnection(req.params.id);

    let removeStream: () => any = () => {};
    let lastChannelId: string|undefined = undefined;

    // Setup function to be invoked on init, and then whenever the
    // channel associated with this device may have changed.
    const setup = () => {
      // Get the latest device state.
      const device = deviceStore.getState().get('devices').get(req.params.id);
      if (!device) {
        throw new Error('unexpected');
      }
      const channelId = device.get('channelId');

      if (channelId !== lastChannelId) {
        // Clear out previous stream, if any.
        removeStream();
        removeStream = opcManager.stream(channelId, res);
        lastChannelId = channelId;
      }
    };

    deviceStore.subscribe(() => {
      setup();
    });
    setup();

    const handleDisconnect = () => {
      logger.info(`Device disconnected: ${req.params.id}`);
      removeStream();
      registerDeviceDisconnection(req.params.id);
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
    const Params = RuntypesRecord({
      channelId: RuntypesString,
    });

    const body = req.body;
    if (Params.guard(body)) {
      setDeviceChannel({
        deviceId: req.params.id,
        channelId: body.channelId
      });
    } else {
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