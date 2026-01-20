#!/usr/bin/env node
import { Command } from 'commander';
import * as counter from './counter';

const program = new Command();

program
  .name('counter')
  .description('A minimal command-line counter application')
  .version('1.0.0');

program
  .command('increment')
  .description('Increase counter by 1')
  .action(() => {
    const value = counter.increment();
    console.log(`Counter incremented to: ${value}`);
  });

program
  .command('decrement')
  .description('Decrease counter by 1')
  .action(() => {
    const value = counter.decrement();
    console.log(`Counter decremented to: ${value}`);
  });

program
  .command('show')
  .description('Display current counter value')
  .action(() => {
    const value = counter.show();
    console.log(`Current counter value: ${value}`);
  });

program
  .command('reset')
  .description('Reset counter to 0')
  .action(() => {
    const value = counter.reset();
    console.log(`Counter reset to: ${value}`);
  });

program.parse(process.argv);
