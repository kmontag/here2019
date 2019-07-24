import { Record, Boolean, String, Number as RuntypesNumber, Static } from 'runtypes';
import * as env from 'env-var';
import * as fs from 'fs';
import * as path from 'path';
import logger from './logger';

const CONFIG_FILE = env.get('CONFIG', path.join(__dirname, '..', 'featherstreamer.conf.json')).asString();
const Config = Record({
  /**
   * If true, don't actually call `feathernet` when changing
   * mode. Useful for local dev.
   */
  fakeSystemCalls: Boolean,

  /**
   * If true, set up system networking in slave mode even when the
   * application is in isolated mode. This enables quick switching
   * into application-side slave mode (since we don't need to reboot
   * the network interface), but means that we can't use the interface
   * for internet access, which is a hassle in development.
   */
  eagerSlave: Boolean,

  /**
   * Directory containing compiled frameplayer files.
   */
  mediaBuildDir: String,

  /**
   * Directory to watch for media sources to compile.
   */
  mediaSrcDir: String,

  /**
   * Filename to store persistent state.
   */
  stateFile: String,

  /**
   * Where to look for the master device.
   */
  masterHost: String,
  masterPort: RuntypesNumber,

  /**
   * Number between 0 and 1. Brightness for newly attached devices.
   */
  defaultBrightness: RuntypesNumber,
});
type Config = Static<typeof Config>;

// Defaults for local dev.
const defaultConfig: Config = {
  fakeSystemCalls: true,
  eagerSlave: false,
  mediaBuildDir: path.join(__dirname, '..', '..', 'media-build'),
  mediaSrcDir: path.join(__dirname, '..', '..', 'media-src'),
  stateFile: path.join(__dirname, '..', 'state.json'),
  masterHost: '192.168.9.1',
  masterPort: 44668,
  defaultBrightness: 0.3,
};

let config: Config|undefined = undefined;
export function getConfig(): Readonly<Config> {
  if (!config) {
    logger.debug(`Reading config file: ${CONFIG_FILE}`);
    try {
      const configStr = fs.readFileSync(CONFIG_FILE, { encoding: 'utf8' });
      config = Config.check(Object.assign({}, defaultConfig, JSON.parse(configStr)));
    } catch (e) {
      // Defaults for dev.
      logger.warn(`Could not read config file: ${CONFIG_FILE}`);
      config = defaultConfig;
    }
  }

  return config;
}