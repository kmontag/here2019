import { Readable } from 'stream';
import { vidopc as vidopcProto } from './proto';

interface Frame {
  [target: string]: Color[]
}

interface Color {
  r: number,
  g: number,
  b: number,
}

export default class Animation {

  private animationMsg: vidopcProto.protobuf.Animation;
  private _numFrames: number;

  constructor(source: Buffer) {
    this.animationMsg = vidopcProto.protobuf.Animation.decode(source);
    this._numFrames = undefined;
    for (let name in this.animationMsg.framesByTarget) {
      let frames = this.animationMsg.framesByTarget[name];
      if (this._numFrames === undefined) {
        this._numFrames = frames.frames.length;
      } else if (frames.frames.length !== this._numFrames) {
        throw new Error('Invalid animation: target frame counts do not match');
      }
    }

    if (this._numFrames === undefined || this._numFrames < 1) {
      throw new Error('Invalid animation: no frame data');
    }
  }

  public get fps(): number {
    return this.animationMsg.fps;
  }

  public get numFrames(): number {
    return this._numFrames;
  }

  public get targetNames(): string[] {
    return Object.keys(this.animationMsg.framesByTarget);
  }

  /**
   * Repeatedly invokes onFrame at the appropriate FPS, looping
   * through all frames in the animation, and starting over once the
   * end is reached. Continues until the stop function (returned from
   * this function) is invoked.
   *
   * @returns Function which can be invoked to stop playback.
   */
  public play(onFrame: (frame: Frame, index: number) => any): () => void {
    let index = 0;
    let timer = setInterval(() => {
      let frame: Frame = {};
      for (let targetName in this.animationMsg.framesByTarget) {
        frame[targetName] = [];
        for (let pixel of this.animationMsg.framesByTarget[targetName].frames[index].pixels) {
          frame[targetName].push({
            r: pixel.r,
            g: pixel.g,
            b: pixel.b,
          });
        }
      }

      onFrame(frame, index);
      index = (index + 1) % this.numFrames;
    }, 1000 / this.fps);
    return () => {
      clearInterval(timer);
    }
  }
}