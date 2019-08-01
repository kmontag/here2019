import generateConfig from './generateConfig';

(async () => {
  const config = await generateConfig();
// Just output the config and exit.
  console.log(JSON.stringify(config, null, 2));
})();
