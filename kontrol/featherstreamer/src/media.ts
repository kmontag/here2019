import { Frameplayer } from 'frameplayer';
import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import logger from './logger';
import { getConfig } from './config';
import { Set as ImmutableSet } from 'immutable';
import { debounce } from 'debounce';
import chokidar from 'chokidar';
import md5File from 'md5-file';

export interface FrameplayerDescriptor {
  readonly name: string;
  readonly frameplayer: Frameplayer;
}

let didInit: boolean = false;
let frameplayers: FrameplayerDescriptor[] = [];

/**
 * Call this at the start of the program to preload data so it's
 * available synchronously.
 *
 * Also watches for folder changes and updates the list of frameplayer
 * instances in the background, so `getFrameplayers` will always
 * return a reasonably up-to-date list. At the moment there are no
 * events emitted externally, clients just need to call
 * `getFrameplayers()` whenever they need an up-to-date list.
 */
export async function initMedia() {
  const mediaDirectory = getBuildDir();
  let lastChecksum: string|undefined = undefined;
  let cleanupPrevious: () => any = () => {};

  const update = async () => {
    const filesInMediaDir = await fg('**/*', { cwd: mediaDirectory });
    const frameplayerFiles = ImmutableSet(filesInMediaDir.filter((f) => /\.fpl$/.test(f)));
    const checksums: Promise<string>[] = Array.from(frameplayerFiles).sort().map((f) => {
      return new Promise((resolve, reject) => {
        md5File(path.join(mediaDirectory, f), (err, checksum) => {
          if (err) {
            reject(err);
          } else {
            // Also depend on the file name.
            resolve(`${f}|${checksum}`);
          }
        });
      });
    });
    const fullChecksum = (await Promise.all(checksums)).join('/');

    logger.debug('Media build directory updated');

    if (fullChecksum === lastChecksum) {
      logger.debug('No new media files or config found');
    } else {
      cleanupPrevious();
      frameplayers = await Promise.all(frameplayerFiles.toArray().sort().map(async (f) => {
        logger.debug(`Loading ${f}`);
        const frameplayer = new Frameplayer(await fs.promises.readFile(path.join(mediaDirectory, f)));
        frameplayer.play();
        return {
          name: f,
          frameplayer,
        };
      }));
      const currFrameplayers = frameplayers;
      cleanupPrevious = () => {
        for (const frameplayer of currFrameplayers) {
          frameplayer.frameplayer.stop();
        }
      };
    }

    lastChecksum = fullChecksum;
  }

  await update();

  const watcher = chokidar.watch(mediaDirectory, {
    usePolling: true,
    interval: 1000,
    persistent: true,
  });
  watcher.on('all', debounce(update, 2000));

  didInit = true;
}

let defaultFrameplayer: FrameplayerDescriptor|undefined = undefined;
function getDefaultFrameplayer(): FrameplayerDescriptor {
  if (!defaultFrameplayer) {
    const frameplayer = new Frameplayer(fs.readFileSync(path.join(__dirname, '..', 'assets', 'animation.fpl')));
    frameplayer.play();
    defaultFrameplayer = {
      name: 'built-in animation',
      frameplayer,
    };
  }
  return defaultFrameplayer;
}

export function getFrameplayers(): ReadonlyArray<FrameplayerDescriptor> {
  if (!didInit) {
    throw new Error('media not yet initialized');
  }

  // Provide a default test animation if no videos are present.
  if (frameplayers.length === 0) {
    return [getDefaultFrameplayer()];
  } else {
    return frameplayers;
  }
}

// For videos to compile and include in the "current" dir
export function getSrcDir(): string {
  return path.join(getConfig().mediaDir, 'src');
}

// For not repeating ourselves with ffmpeg runs
export function getCacheDir(): string {
  return path.join(getConfig().mediaDir, 'cache');
}

// For live frameplayer files
export function getBuildDir(): string {
  return path.join(getConfig().mediaDir, 'build');
}

export function getFrameplayerConfigFile(): string {
  return path.join(getConfig().mediaDir, 'frameplayer.json');
}