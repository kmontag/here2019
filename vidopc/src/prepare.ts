import { Readable, Writable } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import getPixels from 'get-pixels';
import path from 'path';
import tmp from 'tmp';
import promiseCallbacks from 'promise-callbacks';

// TODO: figure out a better directory structure
import { vidopc as vidopcProto } from './proto'

const deferred = promiseCallbacks.deferred;

interface ProgressEvent {
  frames: number,
  currentFps: number,
  currentKbps: number,
  targetSize: number,
  timemark: number,
  percent: number,
}

interface TargetConfig {
  // scale input to this many pixels before sampling
  height: number,
  width: number,

  pixels: (([number, number]|null)[]),
}

interface AnimationConfig {
  // sample framerate
  fps: number,

  // OPC targets, represented by arrays of pixels to sample
  targets: {
    // value elements are [x, y] pairs, and must be within the
    // scaled height/width
    [name: string]: TargetConfig,
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

export default async (input: string | Readable,
                      output: string | Buffer,
                      config: AnimationConfig,
                      opts?: PrepareOptions) => {
  const tmpDirPromise = deferred({variadic: true});
  tmp.dir(tmpDirPromise.defer());
  const [tmpDir, doneCallback] = await tmpDirPromise;

  return new Promise(async (resolve: Function, reject: Function) => {

    let animation = new vidopcProto.protobuf.Animation();
    animation.fps = config.fps;

    let framesByTarget: {[name: string]: vidopcProto.protobuf.Frame[]} = {};
    for (let key in config.targets) {
      framesByTarget[key] = [];
    }

    for (let targetName in config.targets) {
      let target = config.targets[targetName];
      await fs.promises.mkdir(`${tmpDir}/${targetName}`);

      let exec = new Promise(async (resolveLocal: Function, rejectLocal: Function) => {
        let command = ffmpeg()
          .input(input)
          .output(`${tmpDir}/${targetName}/%09d.png`)
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
          }).on('error', (error: Error, stdout: string, stderr, string) => {
            if (opts.onError) {
              opts.onError(error, stdout, stderr);
            }
            reject(error);
          }).on('end', async (stdout: string, stderr: string) => {
            try {
              if (opts.onEnd) {
                opts.onEnd(stdout, stderr);
              }

              const files: Array<string> = await fs.promises.readdir(`${tmpDir}/${targetName}`);

              let processedCount = 0;


              for (let file of files.sort()) {
                file = path.join(tmpDir, targetName, file);
                let contents: Buffer = await fs.promises.readFile(file);

                const getPixelsPromise = deferred();
                getPixels(contents, 'image/png', getPixelsPromise.defer());
                let pixels = await getPixelsPromise;

                let frame: vidopcProto.protobuf.Frame = new vidopcProto.protobuf.Frame();
                for (let pixelCoordinates of target.pixels) {
                  if (pixelCoordinates) {
                    let [x, y] = pixelCoordinates;
                    frame.pixels.push(new vidopcProto.protobuf.Pixel({
                      r: pixels.get(x, y, 0),
                      g: pixels.get(x, y, 1),
                      b: pixels.get(x, y, 2),
                    }));
                  } else {
                    // null case, just push a blank pixel.
                    frame.pixels.push(new vidopcProto.protobuf.Pixel({
                      r: 0, g: 0, b: 0,
                    }));
                  }
                }

                framesByTarget[targetName].push(frame);

                processedCount += 1;
                if (opts.onProcessFrame) {
                  opts.onProcessFrame(processedCount, files.length);
                }

                await fs.promises.unlink(file);
              }
              await fs.promises.rmdir(`${tmpDir}/${targetName}`);
              resolveLocal();
            } catch (e) {
              rejectLocal(e);
            }
          }).run();

      });
      // wait for command to run
      await exec;
    }


    for (let targetName in framesByTarget) {
      animation.framesByTarget[targetName] =
        new vidopcProto.protobuf.Frames({frames: framesByTarget[targetName]});
    }


    vidopcProto.protobuf.Animation.encode(animation);
    const writeFilePromise = deferred();
    fs.writeFile(output, vidopcProto.protobuf.Animation.encode(animation).finish(), writeFilePromise.defer());
    await writeFilePromise;

    doneCallback();
    resolve();
  });
}