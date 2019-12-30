import { AnimationConfig } from 'frameplayer';
import here from './layouts/here';
import anna from './layouts/anna';
import kevin from './layouts/kevin';

export type Channels = AnimationConfig['channels'];
export type ChannelsSource = () => (Channels|Promise<Channels>);

const FPS = 10;

const sources: {[name: string]: ChannelsSource} = {
  here,
  anna,
  kevin,
};

export default async function generateConfig(): Promise<AnimationConfig> {
  const channels: AnimationConfig['channels'] = {};
  for (const sourceName in sources) {
    const results = await(sources[sourceName]());

    for (const channelName in results) {
      for (const pixel of results[channelName].pixels) {
        if (pixel && (pixel[0] >= results[channelName].width || pixel[0] < 0 || pixel[1] >= results[channelName].height || pixel[1] < 0)) {
          throw new Error(`Unexpected, pixel out of range for channel ${sourceName}-${channelName}:\n${JSON.stringify(results[channelName].pixels)}`);
        }
      }
      channels[`${sourceName}-${channelName}`] = results[channelName];
    }
  }
  return {
    fps: FPS,
    channels,
  }
}