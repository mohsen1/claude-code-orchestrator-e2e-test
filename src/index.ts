#!/usr/bin/env node

import { calculate } from './calculator.js';

if (process.argv.length < 3) {
  console.log('Usage: calculator <expression>');
  console.log('Example: calculator "2 + 3"');
  process.exit(1);
}

const expression = process.argv[2];

try {
  const result = calculate(expression);
  console.log(result);
} catch (error) {
  console.error('Error:', error instanceof Error ? error.message : 'Invalid expression');
  process.exit(1);
}