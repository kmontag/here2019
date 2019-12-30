import { Channels, ChannelsSource } from '../generateConfig';
import PixelBuilder, { PixelPosition } from '../PixelBuilder';

const HEIGHT = 40;
const WIDTH = 40;

const LETTER_WIDTH = WIDTH / 5;
const LETTER_HEIGHT = HEIGHT / 4;

const LOWER_CHEVRONS_WIDTH = 38;

/**
 * Helper to transform a pixel array whose orientation/positioning
 * doesn't match up with the physical LED strip being used to
 * represent it. Allows us to write components in a programmatically
 * "natural" orientation.
 */
function toPhysicalPixels(pixels: PixelPosition[], {
  // Whether LEDs are running in reverse order
  isReversed,
  // Index of the first actual LED
  startIndex,
}: {
  isReversed: boolean,
  startIndex: number,
}): PixelPosition[] {
  const result = [];
  for (let i = 0; i < pixels.length; i++) {
    let transformedIndex = startIndex + (isReversed ? -i : i);
    // Correct for weird mod behavior with negative indices.
    transformedIndex = (transformedIndex % pixels.length + pixels.length) % pixels.length;
    result.push(pixels[transformedIndex]);
  }

  return result;
}

function times(n: number, func: () => any) {
  for (let i = 0; i < n; i++) {
    func();
  }
}

function h(topLeftCorner: NonNullable<PixelPosition>): PixelPosition[] {
  const pb = new PixelBuilder();
  pb.jump(topLeftCorner);

  // Amount per phyisical pixel.
  const xAmount = LETTER_WIDTH / 9;
  const yAmount = LETTER_HEIGHT / 9;

  // First pixel is already in place
  times(3, () => pb.right(xAmount));
  times(4, () => pb.down(yAmount));
  times(3, () => pb.right(xAmount));
  times(4, () => pb.up(yAmount));
  times(3, () => pb.right(xAmount));
  times(9, () => pb.down(yAmount));
  times(2, () => pb.left(xAmount));
  pb.skip();
  pb.left(xAmount);
  times(4, () => pb.up(yAmount));
  times(3, () => pb.left(xAmount));
  times(4, () => pb.down(yAmount));
  times(2, () => pb.left(xAmount * 3 / 2));
  times(9, () => pb.up(yAmount));

  return Array.from(pb.getPixels());
}

function e1(topLeftCorner: NonNullable<PixelPosition>, lowerMiddleLength: number = 3): PixelPosition[] {
  const pb = new PixelBuilder();
  pb.jump(topLeftCorner);

  // Top is really long, bottom is shorter.
  const topLength = 9;
  const upperMiddleLength = 5; // Number of actual pixels, note there's a blank space on the left.
  const bottomLength = 5;

  const topXAmount = LETTER_WIDTH / topLength;
  const upperMiddleXAmount = LETTER_WIDTH / (upperMiddleLength + 2);
  const lowerMiddleXAmount = LETTER_WIDTH / (lowerMiddleLength + 2);
  const bottomXAmount = LETTER_WIDTH / bottomLength;
  const yAmount = LETTER_HEIGHT / 8;

  times(topLength - 1, () => pb.right(topXAmount));
  times(2, () => pb.down(yAmount));
  times(upperMiddleLength, () => pb.left(upperMiddleXAmount));
  times(2, () => pb.down(yAmount));
  times(upperMiddleLength - 1, () => pb.right(upperMiddleXAmount * (upperMiddleLength / (upperMiddleLength - 1))));
  times(2, () => pb.down(yAmount));
  times(lowerMiddleLength, () => pb.left(lowerMiddleXAmount));
  times(2, () => pb.down(yAmount));
  times(lowerMiddleLength - 1, () => pb.right(lowerMiddleXAmount * (lowerMiddleLength / (lowerMiddleLength - 1))));
  times(2, () => pb.down(yAmount));
  times(3, () => pb.left(bottomXAmount));
  times(3, () => pb.skip());
  times(bottomLength - 3, () => pb.left(bottomXAmount));
  times(7, () => pb.up(yAmount));

  return Array.from(pb.getPixels());
}

function r(topLeftCorner: NonNullable<PixelPosition>): PixelPosition[] {
  const pb = new PixelBuilder();
  pb.jump(topLeftCorner);

  const xAmount = LETTER_WIDTH / 8;
  const yAmount = LETTER_WIDTH / 9;

  times(7, () => pb.right(xAmount));
  times(9, () => pb.down(yAmount));
  pb.shift([-2, 0]);
  times(4, () => pb.up(yAmount));
  pb.left(xAmount);
  times(4, () => pb.down(yAmount));
  times(2, () => pb.left(xAmount));
  times(6, () => pb.up(yAmount));
  times(4, () => pb.right(xAmount));
  times(2, () => pb.up(yAmount));
  times(4, () => pb.left(xAmount));
  times(1, () => pb.up(yAmount));

  return Array.from(pb.getPixels());
}

function e2(topLeftCorner: NonNullable<PixelPosition>): PixelPosition[] {
  return e1(topLeftCorner, 5);
  // const pb = new PixelBuilder();

  // return Array.from(pb.getPixels());
}

function upperChevrons(bottomRightCorner: NonNullable<PixelPosition>): PixelPosition[] {
  const pb = new PixelBuilder();

  let isFirst: boolean = true;
  let isGoingLeft: boolean = true;

  const height = LETTER_HEIGHT * 2;
  const yAmountPerChevron = height / 7;
  const pixelsPerChevronSide = 4;
  const xAmountPerPixel = LETTER_WIDTH / ((pixelsPerChevronSide - 1) * 2);

  pb.jump([bottomRightCorner[0], bottomRightCorner[1] - yAmountPerChevron]);

  times(7, () => {
    if (!isFirst) {
      pb.up(yAmountPerChevron);
    }
    isFirst = false;

    const yAmountPerPixel = yAmountPerChevron / pixelsPerChevronSide;
    pb.down(yAmountPerPixel);
    const xMultiplier = isGoingLeft ? -1 : 1;
    times(pixelsPerChevronSide - 2, () => {
      pb.shift([xMultiplier * xAmountPerPixel, yAmountPerPixel]);
    });
    times(pixelsPerChevronSide - 1, () => {
      pb.shift([xMultiplier * xAmountPerPixel, -yAmountPerPixel]);
    });
    pb.up(yAmountPerPixel);

    isGoingLeft = !isGoingLeft;
  });

  return Array.from(pb.getPixels());
}

function lowerChevrons(bottomRightCorner: NonNullable<PixelPosition>): PixelPosition[] {
  const pb = new PixelBuilder();
  const yAmountPerChevron = LETTER_HEIGHT / 2;

  pb.jump([bottomRightCorner[0], bottomRightCorner[1] - yAmountPerChevron]);

  const bigChevronPixels = 38;
  const littleChevronPixels = 26;

  const bigYAmountPerPixel = yAmountPerChevron / (bigChevronPixels / 2);
  const littleYAmountPerPixel = yAmountPerChevron / (littleChevronPixels / 2);

  const xAmountPerPixel = LOWER_CHEVRONS_WIDTH / bigChevronPixels;

  times((bigChevronPixels / 2) - 1, () => pb.shift([-xAmountPerPixel, bigYAmountPerPixel]));
  times((bigChevronPixels / 2), () => pb.shift([-xAmountPerPixel, -bigYAmountPerPixel]));

  pb.shift([xAmountPerPixel * (bigChevronPixels - littleChevronPixels) / 2, -yAmountPerChevron]);
  times((littleChevronPixels / 2 - 1), () => pb.shift([xAmountPerPixel, littleYAmountPerPixel]));
  times((littleChevronPixels / 2), () => pb.shift([xAmountPerPixel, -littleYAmountPerPixel]));

  return Array.from(pb.getPixels());
}

const here: ChannelsSource = () => {
  const result: Channels = {};
  const pixelPositions: {
    [channelName: string]: PixelPosition[],
  } = {
    h: toPhysicalPixels(h([0, 0]), {
      isReversed: true,
      startIndex: 27,
    }),
    e1: toPhysicalPixels(e1([LETTER_WIDTH, 0]), {
      isReversed: true,
      startIndex: 14,
    }),
    r: toPhysicalPixels(r([2 * LETTER_WIDTH, 0]), {
      isReversed: true,
      startIndex: 17,
    }),
    e2: toPhysicalPixels(e2([3 * LETTER_WIDTH, 0]), {
      isReversed: true,
      startIndex: 42,
    }),
    upperChevrons: upperChevrons([WIDTH - 1, LETTER_HEIGHT * 2 + 5]),
    lowerChevrons: lowerChevrons([(WIDTH + LOWER_CHEVRONS_WIDTH) / 2, HEIGHT - 1]),
  }

  for (const channelName in pixelPositions) {
    result[channelName] = {
      height: HEIGHT,
      width: WIDTH,
      pixels: pixelPositions[channelName],
    };
  }

  return result;
}

export default here;