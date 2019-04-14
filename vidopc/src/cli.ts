#!/usr/bin/env node
import chalk from 'chalk';
import commander from 'commander';
import fs from 'fs';
import ProgressBar from 'progress';

const vidopc = require('vidopc');
var validCmd:boolean = false;

commander.version('0.0.1');

commander
  .command('prepare <input>')
  .option('-c, --config <config>', 'config file (see the AnimationConfig type for schema)')
  .option('-o, --output <output>', 'output target file')
  .action((input: string, cmd) => {
    validCmd = true;

    let ffmpegProgressBar: ProgressBar;
    let framesProgressBar: ProgressBar = undefined;

    let cleanupFramesProgressBar = () => {
      if (framesProgressBar) {
        framesProgressBar.terminate();
      }
      framesProgressBar = undefined;
    }

    let opts = {
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
    let config = JSON.parse(fs.readFileSync(cmd.config));
    vidopc.prepare(input, cmd.output, config, opts).then((() => framesProgressBar.terminate()));
  });

commander
  .command('preview <input>')
  .action(async (input: string, cmd) => {
    validCmd = true;

    let source = await fs.promises.readFile(input);
    let animation = new vidopc.Animation(source);

    let linesToClear: number = undefined;

    animation.play((frame, index) => {
      // See
      // https://stackoverflow.com/questions/23774574/clear-all-lines-in-nodejs-stream/23777620#23777620
      // for cursor trickery.
      if (linesToClear !== undefined) {
        process.stdout.moveCursor(0, -linesToClear);
        process.stdout.clearLine();
      }

      linesToClear = 0;
      for (let targetName in frame) {
        process.stdout.cursorTo(0);
        process.stdout.write(`${chalk.bold(targetName)}:\n`);
        for (let pixel of frame[targetName]) {
          process.stdout.write(chalk.rgb(pixel.r, pixel.g, pixel.b)('O'));
        }
        process.stdout.write("\n");

        linesToClear += 2;
      }
    });
  });

commander.parse(process.argv);

if (!validCmd) {
  commander.outputHelp();
}