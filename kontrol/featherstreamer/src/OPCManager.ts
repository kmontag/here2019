import { Writable } from 'stream';
import { writableNoopStream } from 'noop-stream';
import { getFrameplayers } from './media';
import logger from './logger';

const createOPCStream = require('opc');
const createStrand = require('opc/strand');

export default class OPCManager {
  private readonly opcStream: ReturnType<typeof createOPCStream>;
  private mediaIndex: number = 0;
  private channels: string[]|undefined = undefined;

  constructor() {
    this.opcStream = createOPCStream(100);

    // Don't let data get backed up.
    this.opcStream.pipe(writableNoopStream());
  }

  /**
   * Stream a channel to e.g. an express response object, swapping the
   * content as necessary when e.g. the playing video is cycled, the
   * mode is changed, etc.
   *
   * Returns a callback to stop streaming.
   */
  stream(channel: string, toWritable: Writable): (() => void) {
    const frameplayers = getFrameplayers();
    const { frameplayer } = frameplayers[this.mediaIndex % frameplayers.length];
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

    frameplayer.on('frame', (frame) => {
      const channelData = frame.channels[channel];
      for (let i = 0; i < channelData.pixels.length; i++) {
        const pixel = channelData.pixels[i];
        strand.setPixel(i, pixel.r, pixel.g, pixel.b);
      }
      stream.writePixels(0, strand.buffer);
    });

    stream.pipe(toWritable);

    return () => {
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