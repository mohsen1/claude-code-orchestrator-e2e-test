#!/usr/bin/env node

import { Command } from 'commander';
import { hello, goodbye } from './greet';

const program = new Command();

program
  .name('greet')
  .description('A simple CLI tool for greeting users')
  .version('1.0.0');

program
  .command('hello')
  .description('Greet someone with hello')
  .argument('<name>', 'name of the person to greet')
  .action((name: string) => {
    console.log(hello(name));
  });

program
  .command('goodbye')
  .description('Greet someone with goodbye')
  .argument('<name>', 'name of the person to greet')
  .action((name: string) => {
    console.log(goodbye(name));
  });

program.parse();
