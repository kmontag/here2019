/**
 * State management related to this device's role as a member of the
 * wider featherstreamer network.
 */
import persistentState, { PersistentState } from './persistentState';
import { Mode } from 'featherstreamer-shared';
import { Lock } from 'semaphore-async-await';
import { getConfig } from './config';
import { EventEmitter } from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';
import logger from './logger';
import { exec } from 'child_process';
import tmp from 'tmp';
import fs from 'fs';

const PromiseController: any = require('promise-controller');

const PERSISTENT_STATE_MODE_KEY = 'mode';

export interface ModeChangedEvent {
  prevMode: Mode;
  mode: Mode;

    /**
     * The return value of the corresponding `setMode` call.
     */
  whenSystemUpdated: Promise<boolean>;
}

interface Events {
  modeChanged: ModeChangedEvent;
}

export class NodeStatusManager {

  /**
   * Locked while a system call is running to configure the network
   * interface to enter a new mode.
   */
  private readonly setModeLock: Lock = new Lock();

  private readonly eventEmitter: StrictEventEmitter<EventEmitter, Events> =
    new EventEmitter();

  private setModeIndex: number = 0;

  constructor(
    private readonly persistentState: PersistentState
  ) {
    this.eventEmitter.setMaxListeners(100);

    // Run initial setup.
    this.setMode(this.getMode());
  }

  getMode(): Mode {
    const existingMode = this.persistentState.get(PERSISTENT_STATE_MODE_KEY);
    if (Mode.guard(existingMode)) {
      return existingMode;
    } else {
      if (existingMode) {
        logger.warn(`Did not recognize existing mode: ${existingMode}`);
      } else {
        logger.info('No existing mode saved');
      }
      return 'isolated';
    }
  }

  /**
   * Set the node mode (master, slave, or isolated) and start updating
   * system networking config accordingly. We'll always wait for the
   * previous mode change to finish before starting this one.
   *
   * If `setMode` is called multiple times while a system call is
   * still running from a previous `setMode` call, we'll only fire a
   * new system call for the most recent mode when the previous system
   * call finishes. This is to prevent lots of slow system calls from
   * stacking up on one another.
   *
   * The return value resolves true when a system call fires and
   * succeeds for this change, or false if the change gets
   * "overridden" by another one as described above.
   */
  setMode(mode: Mode): Promise<boolean> {
    logger.info(`Setting mode: ${mode}`);
    const prevMode = this.getMode();

    this.persistentState.set(PERSISTENT_STATE_MODE_KEY, mode);
    this.setModeIndex++;
    const currentSetModeIndex = this.setModeIndex;

    const whenSystemUpdated = new PromiseController();
    this.eventEmitter.emit('modeChanged', {
      prevMode,
      mode,
      whenSystemUpdated: whenSystemUpdated.promise,
    });

    (async () => {
      let didRun: boolean = false;
      await this.setModeLock.acquire();

      try {
        // Skip setting the mode if we've had any calls since we started
        // waiting.
        if (this.setModeIndex === currentSetModeIndex) {
          logger.info(`Switching to mode: ${mode}`);
          if (getConfig().fakeSystemCalls) {
            logger.info(`(System call suppressed due to config...)`);
            await new Promise((resolve) => {
              setTimeout(resolve, 3000);
            });
          } else {
            const systemMode = {
              master: 'master',
              slave: 'slave',
              pairing: 'pairing',
              isolated: getConfig().eagerSlave ? 'slave' : 'default',
            }[mode];
            if (!systemMode) {
              throw new Error('unexpected');
            }

            /**
             * Run the actual command to switch network config. See the
             * ansible `access_point` role for more info.
             */
            logger.debug(`System mode is: ${systemMode}`);

            // Dumb hack, child_process stuff often seems to not fire the
            // exit event. Unclear why.
            const tmpFile = await new Promise<string>((resolve, reject) => {
              tmp.file({ prefix: 'featherstreamer-mode-change-' }, (err, path, fd, cleanupCallback) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(path);
                }
              });
            });

            const process = exec(`feathernet ${systemMode} && rm ${tmpFile}`);
            // const process = spawn('feathernet', [systemMode], { timeout: 10000 });
            // process.stdin.end();
            // Can be enabled for debugging (after removing the stdio
            // config option), but may cause the process never to
            // exit.
            // process.stdout.on('data', (data) => logger.debug(`--> ${data.toString()}`));
            // process.stderr.on('data', (data) => logger.debug(`--> ${data.toString()}`));
            const whenExited = new Promise<void>((resolve, reject) => {

              // The events below don't seem to fire sometimes, check
              // for the presence of the tmp file.
              const interval = setInterval(() => {
                try {
                  fs.accessSync(tmpFile);
                } catch (e) {
                  logger.debug(`feathernet exit detected after removal of ${tmpFile}`);
                  clearInterval(interval);
                  resolve();
                }
              }, 1000);
              process.on('exit', (code, signal) => {
                logger.debug(`feathernet exited with code ${code}`);
                if (code === 0 || code === null) {
                  resolve();
                } else {
                  reject(new Error(`non-zero exit code: ${code}`));
                }
              });
              process.on('error', (e) => {
                logger.error(`Error running feathernet: ${e instanceof Error ? e.stack : e}`);
                clearInterval(interval);
                reject(e);
              });
            });

            try {
              await whenExited;
            } catch (e) {
              logger.error(`Error switching network config: ${e instanceof Error ? e.stack : e}`);
              throw e;
            }
          }
          didRun = true;
        } else {
          logger.debug(`Skipped setting mode to ${mode}, new calls exist in the meantime`);
        }
      } catch (e) {
        whenSystemUpdated.reject(e);
      } finally {
        this.setModeLock.release();
      }
      whenSystemUpdated.resolve(didRun);
    })();

    return whenSystemUpdated.promise;
  }

  /**
   * Whether the system's network interface is currently being updated
   * as part of a mode change.
   */
  isNetworkInterfaceUpdating(): boolean {
    return this.setModeLock.getPermits() === 0;
  }

  /**
   * Fires callback every time `setMode` is called.
   *
   * Returns a function which can be called to remove the listener.
   */
  onModeChanged(callback: (event: ModeChangedEvent) => any): (() => void) {
    const wrapped = ((event: ModeChangedEvent) => callback(event));
    this.eventEmitter.on('modeChanged', wrapped);
    return (() => {
      this.eventEmitter.off('modeChanged', wrapped);
    });
  }
}

const nodeStatusManager = new NodeStatusManager(persistentState);
export default nodeStatusManager;