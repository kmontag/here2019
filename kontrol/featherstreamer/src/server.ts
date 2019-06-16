import * as express from 'express';
import * as os from 'os';
import * as bodyParser from 'body-parser';
import OPCManager from './OPCManager';

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
    res.send(os.hostname());
  });

  /**
   * Get an ongoing stream of pixel data in OPC format for the given
   * channel.
   */
  app.get('/opc/:channel', (req, res) => {
    console.log('got got');
    const channel = req.params.channel;
    const stream = opcManager.getStream(channel);

    stream.pipe(res);
    const handleDisconnect = () => {
      stream.unpipe(res);
    };

    // https://stackoverflow.com/questions/6572572/node-js-http-server-detect-when-clients-disconnect
    req.on('close', handleDisconnect);
    req.on('end', handleDisconnect);
  });

  return app;
}