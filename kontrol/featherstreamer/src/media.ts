import { Frameplayer } from 'frameplayer';
import * as fs from 'fs';
import * as path from 'path';
import logger from './logger';

// TODO: Configurable so we can use a writable volume on the SD card.
const MEDIA_DIRECTORY = `${__dirname}/../media`;

interface FrameplayerDescriptor {
  readonly name: string;
  readonly frameplayer: Frameplayer;
}

let didInit: boolean = false;
let frameplayers: FrameplayerDescriptor[] = [];

/**
 * Call this at the start of the program to preload data so it's
 * available synchronously.
 */
export async function initMedia() {
  const filesInMediaDir = await fs.promises.readdir(MEDIA_DIRECTORY);
  const frameplayerFiles = filesInMediaDir.filter((f) => /\.fpl$/.test(f));
  frameplayers = await Promise.all(frameplayerFiles.map(async (f) => {
    logger.debug(`Loading ${f}`);
    const frameplayer = new Frameplayer(await fs.promises.readFile(path.join(MEDIA_DIRECTORY, f)));
    frameplayer.play();
    return {
      name: f,
      frameplayer,
    };
  }));
  didInit = true;
}

export function getFrameplayers(): ReadonlyArray<FrameplayerDescriptor> {
  if (!didInit) {
    throw new Error('media not yet initialized');
  }
  return frameplayers;
}