#!/usr/bin/env node
import chalk from 'chalk';
import * as commander from 'commander';
import * as fs from 'fs';
import * as ProgressBar from 'progress';
import * as readline from 'readline';
import Frameplayer from './Frameplayer';
import prepare, { PrepareOptions } from './prepare';

let validCmd:boolean = false;

commander.version('0.0.1');

commander
  .command('prepare <input>')
  .option('-c, --config <config>', 'config file (see the AnimationConfig type for schema)')
  .option('-o, --output <output>', 'output target file')
  .action(async (input: string, cmd) => {
    validCmd = true;

    let ffmpegProgressBar: ProgressBar;
    let framesProgressBar: ProgressBar | undefined = undefined;

    let cleanupFramesProgressBar = () => {
      if (framesProgressBar) {
        framesProgressBar.terminate();
      }
      framesProgressBar = undefined;
    }

    let opts: PrepareOptions = {
      onStart: (commandLine: string) => {
        console.log(commandLine);
        ffmpegProgressBar = new ProgressBar('processing video...  [:bar] :percent ETA :etas', {total: 100});
      },
      onProgress: (progress) => {
        ffmpegProgressBar.update(progress.percent / 100);
      },
      onEnd: () => {
        ffmpegProgressBar.terminate();
        framesProgressBar = new ProgressBar('processing frames... [:bar] :percent ETA :etas', {total: 100});
      },
      onProcessFrame: (processed: number, total: number) => {
        if (!framesProgressBar) {
          framesProgressBar = new ProgressBar('processing frames... [:bar] :percent ETA :etas', {total: 100});
        }
        framesProgressBar.update(processed / total);
      },
    }
    let config = JSON.parse((await fs.promises.readFile(cmd.config)).toString('utf8'));
    const result = await prepare(input, config, opts);
    cleanupFramesProgressBar();
    await fs.promises.writeFile(cmd.output, result);
  });

commander
  .command('preview <input>')
  .action(async (input: string, cmd) => {
    validCmd = true;

    const source = await fs.promises.readFile(input);
    const player = new Frameplayer(source);

    let linesToClear: number | undefined = undefined;

    player.on('frame', (frameEvent) => {
      // See
      // https://stackoverflow.com/questions/23774574/clear-all-lines-in-nodejs-stream/23777620#23777620
      // for cursor trickery.
      if (linesToClear !== undefined) {
        readline.moveCursor(process.stdout, 0, -linesToClear);
        readline.clearLine(process.stdout, 0);
      }

      linesToClear = 0;
      for (const channelName in frameEvent.channels) {
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${chalk.bold(channelName)}:\n`);
        for (let pixel of frameEvent.channels[channelName].pixels) {
          process.stdout.write(chalk.rgb(pixel.r, pixel.g, pixel.b)('O'));
        }
        process.stdout.write("\n");

        linesToClear += 2;
      }
    });
    player.play();

    // Just wait for SIGINT
    await new Promise(() => { });
    console.log('there');
  });

commander.parse(process.argv);

if (!validCmd) {
  commander.outputHelp();
}