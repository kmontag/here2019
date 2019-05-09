import { Readable } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import getPixels from 'get-pixels';
import path from 'path';
import tmp from 'tmp';
import ndarray from 'ndarray';

// TODO: figure out a better directory structure
import { frameplayer as frameplayerProto } from './proto'

interface ProgressEvent {
  frames: number,
  currentFps: number,
  currentKbps: number,
  targetSize: number,
  timemark: number,
  percent: number,
}

interface ChannelConfig {
  // scale input to this many pixels before sampling
  height: number,
  width: number,

  pixels: (([number, number]|null)[]),
}

interface AnimationConfig {
  // sample framerate
  fps: number,

  // OPC targets, represented by arrays of pixels to sample
  channel: {
    [id: number]: ChannelConfig,
  }
}

interface PrepareOptions {
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
  output: string | Buffer,
  config: AnimationConfig,
  opts: PrepareOptions = {}
) {
  const [tmpDir, doneCallback] = await new Promise<[string, () => void]>((resolve, reject) => {
    tmp.dir((err, path, cleanupCallback) => {
      if (err) {
        reject(err);
      } else {
        resolve([path, cleanupCallback]);
      }
    });
  });

  return new Promise(async (resolve: Function, reject: Function) => {

    let animation = new frameplayerProto.protobuf.Animation();
    animation.fps = config.fps;

    let framesByChannel: {[name: string]: frameplayerProto.protobuf.Frame[]} = {};
    for (let key in config.channel) {
      framesByChannel[key] = [];
    }

    for (let channelName in config.channel) {
      let target = config.channel[channelName];
      await fs.promises.mkdir(`${tmpDir}/${channelName}`);

      let exec = new Promise(async (resolveLocal: Function, rejectLocal: Function) => {
        ffmpeg()
          .input(input)
          .output(`${tmpDir}/${channelName}/%09d.png`)
          .fps(config.fps)
          .outputOption('-pix_fmt rgb24')
          .size(`${target.width}x${target.height}`)
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

              const files: Array<string> = await fs.promises.readdir(`${tmpDir}/${channelName}`);

              let processedCount = 0;


              for (let file of files.sort()) {
                file = path.join(tmpDir, channelName, file);
                let contents: Buffer = await fs.promises.readFile(file);

                const pixels = await new Promise<ndarray>((resolve, reject) => {
                  getPixels(contents, 'image/png', (err, pixels) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(pixels!);
                    }
                  });
                });

                let frame: frameplayerProto.protobuf.Frame = new frameplayerProto.protobuf.Frame();
                for (let pixelCoordinates of target.pixels) {
                  if (pixelCoordinates) {
                    let [x, y] = pixelCoordinates;
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

                framesByChannel[channelName].push(frame);

                processedCount += 1;
                if (opts.onProcessFrame) {
                  opts.onProcessFrame(processedCount, files.length);
                }

                await fs.promises.unlink(file);
              }
              await fs.promises.rmdir(`${tmpDir}/${channelName}`);
              resolveLocal();
            } catch (e) {
              rejectLocal(e);
            }
          }).run();

      });
      // wait for command to run
      await exec;
    }


    for (let channelName in framesByChannel) {
      animation.framesByChannel[channelName] =
        new frameplayerProto.protobuf.Frames({frames: framesByChannel[channelName]});
    }


    frameplayerProto.protobuf.Animation.encode(animation);
    const writeFilePromise = deferred();
    fs.writeFile(output, frameplayerProto.protobuf.Animation.encode(animation).finish(), writeFilePromise.defer());
    await writeFilePromise;

    doneCallback();
    resolve();
  });
}