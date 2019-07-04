import { Frameplayer } from 'frameplayer';
import * as fs from 'fs';
import * as path from 'path';
import * as fg from 'fast-glob';
import logger from './logger';
import { getConfig } from './config';

export interface FrameplayerDescriptor {
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
  const mediaDirectory = path.resolve(getConfig().mediaDir);
  const filesInMediaDir = await fg('**/*', { cwd: mediaDirectory });
  const frameplayerFiles = filesInMediaDir.filter((f) => /\.fpl$/.test(f));
  frameplayers = await Promise.all(frameplayerFiles.map(async (f) => {
    logger.debug(`Loading ${f}`);
    const frameplayer = new Frameplayer(await fs.promises.readFile(path.join(mediaDirectory, f)));
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