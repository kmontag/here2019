import commander from 'commander';
import server from './commands/server';
import watch from './commands/watch';
import compile from './commands/compile';
import fcrelay from './commands/fcrelay';

let validCmd: boolean = false;

commander.version('0.0.0-dev');

commander
  .command('server')
  .action(async (cmd) => {
    validCmd = true;
    await server();
  });

commander
  .command('watch')
  .action(async (cmd) => {
    validCmd = true;
    await watch();
  });

commander
  .command('compile')
  .action(async (cmd) => {
    validCmd = true;
    await compile();
  });

commander
  .command('fcrelay')
  .action(async (cmd) => {
    validCmd = true;
    await fcrelay();
  });

commander.parse(process.argv);

if (!validCmd) {
  commander.outputHelp();
}