import { AnimationConfig } from 'frameplayer';
import kevin from './layouts/kevin';

export type Channels = AnimationConfig['channels'];
export type ChannelsSource = () => (Channels|Promise<Channels>);

const FPS = 20;

const sources: {[name: string]: ChannelsSource} = {
  kevin,
};

export default async function frameplayerConfig(): Promise<AnimationConfig> {
  const channels: AnimationConfig['channels'] = {};
  for (const sourceName in sources) {
    const results = await(sources[sourceName]());
    for (const channel in results) {
      channels[`${sourceName}|${channel}`] = results[channel];
    }
  }
  return {
    fps: FPS,
    channels,
  }
}