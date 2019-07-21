import * as commander from 'commander';

let validCmd: boolean = false;

commander.version('0.0.1');

commander
  .command('server')
  .option('-c, --config <config>', 'config file')
  .action(async (config: string, cmd) => {
  });