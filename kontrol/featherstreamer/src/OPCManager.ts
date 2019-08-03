import { Writable, Readable } from 'stream';
import { getFrameplayers } from './media';
import logger from './logger';
import StrictEventEmitter from 'strict-event-emitter-types';
import { EventEmitter } from 'events';
import { getConfig } from './config';
import { FrameEvent } from 'frameplayer';
import nodeStatusManager, { NodeStatusManager } from './nodeStatusManager';
import masterVisibilityManager, { MasterVisibilityManager } from './masterVisibilityManager';
import axios from 'axios';

const createOPCStream = require('opc');
const createStrand = require('opc/strand');
const createParser = require('opc/parser');

interface MediaDescriptor {
  readonly name: string,
  readonly type: 'frameplayer',
}

interface MediaIndexChangedEvent {
  prevMediaIndex: number;
  mediaIndex: number;
}

interface LiveChangedEvent {
  isLive: boolean;
}

interface Events {
  mediaIndexChanged: MediaIndexChangedEvent;
  liveChanged: LiveChangedEvent;
}

export default class OPCManager {
  private mediaIndex: number = 0;
  private live: boolean = true;

  private channels: string[]|undefined = undefined;

  private readonly masterVisibilityManager: MasterVisibilityManager;
  private readonly nodeStatusManager: NodeStatusManager;

  private readonly eventEmitter: StrictEventEmitter<EventEmitter, Events> =
    new EventEmitter();

  constructor({
    masterVisibilityManager,
    nodeStatusManager,
  }: {
    masterVisibilityManager: MasterVisibilityManager,
    nodeStatusManager: NodeStatusManager,
  }) {
    this.masterVisibilityManager = masterVisibilityManager;
    this.nodeStatusManager = nodeStatusManager;
  }

  private static instance: OPCManager|undefined = undefined;
  static getInstance() {
    if (!OPCManager.instance) {
      OPCManager.instance = new OPCManager({
        masterVisibilityManager,
        nodeStatusManager,
      });
    }
    return OPCManager.instance;
  }

  /**
   * Start playing media from a different index. The list of media is
   * treated as a "circular" array, i.e. this index can be any
   * integer.
   */
  setMediaIndex(mediaIndex: number) {
    const prevMediaIndex = this.mediaIndex;
    this.mediaIndex = mediaIndex;
    this.eventEmitter.emit('mediaIndexChanged', {
      prevMediaIndex,
      mediaIndex,
    });
  }

  getMediaIndex(): number {
    return this.mediaIndex;
  }

  getMediaDescriptors(): ReadonlyArray<MediaDescriptor> {
    return getFrameplayers().map((f) => {
      return { name: f.name, type: 'frameplayer' };
    });
  }

  /**
   * Turn the lights on or off.
   */
  toggleLive() {
    this.live = !this.live;
    this.eventEmitter.emit('liveChanged', {
      isLive: this.isLive(),
    })
    logger.info(`Lights are ${this.isLive() ? 'on' : 'off'}`);
  }

  isLive() {
    return this.live;
  }

  /**
   * Stream a channel to e.g. an express response object, swapping the
   * content as necessary when e.g. the playing video is cycled, the
   * mode is changed, etc.
   *
   * Returns a callback to stop streaming.
   */
  stream(channel: string, toWritable: Writable): (() => void) {

    const stream = createOPCStream();
    stream.pipe(toWritable);

    /**
     * Remove any current listeners related to playback. Gets updated
     * as state changes.
     */
    let teardownCurrentState: (() => void) = () => {};

    /**
     * Internal state, so we can see if we need to change anything
     * when events occur that might affect the stream source. Note the
     * initial values will always trigger an action on the first call
     * to `setup()`.
     */
    let lastMediaIndex: number = NaN;
    let isStreamingMaster: boolean = false;
    let isStrandCleared: boolean = true;

    const notLiveSetup = () => {
      teardownCurrentState();

      // Just send a single clear-pixels mesage.
      const maxPixels = 1024; // TODO: Could track this dynamically.
      const strand = createStrand(maxPixels);
      for (let i = 0; i < maxPixels; i++) {
        strand.setPixel(i, 0, 0, 0);
      }
      stream.writePixels(0, strand.buffer);

      teardownCurrentState = () => {};
    }

    const localSetup = () => {
      teardownCurrentState();

      const frameplayers = getFrameplayers();

      // Handle negative values, see
      // https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm.
      const realMediaIndex = (this.mediaIndex % frameplayers.length + frameplayers.length) % frameplayers.length;
      const { frameplayer } = frameplayers[realMediaIndex];

      if (!(channel in frameplayer.channels)) {
        logger.warn(`Channel ${channel} not found, falling back to a default value`);
        const defaultChannel = OPCManager.getDefaultChannel();
        if (defaultChannel in frameplayer.channels) {
          channel = defaultChannel;
        } else {
          channel = Object.keys(frameplayer.channels).sort()[0];
        }
      }
      const channelDescriptor = frameplayer.channels[channel];
      if (!channelDescriptor) {
        throw new Error('unexpected');
      }

      const strand = createStrand(channelDescriptor.length);

      const handleFrame = (frame: FrameEvent) => {
        const channelData = frame.channels[channel];
        for (let i = 0; i < channelData.pixels.length; i++) {
          const pixel = channelData.pixels[i];
          strand.setPixel(i, Math.floor(pixel.r), Math.floor(pixel.g), Math.floor(pixel.b));
        }
        stream.writePixels(0, strand.buffer);
      };
      frameplayer.on('frame', handleFrame);

      // Refresh state if the frameplayer is stopped while playing.
      const handleStop = () => {
        setup();
      };
      frameplayer.on('stop', handleStop);

      teardownCurrentState = () => {
        frameplayer.off('frame', handleFrame);
        frameplayer.off('stop', handleStop);
      };
    };

    const masterSetup = () => {
      teardownCurrentState();

      let isStillActive = true;
      let endCurrentStream: () => any = () => {};

      const url = `http://${getConfig().masterHost}:${getConfig().masterPort}/channels/${channel}/opc`;
      (async () => {
        // Stream data, repeatedly reconnecting if the connection
        // drops or there's a problem with the endpoint.
        while (isStillActive) {
          try {
            const cancelSource = axios.CancelToken.source();
            const response = await axios.get(url, {
              responseType: 'stream',
              cancelToken: cancelSource.token,
            });
            // Make sure we haven't gone inactive in the meantime.
            if (isStillActive) {
              const responseStream: Readable = response.data;

              // Promise controller actions and state. The callbacks
              // will always work to complete the `whenDoneReceiving`
              // promise, even if its callback hasn't yet fired.
              let isResolved: boolean = false;
              let isRejected: boolean = false;
              let resolve: () => void = () => {
                isResolved = true;
              };
              let reject: () => void = () => {
                isRejected = true;
              };
              const whenDoneReceiving = new Promise<void>((_resolve, _reject) => {
                if (isRejected) {
                  _reject();
                } else if (isResolved) {
                  _resolve();
                } else {
                  const oldResolve = resolve;
                  const oldReject = reject;
                  resolve = () => {
                    oldResolve();
                    _resolve();
                  };
                  reject = () => {
                    oldReject();
                    _reject();
                  }
                }
              });


              // Pipe through a parser and stream only full messages,
              // so we don't end up breaking the stream partway
              // through a message if the connection is lost or torn
              // down.
              const handleData = (message: {
                channel: number,
                command: number,
                data: Buffer,
              }) => {
                stream.writeMessage(message.channel, message.command, message.data);
              };
              const readable: Readable = responseStream.pipe(createParser());
              readable.on('data', handleData);

              // Let the teardown callback force us to exit this
              // loop. No-op if called more than once.
              endCurrentStream = () => {
                readable.off('data', handleData);
                cancelSource.cancel('master connection no longer needed');
                resolve();
              };

              // Wait for `endCurrentStream` (via
              // `teardownCurrentState`) to get called, or for the
              // stream to end/error out "naturally."
              await whenDoneReceiving;
            }
          } catch (e) {
            // Pause briefly to avoid sending tons of failing requests in succession.
            await new Promise<void>((resolve) => {
              setTimeout(resolve, 500);
            });
          } finally {
            // No-op if this function has already been called. Note we
            // depend on this variable not being modified outside of
            // this loop, even though it's accessible in the outer
            // context as well.
            endCurrentStream();
          }
        }
      })();

      teardownCurrentState = () => {
        isStillActive = false;
        endCurrentStream();
      };

    };

    const setup = () => {
      if (this.isLive()) {
        const shouldStreamMaster = (
          this.nodeStatusManager.getMode() === 'slave' &&
            this.masterVisibilityManager.isMasterVisible() === true
        );
        if (shouldStreamMaster) {
          if (!isStreamingMaster || isStrandCleared) {
            logger.debug(`Streaming from master on channel ${channel}`);
            isStreamingMaster = true;
            masterSetup();
          }
        } else {
          if (isStreamingMaster || lastMediaIndex !== this.mediaIndex || isStrandCleared) {
            logger.debug(`Streaming local media on channel ${channel}`);
            isStreamingMaster = false;
            lastMediaIndex = this.mediaIndex;
            localSetup();
          }
        }
        isStrandCleared = false;
      } else {
        logger.debug(`Clearing pixels on channel ${channel}`);
        notLiveSetup();
        isStrandCleared = true;
      }
    };

    const removeModeChangedListener = this.nodeStatusManager.onModeChanged((event) => {
      setup();
    });

    const removeMasterVisibleChangedListener = this.masterVisibilityManager.onMasterVisibleChanged((event) => {
      setup();
    });

    const handleMediaIndexChanged = (event: MediaIndexChangedEvent) => {
      setup();
    };
    this.eventEmitter.on('mediaIndexChanged', handleMediaIndexChanged);

    const handleLiveChanged = (event: LiveChangedEvent) => {
      setup();
    };
    this.eventEmitter.on('liveChanged', handleLiveChanged);

    setup();

    return () => {
      // Clear all LEDs.
      notLiveSetup();

      teardownCurrentState();
      removeModeChangedListener();
      removeMasterVisibleChangedListener();
      this.eventEmitter.off('mediaIndexChanged', handleMediaIndexChanged);
      this.eventEmitter.off('liveChanged', handleLiveChanged);

      stream.unpipe(toWritable);
    };
  }

  /**
   * All channel IDs which are available on one or more frameplayer
   * files, plus the default channel.
   */
  getChannels(): string[] {
    if (this.channels === undefined) {
      const channelsSet = new Set<string>();
      getFrameplayers().forEach((f) => {
        for (const channel in f.frameplayer.channels) {
          channelsSet.add(channel);
        }
      });
      channelsSet.add(OPCManager.getDefaultChannel());

      this.channels = Array.from(channelsSet);
    }
    return this.channels;
  }

  /**
   * If `stream` is called with a channel not present on the current
   * frameplayer instance, this channel will be used instead. (If this
   * channel also doesn't exist, an arbitrary one will be chosen.).
   */
  static getDefaultChannel(): string {
    return 'default';
  }
}
