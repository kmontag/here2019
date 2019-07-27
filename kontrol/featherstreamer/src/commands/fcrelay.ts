import env from 'env-var';
import { spawn, ChildProcess } from 'child_process';
import axios, { CancelTokenSource } from 'axios';
import logger from '../logger';
import ReconnectingWebSocket, { Event } from 'reconnecting-websocket';
import WS from 'ws';
import { Readable } from 'stream';
import { Record, Literal, Array as RuntypesArray, String as RuntypesString, Number as RuntypesNumber, Static } from 'runtypes';
import debounce from 'debounce';
import { Lock } from 'semaphore-async-await';
import tmp from 'tmp';
import fs from 'fs';
import hash from 'object-hash';

// import createOPCStream from 'opc';
// const createStrand = require('opc/strand');
// const createParser = require('opc/parser');

const DevicesArray = RuntypesArray(Record({
  type: RuntypesString,
  serial: RuntypesString,
  timestamp: RuntypesNumber,
  version: RuntypesString,
  bcd_version: RuntypesNumber,
}));
type DevicesArray = Static<typeof DevicesArray>;

const ListConnectedDevicesResponse = Record({
  type: Literal('list_connected_devices'),
  devices: DevicesArray,
});
type ListConnectedDevicesResponse = Static<typeof ListConnectedDevicesResponse>;

const ConnectedDevicesChangedResponse = Record({
  type: Literal('connected_devices_changed'),
  devices: DevicesArray,
});

interface DeviceConfig {
  type: string;
  serial?: string;
  led?: boolean;
  dither?: boolean;
  interpolate?: boolean;
  map?: ([number, number, number, number]|[number, number, number, number, string])[];
};

/**
 * Continually check if a FadeCandy is connected, and if so, connect
 * to the main server and relay data for all channels.
 */
export default async function fcrelay() {
  const featherstreamerHost = env.get('FEATHERSTREAMER_HOST', '127.0.0.1').asString();
  const featherstreamerPort = env.get('FEATHERSTREAMER_PORT', '44668').asPortNumber();

  const fadecandyHost = env.get('FADECANDY_HOST', '127.0.0.1').asString();
  const fadecandyPort = env.get('FADECANDY_PORT', '7890').asPortNumber();

  const fcserverLock = new Lock();
  let fcserverRun: {
    process: ChildProcess,
    whenExited: Promise<void>,
    config: object,
  }|undefined = undefined;

  // const fcserver = (c: object) => {};
  //@ts-ignore
  const fcserver = async (config: object) => {
    await fcserverLock.acquire();
    try {
      const configStr = JSON.stringify(config);
      let shouldContinue: boolean = true;
      if (fcserverRun) {
        const prevConfigHash = hash(fcserverRun.config);
        const configHash = hash(config);
        if (configHash === prevConfigHash) {
          logger.debug(`Not restarting fcserver with identical config: ${configStr}`);
          shouldContinue = false;
        } else {
          fcserverRun.process.kill();
          try {
            await fcserverRun.whenExited;
          } catch (e) {
            logger.warn(`Previous fcserver finished with error: ${e}`);
          }
        }
      }

      if (shouldContinue) {
        const configPath = await (new Promise<string>((resolve, reject) => {
          tmp.file((err, path, fd, cleanupCallback) => {
            if (err) {
              reject(err);
            } else {
              resolve(path);
            }
          });
        }));

        await fs.promises.writeFile(configPath, JSON.stringify(config), { encoding: 'utf8' });

        logger.info(`Starting fcserver with config: ${configStr}`);

        console.log(configPath);
        const process = spawn('fcserver', [configPath]);
        const whenExited = new Promise<void>((resolve, reject) => {
          process.on('exit', (code, signal) => {
            if (code === 0 || code === null) {
              resolve();
            } else {
              reject(new Error(`non-zero exit code: ${code}`));
            }
          });
          process.on('error', reject);
        });
        fcserverRun = { process, whenExited, config };

        process.stdout.on('data', (data) => logger.debug(`--> ${data.toString()}`));
        process.stderr.on('data', (data) => logger.debug(`--> ${data.toString()}`));
      }
    } catch (e) {
      logger.error(`Caught error while starting fcserver: ${e}`);
      throw e;
    } finally {
      fcserverLock.release();
    }
  };

  const wsUrl = `ws://${fadecandyHost}:${fadecandyPort}`;
  const webSocket = new ReconnectingWebSocket(wsUrl, [], {
    WebSocket: WS,
  });
  webSocket.addEventListener('open', (event: Event) => {
    logger.info(`connected to websocket on ${wsUrl}`);
    refresh();
  });

  let latestCancelSources: CancelTokenSource[] = [];

  const refresh = debounce(() => {
    webSocket.send(JSON.stringify({type: 'list_connected_devices'}));
  }, 1000);

  let devicesUpdatedCount = 0;

  const handleDevicesUpdated = (devices: DevicesArray) => {
    logger.debug(`Generating config for devices: [${devices.join(',')}]`);
    const currDevicesUpdatedCount = devicesUpdatedCount;
    devicesUpdatedCount++;
    // Cancel previous requests.
    for (const cancelSource of latestCancelSources) {
      cancelSource.cancel();
    }
    latestCancelSources = [];

    const configObj = {
      listen: [fadecandyHost, fadecandyPort],
      relay: null,
      verbose: true,
      color: {
        gamma: 2.5,
        whitepoint: [1.0, 1.0, 1.0],
      },
      devices: ([] as DeviceConfig[]),
    };

    let currChannel = 1;
    const NUM_CHANNELS = 8;
    for (const device of devices.sort()) {
      if (device.type === 'fadecandy') {
        const candyCereal = device.serial;
        const map: DeviceConfig['map'] = [];

        for (let i = 0; i < NUM_CHANNELS; i++) {
          const channel = currChannel;
          if (channel > 255) {
            throw new Error('More than 31 devices not supported');
          }
          map.push([channel, 0, i * 64, 64]);

          const cancelSource = axios.CancelToken.source();
          latestCancelSources.push(cancelSource);

          const url = `http://${featherstreamerHost}:${featherstreamerPort}/devices/fadecandy:${candyCereal}:${i}/opc`;
          logger.debug(`Subscribing to ${url}`);
          axios.get(url, {
            cancelToken: cancelSource.token,
            responseType: 'stream',
          }).then((response) => {
            const responseStream: Readable = response.data;
            responseStream.on('data', (data: Buffer) => {
              const dataArray = Uint8Array.from(data);
              // Modify the packet to stream to the configured OPC channel,
              // and clear the size information in accordance with
              // https://github.com/scanlime/fadecandy/blob/master/doc/fc_protocol_websocket.md.
              dataArray.set([channel, 0, 0, 0], 0);
              webSocket.send(dataArray.buffer);
            });
            responseStream.on('error', (err) => {
              logger.error(`Caught error during featherstreamer streaming, will try again: ${err}`);
              refresh();
            });
            responseStream.on('end', () => {
              if (devicesUpdatedCount === currDevicesUpdatedCount) {
                logger.error(`featherstreamer stream ended unexpectedly, will try again`);
                refresh();
              }
            });
          }).catch((err) => {
            logger.error(`Caught error connecting to featherstreamer, will try again: ${err}`);
            refresh();
          });

          currChannel++;
        }

        const deviceConfig: DeviceConfig = {
          type: 'fadecandy',
          serial: candyCereal,
          map
        };
        // const packet = {
        //   type: 'device_options',
        //   'device': {
        //     type: 'fadecandy',
        //     serial: candyCereal,
        //   },
        //   options: deviceConfig,
        // };
        // webSocket.send(JSON.stringify(packet));
        // logger.debug(`Updating device config with message: ${JSON.stringify(packet)}`);
        configObj.devices.push(deviceConfig)
      }
    }

    // Needed to get new fadecandy devices to be recognized when none
    // are currently present in the config.
    if (configObj.devices.length === 0) {
      configObj.devices.push({
        type: 'fadecandy',
        map: [[0, 0, 0, 512]],
      });
    }

    fcserver(configObj);
  };

  webSocket.addEventListener('message', (event: MessageEvent) => {
    logger.debug(`got message: ${event.data}`);
    const data = JSON.parse(event.data);
    if (ListConnectedDevicesResponse.guard(data) || ConnectedDevicesChangedResponse.guard(data)) {
      handleDevicesUpdated(data.devices);
    } else {
      logger.info(`Unhandled message: ${event.data}`);
    }
  });

  handleDevicesUpdated([]);


  // let teardownCurrent: (() => Promise<any>) = async () => undefined;

  // const setupLock = new Lock();

  // /**
  //  * @param candies Serial numbers of connected FadeCandies.
  //  */
  // const setup = async (candies: string[]) => {
  //   await setupLock.acquire();
  //   try {
  //     logger.info(`Setting up fadecandies: ${candies.join(', ')}`);
  //     await teardownCurrent();

  //     // Start the fadecandy server
  //     const fcserver = exec('fcserver');
  //     const whenFcserverExits = new Promise((resolve, reject) => {
  //       fcserver.on('error', reject);
  //       fcserver.on('exit', resolve);
  //     });

  //     const opcCancelSources: CancelTokenSource[] = [];
  //     const teardownCallbacks: (() => any)[] = [];

  //     // Set up the teardown listener before anything else, so we can
  //     // make nested `setup()` calls in case of fcserver failures.
  //     teardownCurrent = async () => {
  //       fcserver.kill();
  //       for (const cancelSource of opcCancelSources) {
  //         cancelSource.cancel();
  //       }
  //       for (const removeListenerCallback of teardownCallbacks) {
  //         removeListenerCallback();
  //       }
  //       try {
  //         await whenFcserverExits;
  //       } catch (e) {
  //         logger.warn(`Error when killing fadecandy server: ${e}`);
  //       }
  //     }

  //     let rws: ReconnectingWebSocket|undefined = undefined;
  //     const whenConnected = new Promise<void>((resolve, reject) => {
  //       // Fail if we can't connect after this long.
  //       setTimeout(reject, 20000);
  //       rws = new ReconnectingWebSocket(`ws://${fadecandyHost}:${fadecandyPort}`);

  //       // Set up listeners synchronously.
  //       const handleOpen = (event: Event) => {
  //         resolve();
  //       };
  //       rws.addEventListener('open', handleOpen);

  //       const handleMessage = (event: MessageEvent) => {
  //         console.log(event);
  //       };
  //       rws.addEventListener('message', handleMessage);

  //       teardownCallbacks.push(() => {
  //         if (!rws) {
  //           throw new Error('unexpected');
  //         }
  //         rws.removeEventListener('open', handleOpen);
  //         rws.removeEventListener('message', handleMessage);
  //         rws.close();
  //       });
  //     });

  //     await whenConnected;

  //     for (const candyCereal of candies) {
  //       const url = `http://${featherstreamerHost}:${featherstreamerPort}/devices/fc:${candyCereal}/opc`;
  //       const cancelSource = axios.CancelToken.source();
  //       opcCancelSources.push(cancelSource);
  //       const response = await axios.get(url, {
  //         responseType: 'stream',
  //         cancelToken: cancelSource.token,
  //       });

  //       const responseStream: Readable = response.data;
  //       const handleData = (
  //       responseStream.on('data', handleData);
  //       // const handleData = (message: {
  //       //   channel: number,
  //       //   command: number,
  //       //   data: Buffer,
  //       // }) => {

  //       // }
  //     }
  //   } catch (e) {
  //     logger.error(`Error during setup: ${e}`);
  //     setupLock.release();
  //     setup(candies);
  //   }
  // }

  // await setup([]);

}
