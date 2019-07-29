import frameplayerConfig from "../frameplayerConfig";

/**
 * Output the config-wide frameplayer config file.
 */
export default async function frameplayer() {
  const config = await frameplayerConfig();
  console.log(JSON.stringify(config, null, 2));
}