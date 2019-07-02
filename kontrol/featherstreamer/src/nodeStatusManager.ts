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
import { promisify } from 'util';

const PromiseController: any = require('promise-controller');

const PERSISTENT_STATE_MODE_KEY = 'mode';

interface ModeChangeEvent {
  prevMode: Mode;
  mode: Mode;

    /**
     * The return value of the corresponding `setMode` call.
     */
  whenSystemUpdated: Promise<boolean>;
}

interface Events {
  modeChange: ModeChangeEvent;
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
    // Run initial setup.
    this.setMode(this.getMode());
  }

  getMode(): Mode {
    const existingMode = this.persistentState.get(PERSISTENT_STATE_MODE_KEY);
    if (Mode.guard(existingMode)) {
      return existingMode;
    } else {
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
    const prevMode = this.getMode();

    this.persistentState.set(PERSISTENT_STATE_MODE_KEY, mode);
    this.setModeIndex++;
    const currentSetModeIndex = this.setModeIndex;

    const whenSystemUpdated = new PromiseController();
    this.eventEmitter.emit('modeChange', {
      prevMode,
      mode,
      whenSystemUpdated: whenSystemUpdated.promise,
    });

    (async () => {
      let didRun: boolean = false;
      await this.setModeLock.acquire();

      // Skip setting the mode if we've had any calls since we started
      // waiting.
      if (this.setModeIndex === currentSetModeIndex) {
        logger.info(`Switching system to mode: ${mode}`);
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
          await promisify(exec)(`feathernet ${systemMode}`);
        }
        didRun = true;
      }

      this.setModeLock.release();
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
  onModeChange(callback: (event: ModeChangeEvent) => any): (() => void) {
    const wrapped = ((event: ModeChangeEvent) => callback(event));
    this.eventEmitter.on('modeChange', wrapped);
    return (() => {
      this.eventEmitter.off('modeChange', wrapped);
    });
  }
}

const nodeStatusManager = new NodeStatusManager(persistentState);
export default nodeStatusManager;