import { calculate } from './calculator.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line: string) => {
  try {
    const result = calculate(line.trim());
    console.log(result);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('Unknown error');
    }
    process.exit(1);
  }
});
