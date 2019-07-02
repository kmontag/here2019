import * as express from 'express';
import * as os from 'os';
import * as bodyParser from 'body-parser';
import OPCManager from './OPCManager';
import { handleTurnCW, handleTurnCCW, handlePress, handleRelease } from './rotaryEncoder';
import { registerDeviceConnection, store as deviceStore, forgetDevice, setDeviceChannel, registerDeviceDisconnection } from './deviceState';
import { Record as RuntypesRecord, String as RuntypesString } from 'runtypes';
import { ServerState } from 'featherstreamer-shared';
import nodeStatusManager from './nodeStatusManager';

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
        isMasterVisible: false,
      },
      ssid: getSSID(),
    };
    // deviceState.get('channels').forEach((channel, id) => {
    //   publicState.channels[id] = channel.toJS();
    // });
    deviceState.get('devices').forEach((device, id) => {
      publicState.devices[id] = device.toJS();
    });

    res.json(publicState);
  });

  /**
   * Get an ongoing stream of pixel data in OPC format for the given
   * channel.
   */
  app.get('/device/:id/opc', (req, res) => {
    registerDeviceConnection(req.params.id);
    const device = deviceStore.getState().get('devices').get(req.params.id);
    if (!device) {
      throw new Error('unexpected');
    }

    const removeStream = opcManager.stream(device.get('channelId'), res);
    const handleDisconnect = () => {
      removeStream();
      registerDeviceDisconnection(req.params.id);
    };

    // https://stackoverflow.com/questions/6572572/node-js-http-server-detect-when-clients-disconnect
    req.on('close', handleDisconnect);
    req.on('end', handleDisconnect);
  });

  app.delete('/device/:id', (req, res) => {
    forgetDevice(req.params.id);
    res.status(204).send();
  });

  app.put('/device/:id', (req, res) => {
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