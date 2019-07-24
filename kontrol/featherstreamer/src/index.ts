import commander from 'commander';
import server from './commands/server';
import watcher from './commands/watcher';

let validCmd: boolean = false;

commander.version('0.0.0-dev');

commander
  .command('server')
  .action(async (cmd) => {
    validCmd = true;
    await server();
  });

commander
  .command('watcher')
  .action(async (cmd) => {
    validCmd = true;
    await watcher();
  });

commander.parse(process.argv);

if (!validCmd) {
  commander.outputHelp();
}