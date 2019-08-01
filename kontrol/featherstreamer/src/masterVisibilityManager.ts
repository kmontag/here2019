import axios from 'axios';
import StrictEventEmitter from 'strict-event-emitter-types';
import { EventEmitter } from 'events';
import { getConfig } from './config';
import nodeStatusManager, { NodeStatusManager } from './nodeStatusManager';
import logger from './logger';

export interface MasterVisibleChangedEvent {
  masterVisible: boolean|undefined;
}

interface Events {
  masterVisibleChanged: MasterVisibleChangedEvent;
}

/**
 * Once started, checks continuously when in slave mode for the
 * presence of a master node.
 */
export class MasterVisibilityManager {
  private readonly host: string;
  private readonly port: number;
  private readonly checkEveryMs: number;
  private readonly nodeStatusManager: NodeStatusManager;

  private masterVisible: boolean|undefined = undefined;

  private readonly eventEmitter: StrictEventEmitter<EventEmitter, Events> =
    new EventEmitter();

  private isStopped: boolean = false;
  private whenStopCompleted: Promise<void>|undefined = undefined;

  constructor({
    host,
    port,
    checkEveryMs = 1000,
    nodeStatusManager,
  }: {
    host: string,
    port: number,
    checkEveryMs?: number,
    nodeStatusManager: NodeStatusManager,
  }) {
    this.host = host;
    this.port = port;
    this.checkEveryMs = checkEveryMs;
    this.nodeStatusManager = nodeStatusManager;
  }

  /**
   * Get the result of our last check for the master node. `undefined`
   * means that no recent checks have been run, i.e. we're in a mode
   * where this doesn't matter.
   */
  isMasterVisible(): boolean|undefined {
    return this.masterVisible;
  }

  start() {
    if (this.isStopped) {
      throw new Error('can only start checking master visibility once');
    }
    logger.info('Started checking master visibility');
    this.whenStopCompleted = (async () => {
      while (!this.isStopped) {
        const whenNextCheck = new Promise<void>((resolve) => {
          setTimeout(resolve, this.checkEveryMs);
        });

        const prevMasterVisible = this.masterVisible;

        if (this.nodeStatusManager.getMode() === 'slave') {
          const url = `http://${this.host}:${this.port}/ssid`;
          //logger.debug(`Checking for master controller at ${url}...`);
          try {
            const response = await axios.get(url, {
              timeout: this.checkEveryMs,
            });
            //logger.debug(`successfully connected to master, checking response status...`);
            this.masterVisible = (response.status >= 200 && response.status < 300);
          } catch (e) {
            logger.debug(`could not connect to master, error was ${e}`);
            this.masterVisible = false;
          }
          //logger.debug(`master is ${this.masterVisible ? '' : 'not '}visible`);
        } else {
          this.masterVisible = undefined;
        }

        if (prevMasterVisible !== this.masterVisible) {
          logger.info(this.masterVisible ? 'master is now visible' : 'master is no longer visible');
          this.eventEmitter.emit('masterVisibleChanged', {
            masterVisible: this.masterVisible,
          });
        }

        await whenNextCheck;
      }
    })();
  }

  async stop() {
    this.isStopped = true;
    if (this.whenStopCompleted) {
      await this.whenStopCompleted;
    }
  }

  onMasterVisibleChanged(callback: (event: MasterVisibleChangedEvent) => any): (() => void) {
    const wrapped = ((event: MasterVisibleChangedEvent) => callback(event));
    this.eventEmitter.on('masterVisibleChanged', wrapped);
    return (() => {
      this.eventEmitter.off('masterVisibleChanged', wrapped);
    });
  }
}

const masterVisibilityManager = new MasterVisibilityManager({
  host: getConfig().masterHost,
  port: getConfig().masterPort,
  nodeStatusManager,
});
export default masterVisibilityManager;