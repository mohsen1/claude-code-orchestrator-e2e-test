import { calculate } from './calculator.js';

function processInput(input: string): void {
  const lines = input.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      continue;
    }

    try {
      const result = calculate(trimmedLine);
      console.log(result);
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : 'Invalid expression'}`);
      process.exit(1);
    }
  }
}

function main(): void {
  if (process.stdin.isTTY) {
    console.error('Error: No input provided. Please pipe input or redirect from a file.');
    process.exit(1);
  }

  let input = '';

  process.stdin.on('data', (chunk) => {
    input += chunk;
  });

  process.stdin.on('end', () => {
    processInput(input);
  });

  process.stdin.on('error', (error) => {
    console.error(`Error reading input: ${error.message}`);
    process.exit(1);
  });
}

main();