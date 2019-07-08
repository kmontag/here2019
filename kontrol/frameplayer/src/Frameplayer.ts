import { frameplayer } from './proto';
import magic from './magic';
import StrictEventEmitter from 'strict-event-emitter-types';
import { EventEmitter } from 'events';

export interface Channel {
  readonly length: number;
  readonly frames: ReadonlyArray<ReadonlyArray<Pixel>>;
};

export interface FrameEvent {
  readonly channels: {
    [channel: string]: {
      readonly currFrame: number,
      readonly totalFrames: number,
      readonly pixels: ReadonlyArray<Pixel>,
    }
  };
};

export interface Pixel {
  readonly r: number;
  readonly g: number;
  readonly b: number;
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

  private readonly _channels: {readonly [id: string]: Channel};
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

    const invalidErrMsg = 'invalid frameplayer source';
    const frameplayerFile = frameplayer.protobuf.FrameplayerBuffer.decode(source);
    if (frameplayerFile.magic !== magic) {
      throw new Error(`${invalidErrMsg} - incorrect header`);
    }

    // Presence helper.
    const p = <T>(value: NonNullable<T> | null | undefined) => {
      return validatePresence(value, invalidErrMsg);
    };

    const animationMsg = p(frameplayerFile.animation);

    const channels: {[id: string]: Channel} = {};

    for (const channelId in animationMsg.channels) {
      const frames: Pixel[][] = [];
      const framesMsg = p(animationMsg.channels[channelId].frames);

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

        frames.push(pixels);
      }

      channels[channelId] = {
        length: frames[0] ? frames[0].length : 0,
        frames,
      };
    }

    this._channels = channels;
    this._fps = p(animationMsg.fps);

    this.currFrame = 0;
  }

  get fps(): number {
    return this._fps;
  }

  get channels(): {readonly [id: string]: Channel} {
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

  on<K extends keyof Events>(
    event: K,
    callback: (arg: Events[K]) => any
  ): this {
    // The typings here are weird because of the generic, however we
    // know the signature matches.

    // @ts-ignore
    this.eventEmitter.on(event, callback);

    return this;
  }

  off<K extends keyof Events>(
    event: K,
    callback: (arg: Events[K]) => any
  ) {
    return this.eventEmitter.off(event, callback);
  }

  play() {
    this.setNotPlaying();
    this.playIntervalId = setInterval(() => {
      // https://stackoverflow.com/questions/42999983/typescript-removing-readonly-modifier
      const frameEventChannels: { -readonly [P in keyof FrameEvent['channels']]-?: FrameEvent['channels'][P] } = {};

      // Build the event.
      for (const channelId in this.channels) {
        const channel = this.channels[channelId];
        const channelFrame = this.currFrame % channel.frames.length;
        frameEventChannels[channelId] = {
          currFrame: channelFrame,
          totalFrames: channel.frames.length,
          pixels: channel.frames[channelFrame],
        }
      }
      this.eventEmitter.emit('frame', { channels: frameEventChannels });

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