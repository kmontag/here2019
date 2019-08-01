import logger from '../logger';
import { getSrcDir, getCacheDir, getBuildDir, getFrameplayerConfigFile } from '../media';
import hash from 'object-hash';
import fs from 'fs';
import path from 'path';
import md5File from 'md5-file';
import { prepare } from 'frameplayer';
import { PrepareOptions } from 'frameplayer/dist/prepare';

interface AnimationDescriptor {
  readonly name: string;
  readonly defaultSrc: string;
  readonly overrides: {
    [channel: string]: string,
  };
}

/**
 * Compile files from the media source directory to playable (by
 * frameplayer) .fpl files. Uses the frameplayer config specified by
 * our own config file. The layout of the directory should be:
 *
 *   - [your media dir]/src/
 *     - scene1/
 *       - default.{mkv,mp4,etc}
 *     - scene2/
 *       - default.{mkv,mp4,etc}
 *       - channel-name.{mkv,mp4,etc}
 *     - ...
 *
 * The scene directories can have any name, but they'll be cycled
 * through in alphabetical order during playback.
 *
 * The `default` file in a scene directory will be processed to pixels
 * and played on all channels. Override files named after channels in
 * the frameplayer config can also be provided to play different
 * videos on specific channels.
 *
 * See the `frameplayer-conf` module for details on the frameplayer
 * config, and to see which channel names are available to override.
 */
export default async function compile() {
  const srcDir = getSrcDir();
  logger.info(`Compiling sources from ${srcDir}`);

  const frameplayerConfig = require(getFrameplayerConfigFile());

  const configChecksum = hash(frameplayerConfig);
  logger.info(`Config hash: ${configChecksum}`);

  await fs.promises.mkdir(srcDir, { recursive: true });
  await fs.promises.mkdir(getBuildDir(), { recursive: true });
  await fs.promises.mkdir(getCacheDir(), { recursive: true });

  const channelNames: string[] = Object.keys(frameplayerConfig.channels);

  // An animation directory contains default.[mkv,mov,...], plus
  // [channel_name].[mkv,mov,...] for any overrides.
  const animationDescriptors: AnimationDescriptor[] = (await Promise.all(
    (await fs.promises.readdir(srcDir, { withFileTypes: true }))
      .filter((f) => f.isDirectory())
      .map(async (d) => {
        const currDir = path.join(srcDir, d.name)
        const currFiles = await fs.promises.readdir(currDir);
        let defaultSrc: string|undefined = undefined;
        const overrides: {
          [channel: string]: string,
        } = {};
        for (const file of currFiles) {
          const fullFile = path.join(currDir, file);
          if (file.startsWith('default.')) {
            defaultSrc = fullFile;
          } else {
            for (const channelName of channelNames) {
              if (file.startsWith(channelName)) {
                overrides[channelName] = fullFile;
              }
            }
          }
        }

        if (defaultSrc) {
          const result: AnimationDescriptor = {
            defaultSrc,
            name: d.name,
            overrides,
          }
          return result;
        } else {
          return undefined;
        }
      })
  )).filter((a) => a !== undefined)
    .map((a) => {
      // For the type checker
      if (a === undefined) {
        throw new Error('unexpected');
      }
      return a;
    });

  logger.debug(`Animation descriptors: ${JSON.stringify(animationDescriptors)}`);

  // Keys are the cached compiled file, values are the destination in
  // the current build/ directory.
  const filesToCopy: { [cached: string]: string } = {};

  for (const animationDescriptor of animationDescriptors) {
    const srcChecksums: { [channel: string]: string } = {};
    const srcsByChannelWithDefault = Object.assign(
      {},
      animationDescriptor.overrides,
      { default: animationDescriptor.defaultSrc }
    );
    await Promise.all(Object.keys(srcsByChannelWithDefault).map((channel) => {
      const src = srcsByChannelWithDefault[channel];
      return new Promise<void>((resolve, reject) => {
        md5File(src, (err, checksum) => {
          if (err) {
            reject(err);
          } else {
            srcChecksums[channel] = checksum;
            resolve();
          }
        });
      });
    }));

    logger.debug(`Checksums: ${JSON.stringify(srcChecksums)}`);

    const animationChecksum = hash(srcChecksums);

    const cacheFile = path.join(getCacheDir(), `${configChecksum}-${animationChecksum}.fpl`);
    let cacheFileExists = true;
    try {
      await fs.promises.access(cacheFile);
    } catch (e) {
      cacheFileExists = false;
    }

    if (!cacheFileExists) {
      // Ensure cache dir exists.
      await fs.promises.mkdir(getCacheDir(), { recursive: true });

      logger.info(`Compilling animation ${animationDescriptor.name}...`);
      const opts: PrepareOptions = {
        inputOverrides: animationDescriptor.overrides,
        cacheDir: getCacheDir(),
        onProgress: (progress) => {
          logger.info(`${progress.percent}%`);
        },
        onStderr: (stderr) => {
          logger.debug(stderr);
        },
      };
      const frameplayerBuffer = await prepare(animationDescriptor.defaultSrc, frameplayerConfig, opts);
      await fs.promises.writeFile(cacheFile, frameplayerBuffer);
      logger.info(`Finished compiling ${animationDescriptor.name}`);
    }

    filesToCopy[cacheFile] = path.join(getBuildDir(), `${animationDescriptor.name}.fpl`);
  }

  const fsPromises: Promise<void>[] = [];
  for (const cached in filesToCopy) {
    const target = filesToCopy[cached];
    logger.debug(`Copying ${cached} -> ${target}`);
    fsPromises.push(fs.promises.copyFile(cached, target));
  }
  for (const file of await fs.promises.readdir(getBuildDir())) {
    const fullFile = path.join(getBuildDir(), file);
    if (!Object.values(filesToCopy).includes(fullFile)) {
      logger.debug(`Removing ${fullFile}`);
      fsPromises.push(fs.promises.unlink(fullFile));
    }
  }
  await Promise.all(fsPromises);
}