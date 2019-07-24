import { Frameplayer } from 'frameplayer';
import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import logger from './logger';
import { getConfig } from './config';
import { Set as ImmutableSet } from 'immutable';
import { debounce } from 'debounce';
import chokidar from 'chokidar';

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
  const mediaDirectory = path.resolve(getConfig().mediaBuildDir);
  let lastFrameplayerFiles: ImmutableSet<string> = ImmutableSet<string>();

  const update = async () => {
    const filesInMediaDir = await fg('**/*', { cwd: mediaDirectory });
    const frameplayerFiles = ImmutableSet(filesInMediaDir.filter((f) => /\.fpl$/.test(f)));

    if (frameplayerFiles.equals(lastFrameplayerFiles)) {
      logger.debug('No new media files found');
    } else {
      frameplayers = await Promise.all(frameplayerFiles.map(async (f) => {
        logger.debug(`Loading ${f}`);
        const frameplayer = new Frameplayer(await fs.promises.readFile(path.join(mediaDirectory, f)));
        frameplayer.play();
        return {
          name: f,
          frameplayer,
        };
      }));
    }
  }

  await update();

  const watcher = chokidar.watch(mediaDirectory);
  watcher.on('all', debounce(update, 2000));

  // // Continually check for updates in the background.
  // (async () => {
  //   while (true) {
  //     const nextCheck = new Promise((resolve) => setTimeout(resolve, 3000));
  //     await update();
  //     await nextCheck;
  //   }
  // })();

  didInit = true;
}

export function getFrameplayers(): ReadonlyArray<FrameplayerDescriptor> {
  if (!didInit) {
    throw new Error('media not yet initialized');
  }
  return frameplayers;
}