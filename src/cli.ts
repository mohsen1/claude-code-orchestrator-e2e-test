#!/usr/bin/env node

import { Calculator } from './calculator';

// Get command line arguments (skip first two: node path and script path)
const args = process.argv.slice(2);

// Validate we have enough arguments
if (args.length < 3) {
  console.error('Usage: npm run calc <operation> <number1> <number2>');
  console.error('Operations: add, subtract, multiply, divide');
  process.exit(1);
}

const [operation, num1Str, num2Str] = args;

// Parse numbers
const num1 = parseFloat(num1Str);
const num2 = parseFloat(num2Str);

// Validate numbers
if (isNaN(num1) || isNaN(num2)) {
  console.error('Error: Both arguments must be valid numbers');
  process.exit(1);
}

// Create calculator instance
const calculator = new Calculator();

try {
  let result: number;

  // Perform operation
  switch (operation.toLowerCase()) {
    case 'add':
      result = calculator.add(num1, num2);
      break;
    case 'subtract':
      result = calculator.subtract(num1, num2);
      break;
    case 'multiply':
      result = calculator.multiply(num1, num2);
      break;
    case 'divide':
      result = calculator.divide(num1, num2);
      break;
    default:
      console.error(`Error: Unknown operation "${operation}"`);
      console.error('Valid operations: add, subtract, multiply, divide');
      process.exit(1);
  }

  // Output result
  console.log(result);

} catch (error) {
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
  } else {
    console.error('An unknown error occurred');
  }
  process.exit(1);
}
