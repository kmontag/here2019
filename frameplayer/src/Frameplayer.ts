import { frameplayer } from './proto';
import magic from './magic';
import StrictEventEmitter from 'strict-event-emitter-types';
import { EventEmitter } from 'events';

type Channel = {
  readonly id: number,
  readonly frames: ReadonlyArray<ReadonlyArray<Pixel>>,
};

type FrameEvent = {
  readonly [channel: number]: {
    readonly currFrame: number,
    readonly totalFrames: number,
    readonly pixels: ReadonlyArray<Pixel>,
  },
};

type Pixel = {
  readonly r: number,
  readonly g: number,
  readonly b: number,
};

function validatePresence<T>(
  value: NonNullable<T> | null | undefined,
  message: string = 'expected value to be defined',
): NonNullable<T> {
  if (value == null) {
    throw new Error(message);
  }
  return value;
}

/**
 * To get a typed event emitter. See `strict-event-emitter-types`
 * docs.
 */
interface Events {
  play: void,
  pause: void,
  stop: void,
  frame: FrameEvent,
}

type FrameplayerEventEmitter = StrictEventEmitter<EventEmitter, Events>;

/**
 * Loads an animation from a byte buffer, and provides utilities for
 * examining it and playing it back.
 */
export default class Frameplayer {

  private readonly _channels: ReadonlyArray<Channel>;
  private readonly _fps: number;
  private readonly eventEmitter: FrameplayerEventEmitter;
  private currFrame: number;

  /**
   * When playing, this interval gets invoked to emit each frame
   * event. Clear it to stop playback.
   */
  private playIntervalId: NodeJS.Timeout | undefined;

  constructor(source: Buffer) {
    this.eventEmitter = new EventEmitter();

    clearTimeout
    const t = setTimeout(() => {}, 100);
    t

    const invalidErrMsg = 'invalid frameplayer source';
    const frameplayerFile = frameplayer.protobuf.FrameplayerFile.decode(source);
    if (frameplayerFile.magic !== magic) {
      throw new Error(invalidErrMsg);
    }

    // Presence helper.
    const p = <T>(value: NonNullable<T> | null | undefined) => {
      return validatePresence(value, invalidErrMsg);
    };

    const animationMsg = p(frameplayerFile.animation);

    const channels: Channel[] = [];

    for (const channelId in animationMsg.framesByChannel) {
      const frames: ReadonlyArray<Pixel>[] = [];
      const framesMsg = p(animationMsg.framesByChannel[channelId].frames);

      for (const frameMsg of framesMsg) {
        const pixels: Pixel[] = [];
        const pixelsMsg = p(frameMsg.pixels);

        for (const pixelMsg of pixelsMsg) {
          pixels.push({
            r: p(pixelMsg.r),
            g: p(pixelMsg.g),
            b: p(pixelMsg.b),
          });
        }
      }

      if (!/[0-9]+/.test(channelId)) {
        throw new Error('unexpected - channel ID is not an integer');
      }
      channels.push({
        id: parseInt(channelId),
        frames,
      });
    }

    this._channels = channels;
    this._fps = p(animationMsg.fps);

    this.currFrame = 0;
  }

  get fps(): number {
    return this._fps;
  }

  get channels(): ReadonlyArray<Channel> {
    return this._channels;
  }

  /**
   * Clear the playback interal, if any.
   */
  private setNotPlaying() {
    if (this.playIntervalId) {
      clearInterval(this.playIntervalId);
    }
    this.playIntervalId = undefined;
  }

  on(
    event: Parameters<FrameplayerEventEmitter['on']>[0],
    callback: Parameters<FrameplayerEventEmitter['on']>[1],
  ) {
    return this.eventEmitter.on(event, callback);
  }

  off(
    event: Parameters<FrameplayerEventEmitter['off']>[0],
    callback: Parameters<FrameplayerEventEmitter['off']>[1],
  ) {
    return this.eventEmitter.off(event, callback);
  }

  play() {
    this.setNotPlaying();
    this.playIntervalId = setInterval(() => {
      // https://stackoverflow.com/questions/42999983/typescript-removing-readonly-modifier
      const frameEvent: { -readonly [P in keyof FrameEvent]-?: FrameEvent[P] } = {};

      // Build the event.
      for (const channel of this.channels) {
        const channelFrame = this.currFrame % channel.frames.length;
        frameEvent[channel.id] = {
          currFrame: channelFrame,
          totalFrames: channel.frames.length,
          pixels: channel.frames[channelFrame],
        }
      }
      this.eventEmitter.emit('frame', frameEvent);

      this.currFrame += 1;

    }, 1000 / this.fps);
    this.eventEmitter.emit('play');
  }

  pause() {
    this.setNotPlaying();
    this.eventEmitter.emit('pause');
  }

  stop() {
    this.setNotPlaying();
    this.eventEmitter.emit('stop');
  }

  seek(frame: number) {
    this.currFrame = frame;
  }
}