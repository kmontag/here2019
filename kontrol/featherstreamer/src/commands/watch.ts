import chokidar from 'chokidar';
import { Lock } from 'semaphore-async-await';
import compile from './compile';
import { getSrcDir } from '../media';

/**
 * Watch the media src directory for changes, and compile any video
 * files found there.
 */
export default async function watch() {
  const srcDirectory = getSrcDir();
  const watcher = chokidar.watch(srcDirectory, {
    usePolling: true,
    interval: 5000,
    persistent: true,
  });


  const lock = new Lock();
  let changeIndex: number = 0;

  const handleChange = async (currChangeIndex: number) => {
    await lock.acquire();
    try {
      // Debounce repeated calls.
      if (changeIndex === currChangeIndex) {
        await compile();
      }
    } finally {
      lock.release();
    }
  }

  watcher.on('all', () => {
    changeIndex++;
    handleChange(changeIndex);
  });

  await compile();
}