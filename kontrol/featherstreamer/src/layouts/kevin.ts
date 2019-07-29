import { Channels, ChannelsSource} from '../frameplayerConfig';

const kevin: ChannelsSource = () => {

  // main poncho grid size
  const PONCHO_ROWS = 47;
  const PONCHO_COLS = 10;

  // gap for head
  const PONCHO_GAP_ROWS = 7;
  const PONCHO_GAP_COLS = 2;

  const HAT_RING_LIGHTS = 18;
  const HAT_RINGS = 2;
  const HAT_GAP_ROWS = 1;
  const HAT_GAP_PIXELS = 2;
  const HAT_INITIAL_RADIUS_PIXELS = (HAT_RING_LIGHTS * HAT_GAP_PIXELS / 2 / Math.PI) - HAT_GAP_PIXELS;

  const result: Channels = {};

  for (let i = 1; i <= 3; i++) {
    result[`poncho${i}`] = {
      height: PONCHO_ROWS,
      width: PONCHO_COLS,
      pixels: [],
    };
  }

  // Add the LED at a particular row/column on the poncho to the
  // sequence of LEDs being controlled. No-op if the pixel is in the
  // head gap.
  const pushPonchoPixel = (name: string, col: number, row: number) => {
    if (col >= (PONCHO_COLS - PONCHO_GAP_COLS) / 2 &&
        col < (PONCHO_COLS + PONCHO_GAP_COLS) / 2 &&
        row >= (PONCHO_ROWS - PONCHO_GAP_ROWS) / 2 &&
        row < (PONCHO_ROWS + PONCHO_GAP_ROWS) / 2) {
      return;
    } else {
      const pixel: [number, number] = [col, row];
      result[name].pixels.push(pixel);
    }
  }

  const pushPonchoColumn = (name: string, col: number, fromBottom: boolean, startAtRow: number|undefined = undefined, length: number = PONCHO_ROWS) => {
    if (fromBottom) {
      if (startAtRow === undefined) {
        startAtRow = PONCHO_ROWS - 1;
      }
      for (let row = startAtRow; row >= 0 && row > startAtRow - length; row--) {
        pushPonchoPixel(name, col, row);
      }
    } else {
      if (startAtRow === undefined) {
        startAtRow = 0;
      }
      for (let row = startAtRow; row < PONCHO_ROWS && row < startAtRow + length; row++) {
        pushPonchoPixel(name, col, row);
      }
    }
  }

  pushPonchoColumn('poncho1', 0, true);
  pushPonchoColumn('poncho1', 2, false);
  pushPonchoColumn('poncho1', 4, true);
  pushPonchoColumn('poncho1', 5, false, 0, Math.floor(PONCHO_ROWS / 2));

  pushPonchoColumn('poncho2', 9, true);
  pushPonchoColumn('poncho2', 7, false);
  pushPonchoColumn('poncho2', 8, true);
  pushPonchoColumn('poncho2', 5, false, Math.floor(PONCHO_ROWS / 2));

  pushPonchoColumn('poncho3', 6, true);
  pushPonchoColumn('poncho3', 3, false);
  pushPonchoColumn('poncho3', 1, true);

  result['hat'] = {
    height: PONCHO_ROWS * HAT_GAP_PIXELS / HAT_GAP_ROWS,
    width: PONCHO_COLS * HAT_GAP_PIXELS / HAT_GAP_ROWS,
    pixels: [null, null, null], // push initial 3 blank pixels
  };

  // The hat is an outward spiral centered around the middle of the
  // frame.
  for (let i = 0; i < HAT_RING_LIGHTS * HAT_RINGS; i++) {
    const angle = 2 * Math.PI * (i / HAT_RING_LIGHTS);
    //const center: [number, number] = [result.hat.width / 2, result.hat.height / 2];
    const radius = HAT_INITIAL_RADIUS_PIXELS + (HAT_GAP_PIXELS * (i / HAT_RING_LIGHTS));

    let x = Math.round(result['hat'].width / 2 - (radius * Math.sin(angle)));
    let y = Math.round(result['hat'].height / 2 + (radius * Math.cos(angle)));
    result.hat.pixels.push([x, y]);
  }

  const BIKE_RIGHT_WIDTH = 12;
  const BIKE_LEFT_WIDTH = 13;
  const BIKE_EXTRA_MIDDLE = 6;
  const BIKE_FRAME = 48;
  const BIKE_HEIGHT = 2 + BIKE_EXTRA_MIDDLE + BIKE_FRAME / 2;

  result['bike'] = {
    height: BIKE_HEIGHT,
    width: BIKE_RIGHT_WIDTH + BIKE_LEFT_WIDTH,
    pixels: []
  }

  for (let i = BIKE_LEFT_WIDTH; i < BIKE_LEFT_WIDTH + BIKE_RIGHT_WIDTH; i++ ) {
    result['bike'].pixels.push([i, BIKE_HEIGHT - 2]);
  }
  for (let i = BIKE_LEFT_WIDTH + BIKE_RIGHT_WIDTH - 1; i >= 0; i-- ) {
    result['bike'].pixels.push([i, BIKE_HEIGHT - 1]);
  }
  for (let i = 0; i < BIKE_LEFT_WIDTH; i++) {
    result['bike'].pixels.push([i, BIKE_HEIGHT - 2]);
  }

  for (let i = 0; i < BIKE_EXTRA_MIDDLE; i++) {
    result['bike'].pixels.push([BIKE_LEFT_WIDTH, BIKE_HEIGHT - 1 - (2 + i)]);
  }
  for (let i = 0; i < BIKE_FRAME / 2; i++) {
    result['bike'].pixels.push([BIKE_LEFT_WIDTH, BIKE_HEIGHT - 1 - (2 + BIKE_EXTRA_MIDDLE + i)]);
  }
  for (let i = BIKE_FRAME / 2 - 1; i >= 0; i--) {
    result['bike'].pixels.push([BIKE_LEFT_WIDTH, BIKE_HEIGHT - 1 - (2 + BIKE_EXTRA_MIDDLE + i)]);
  }

  return result;
}

export default kevin;
