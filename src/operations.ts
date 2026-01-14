export type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

export function performOperation(
  left: number,
  operator: Operation,
  right: number
): number {
  switch (operator) {
    case 'add':
      return add(left, right);
    case 'subtract':
      return subtract(left, right);
    case 'multiply':
      return multiply(left, right);
    case 'divide':
      return divide(left, right);
    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
}

export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}
