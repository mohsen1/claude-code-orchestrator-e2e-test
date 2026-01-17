import { parseExpression } from './parser';
import { add, subtract, multiply, divide } from './operations';

export function calculate(expression: string): number {
  const parsed = parseExpression(expression);

  switch (parsed.operator) {
    case 'add':
      return add(parsed.left, parsed.right);
    case 'subtract':
      return subtract(parsed.left, parsed.right);
    case 'multiply':
      return multiply(parsed.left, parsed.right);
    case 'divide':
      return divide(parsed.left, parsed.right);
    default:
      throw new Error(`Unsupported operator: ${parsed.operator}`);
  }
}
