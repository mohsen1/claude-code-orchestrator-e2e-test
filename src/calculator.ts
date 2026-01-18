import { add, subtract, multiply, divide } from './operations';

export function calculate(expression: string): number {
  const trimmed = expression.trim();

  if (!trimmed) {
    throw new Error('Invalid expression');
  }

  const match = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*([-+*\/])\s*(-?\d+(?:\.\d+)?)$/);

  if (!match) {
    throw new Error('Invalid expression format');
  }

  const [, num1Str, operator, num2Str] = match;
  const num1 = parseFloat(num1Str);
  const num2 = parseFloat(num2Str);

  switch (operator) {
    case '+':
      return add(num1, num2);
    case '-':
      return subtract(num1, num2);
    case '*':
      return multiply(num1, num2);
    case '/':
      return divide(num1, num2);
    default:
      throw new Error('Unsupported operator');
  }
}