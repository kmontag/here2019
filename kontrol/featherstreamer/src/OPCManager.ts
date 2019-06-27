import { Readable } from 'stream';
import { writableNoopStream } from 'noop-stream';

const createOPCStream = require('opc');
const createStrand = require('opc/strand');

export default class OPCManager {
  private readonly opcStream: ReturnType<typeof createOPCStream>;

  constructor() {
    this.opcStream = createOPCStream(100);

    // Don't let data get backed up.
    this.opcStream.pipe(writableNoopStream());
  }

  // Temp, until we get frameplayer integrated
  start() {
    // let isWhite: boolean = true;
    const maxBrightness = 70;
    const minBrightness = 10;
    const color: number[] = new Array(3).fill(0).map((unused) => {
      return minBrightness + Math.floor(Math.random() * (maxBrightness - minBrightness));
    });

    const strand = createStrand(100);
    setInterval(() => {
      const interpolationInterval = 2000;
      const interpolation = Math.abs((new Date().getTime() % interpolationInterval) - (interpolationInterval / 2)) / (interpolationInterval / 2);

      for (let pixel = 0; pixel < strand.length; pixel++) {
        if (pixel < 15) {
          strand.setPixel(pixel, ...color.map((c) => c + interpolation * (maxBrightness - c)));
        } else {
          strand.setPixel(pixel, 0, 0, 0);
        }
      }

      // isWhite = !isWhite;
      // for (let pixel = 0; pixel < strand.length; pixel++) {
      //   if (isWhite) {
      //     strand.setPixel(pixel, maxBrightness, maxBrightness, maxBrightness);
      //   } else {
      //     strand.setPixel(pixel, color[0], color[1], color[2]);
      //     //strand.setPixel(pixel, maxBrightness, 0, 0);
      //   }
      // }
      this.opcStream.writePixels(0, strand.buffer);
    }, 100);
  }

  /**
   * Get a permanent stream for all data on the given channel.
   */
  getStream(channel: string): Readable {
    return this.opcStream;
  }
}