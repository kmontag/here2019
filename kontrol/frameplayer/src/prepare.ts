import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import getPixels = require('get-pixels');
import * as path from 'path';
import * as tmp from 'tmp';
import * as ndarray from 'ndarray';
import magic from './magic';

import * as md5File from 'md5-file';

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
    [channelId: string]: string,
  }

  // Cache image files based on the video MD5 and sample
  // parameters. If not specified, a temp directory will be used.
  cacheDir?: string;

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
  input: string,
  config: AnimationConfig,
  opts: PrepareOptions = {}
): Promise<Buffer> {
  config = AnimationConfig.check(config);

  const [cacheDir, doneCallback] = await (async (): Promise<[string, () => any]> => {
    if (opts.cacheDir) {
      // No-op done callback.
      return [opts.cacheDir, () => {}];
    } else {
      return await new Promise<[string, () => void]>((resolve, reject) => {
        tmp.dir({ unsafeCleanup: true }, (err, path, cleanupCallback) => {
          if (err) {
            reject(err);
          } else {
            resolve([path, cleanupCallback]);
          }
        });
      });
    }
  })();

  return new Promise<Buffer>(async (resolve, reject) => {
    const animation = new frameplayerProto.protobuf.Animation();
    const fps = config.fps;
    animation.fps = fps;

    for (const channelId in config.channels) {
      const channel = config.channels[channelId];
      const channelMsg = new frameplayerProto.protobuf.Channel();

      const channelInput = (opts.inputOverrides && opts.inputOverrides[channelId]) ?
        opts.inputOverrides[channelId] : input;

      const inputHash: string = await new Promise<string>((resolve, reject) => {
        md5File(channelInput, (err, hash) => {
          if (err) {
            reject(err);
          } else {
            resolve(hash);
          }
        });
      });

      const channelCacheDir = `${cacheDir}/${inputHash}-${channel.width}x${channel.height}-${fps}fps`;
      try {
        await fs.promises.access(channelCacheDir);
      } catch (e) {
        await fs.promises.mkdir(channelCacheDir);
      }

      const processFrames = async () => {
        const files: Array<string> = await fs.promises.readdir(`${channelCacheDir}`);

        let processedCount = 0;


        for (const file of files.sort()) {
          const fullFile = path.join(channelCacheDir, file);
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
        }
        animation.channels[channelId] = channelMsg;

      }

      const existingPngs = (await fs.promises.readdir(channelCacheDir)).filter((f) => f.endsWith('.png'));

      // Only compile if necessary
      if (existingPngs.length === 0) {
        const exec = new Promise<void>(async (resolveLocal: Function, rejectLocal: Function) => {
          ffmpeg()
            .input(channelInput)
            .output(`${channelCacheDir}/%09d.png`)
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
                await processFrames();
                resolveLocal();
              } catch (e) {
                rejectLocal(e);
              }
            }).run();

        });
        // wait for command to run
        await exec;
      } else {
        // If the direcotry is already populated, just process the
        // compiled frames immediately.
        await processFrames();
      }
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