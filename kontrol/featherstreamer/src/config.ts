import { Record, Boolean, String, Number, Static } from 'runtypes';
import * as env from 'env-var';
import * as fs from 'fs';
import * as path from 'path';

const CONFIG_FILE = env.get('CONFIG', '/etc/featherstreamer.conf').asString();
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
  mediaDir: String,

  /**
   * Where to look for the master device.
   */
  masterHost: String,
  masterPort: Number,

  /**
   * Number between 0 and 1.
   */
  brightness: Number,
});
type Config = Static<typeof Config>;

// Defaults for local dev.
const defaultConfig: Config = {
  fakeSystemCalls: true,
  eagerSlave: false,
  mediaDir: path.join(__dirname, '..', '..', 'media-build'),
  masterHost: '192.168.9.1',
  masterPort: 44668,
  brightness: 0.3,
};

let config: Config|undefined = undefined;
export function getConfig(): Readonly<Config> {
  if (!config) {
    try {
      const configStr = fs.readFileSync(CONFIG_FILE, { encoding: 'utf8' });
      config = Config.check(Object.assign({}, defaultConfig, JSON.parse(configStr)));
    } catch (e) {
      // Defaults for dev.
      config = defaultConfig;
    }
  }

  return config;
}