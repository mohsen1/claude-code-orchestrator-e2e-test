import { calculate } from './calculator.js';

const expression = process.argv[2];

if (!expression) {
  console.error('Usage: calculator "<expression>"');
  process.exit(1);
}

try {
  const result = calculate(expression);
  console.log(result);
} catch (error) {
  console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  process.exit(1);
}
