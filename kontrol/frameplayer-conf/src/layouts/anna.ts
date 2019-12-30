import { ChannelsSource, Channels } from '../generateConfig';
import PixelBuilder, { PixelPosition } from '../PixelBuilder';

function times(n: number, func: () => any) {
  for (let i = 0; i < n; i++) {
    func();
  }
}

const anna: ChannelsSource = () => {
  const height = 35;
  const width = 20;

  const getPixels = (isGoingRight: boolean): PixelPosition[] => {
    const pb = new PixelBuilder();
    pb.jump([isGoingRight ? width / 2 : (width / 2 - 1), height - 1]);

    const rightMultiplier = isGoingRight ? 1 : -1;
    times(height - 2, () => pb.up());
    times(5, () => pb.right(rightMultiplier));
    times(25, () => pb.down());
    times(3, () => pb.right(rightMultiplier));
    times(16, () => pb.up());

    return Array.from(pb.getPixels());
  }

  const result: Channels = {};
  result['poncho-stage-left'] = {
    height,
    width,
    pixels: getPixels(true),
  };
  result['poncho-stage-right'] = {
    height,
    width,
    pixels: getPixels(false),
  };

  return result;
};

export default anna;