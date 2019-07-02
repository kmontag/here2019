import { Record, Boolean, String, Number, Static } from 'runtypes';
import * as fs from 'fs';

const CONFIG_FILE = '/etc/featherstreamer.conf';
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
   * Where to look for the master device.
   */
  masterHost: String,
  masterPort: Number,
});
type Config = Static<typeof Config>;

// Defaults for local dev.
const defaultConfig: Config = {
  fakeSystemCalls: true,
  eagerSlave: false,
  masterHost: '192.168.9.1',
  masterPort: 44668,
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