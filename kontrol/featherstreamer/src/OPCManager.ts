import { Writable } from 'stream';
import { writableNoopStream } from 'noop-stream';
import { getFrameplayers, FrameplayerDescriptor } from './media';
import logger from './logger';
import StrictEventEmitter from 'strict-event-emitter-types';
import { EventEmitter } from 'events';
import { getConfig } from './config';
import { FrameEvent } from 'frameplayer';

const createOPCStream = require('opc');
const createStrand = require('opc/strand');

interface MediaDescriptor {
  readonly name: string,
  readonly type: 'frameplayer',
}

interface MediaIndexChangedEvent {
  prevMediaIndex: number;
  mediaIndex: number;
}

interface Events {
  mediaIndexChanged: MediaIndexChangedEvent;
}

export default class OPCManager {
  private readonly opcStream: ReturnType<typeof createOPCStream>;
  private mediaIndex: number = 0;
  private channels: string[]|undefined = undefined;
  private readonly frameplayers: ReadonlyArray<FrameplayerDescriptor>;
  private readonly eventEmitter: StrictEventEmitter<EventEmitter, Events> =
    new EventEmitter();

  constructor(
    frameplayers: Iterable<FrameplayerDescriptor>,
  ) {
    this.opcStream = createOPCStream(100);

    // Don't let data get backed up.
    this.opcStream.pipe(writableNoopStream());
    this.frameplayers = Array.from(frameplayers);
  }

  private static instance: OPCManager|undefined = undefined;
  static getInstance() {
    if (!OPCManager.instance) {
      OPCManager.instance = new OPCManager(getFrameplayers());
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
    return this.frameplayers.map((f) => {
      return { name: f.name, type: 'frameplayer' };
    });
  }

  /**
   * Stream a channel to e.g. an express response object, swapping the
   * content as necessary when e.g. the playing video is cycled, the
   * mode is changed, etc.
   *
   * Returns a callback to stop streaming.
   */
  stream(channel: string, toWritable: Writable): (() => void) {
    // Remove any current listeners related to playback. Gets updated
    // as state changes.
    let teardown: (() => void) = () => {};

    const localSetup = () => {
      teardown();

      // Handle negative values, see
      // https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm.
      const realMediaIndex = (this.mediaIndex % this.frameplayers.length + this.frameplayers.length) % this.frameplayers.length;
      const { frameplayer } = this.frameplayers[realMediaIndex];
      if (!(channel in frameplayer.channels)) {
        logger.warn(`Channel ${channel} not found, falling back to a default value`);
        const defaultChannel = OPCManager.getDefaultChannel();
        if (defaultChannel in frameplayer.channels) {
          channel = defaultChannel;
        } else {
          channel = Object.keys(frameplayer.channels).sort()[0];
        }
      }
      const channelData = frameplayer.channels[channel];
      if (!channelData) {
        throw new Error('unexpected');
      }

      const stream = createOPCStream(channelData.length);
      const strand = createStrand(channelData.length);

      const handleFrame = (frame: FrameEvent) => {
        const channelData = frame.channels[channel];
        for (let i = 0; i < channelData.pixels.length; i++) {
          const pixel = channelData.pixels[i];
          const brightness = getConfig().brightness;
          strand.setPixel(i, Math.floor(pixel.r * brightness), Math.floor(pixel.g * brightness), Math.floor(pixel.b * brightness));
        }
        stream.writePixels(0, strand.buffer);
      };
      frameplayer.on('frame', handleFrame);

      stream.pipe(toWritable);
      teardown = () => {
        frameplayer.off('frame', handleFrame);
      };
    }

    const handleMediaIndexChanged = (event: MediaIndexChangedEvent) => {
      logger.debug(`Switching channel "${channel}" to media index ${this.mediaIndex}`);
      localSetup();
    };
    this.eventEmitter.on('mediaIndexChanged', handleMediaIndexChanged);

    localSetup();

    return () => {
      teardown();
      this.eventEmitter.off('mediaIndexChanged', handleMediaIndexChanged);
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
