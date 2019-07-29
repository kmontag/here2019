import { Readable } from 'stream';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import getPixels = require('get-pixels');
import * as path from 'path';
import * as tmp from 'tmp';
import * as ndarray from 'ndarray';
import magic from './magic';

import { frameplayer as frameplayerProto } from './proto'
import { Record, Number as RuntypesNumber, Tuple, Dictionary, Static, Array as RuntypesArray, Null } from 'runtypes';

interface ProgressEvent {
  frames: number,
  currentFps: number,
  currentKbps: number,
  targetSize: number,
  timemark: number,
  percent: number,
}

const ChannelConfig = Record({
  // Scale input to this many pixels before sampling.
  height: RuntypesNumber,
  width: RuntypesNumber,

  // Sample these pixels after scaling the input.
  pixels: RuntypesArray(Tuple(RuntypesNumber, RuntypesNumber).Or(Null)),
});

const AnimationConfig = Record({
  // Sample framerate.
  fps: RuntypesNumber,

  // Animation is just a set of channels.
  channels: Dictionary(ChannelConfig, 'string'),
});
type AnimationConfig = Static<typeof AnimationConfig>;
export { AnimationConfig };

export interface PrepareOptions {
  // Specify a different input file/buffer for individual channel IDs.
  inputOverrides?: {
    [channelId: string]: string | Readable,
  }

  // ffmpeg callbacks
  onStart?: (commandLine: string) => any,
  onCodecData?: (codecData: object) => any,
  onProgress?: (progress: ProgressEvent) => any,
  onStderr?: (stderrLine: string) => any,
  onError?: (err: Error, stdout: string, stderr: string) => any,
  onEnd?: (stdout: string, stderr: string) => any,

  // frame-processing callbacks
  onProcessFrame?: (processed: number, total: number) => any,
}

export default async function(
  input: string | Readable,
  config: AnimationConfig,
  opts: PrepareOptions = {}
): Promise<Buffer> {
  config = AnimationConfig.check(config);

  const [tmpDir, doneCallback] = await new Promise<[string, () => void]>((resolve, reject) => {
    tmp.dir((err, path, cleanupCallback) => {
      if (err) {
        reject(err);
      } else {
        resolve([path, cleanupCallback]);
      }
    });
  });

  return new Promise<Buffer>(async (resolve, reject) => {
    const animation = new frameplayerProto.protobuf.Animation();
    const fps = config.fps;
    animation.fps = fps;

    for (const channelId in config.channels) {
      const channel = config.channels[channelId];
      const channelMsg = new frameplayerProto.protobuf.Channel();
      await fs.promises.mkdir(`${tmpDir}/${channelId}`);

      const channelInput = (opts.inputOverrides && opts.inputOverrides[channelId]) ?
        opts.inputOverrides[channelId] : input;

      const exec = new Promise<void>(async (resolveLocal: Function, rejectLocal: Function) => {
        ffmpeg()
          .input(channelInput)
          .output(`${tmpDir}/${channelId}/%09d.png`)
          .fps(fps)
          .outputOption('-pix_fmt rgb24')
          .size(`${channel.width}x${channel.height}`)
          .on('start', (commandLine: string) => {
            if (opts.onStart) {
              opts.onStart(commandLine);
            }
          }).on('codecData', (codecData: object) => {
            if (opts.onCodecData) {
              opts.onCodecData(codecData);
            }
          }).on('progress', (progress: ProgressEvent) => {
            if (opts.onProgress) {
              opts.onProgress(progress);
            }
          }).on('stderr', (stderr: string) => {
            if (opts.onStderr) {
              opts.onStderr(stderr);
            }
          }).on('error', (error: Error, stdout: string, stderr: string) => {
            if (opts.onError) {
              opts.onError(error, stdout, stderr);
            }
            reject(error);
          }).on('end', async (stdout: string, stderr: string) => {
            try {
              if (opts.onEnd) {
                opts.onEnd(stdout, stderr);
              }

              const files: Array<string> = await fs.promises.readdir(`${tmpDir}/${channelId}`);

              let processedCount = 0;


              for (const file of files.sort()) {
                const fullFile = path.join(tmpDir, channelId, file);
                let contents: Buffer = await fs.promises.readFile(fullFile);

                const pixels = await new Promise<ndarray>((resolve, reject) => {
                  getPixels(contents, 'image/png', (err, pixels) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(pixels!);
                    }
                  });
                });

                const frame: frameplayerProto.protobuf.Frame = new frameplayerProto.protobuf.Frame();
                for (const pixelCoordinates of channel.pixels) {
                  if (pixelCoordinates) {
                    const [x, y] = pixelCoordinates;
                    frame.pixels.push(new frameplayerProto.protobuf.Pixel({
                      r: pixels.get(x, y, 0),
                      g: pixels.get(x, y, 1),
                      b: pixels.get(x, y, 2),
                    }));
                  } else {
                    // null case, just push a blank pixel.
                    frame.pixels.push(new frameplayerProto.protobuf.Pixel({
                      r: 0, g: 0, b: 0,
                    }));
                  }
                }

                channelMsg.frames.push(frame);

                processedCount += 1;
                if (opts.onProcessFrame) {
                  opts.onProcessFrame(processedCount, files.length);
                }

                await fs.promises.unlink(fullFile);
              }
              animation.channels[channelId] = channelMsg;
              await fs.promises.rmdir(`${tmpDir}/${channelId}`);
              resolveLocal();
            } catch (e) {
              rejectLocal(e);
            }
          }).run();

      });
      // wait for command to run
      await exec;
    }

    const buffer = new frameplayerProto.protobuf.FrameplayerBuffer({
      animation: animation,
      magic,
    });
    const result = frameplayerProto.protobuf.FrameplayerBuffer.encode(buffer).finish();

    doneCallback();
    resolve(Buffer.from(result));
  });
}