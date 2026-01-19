/**
 * Calculator module with basic arithmetic operations
 */

/**
 * Adds two numbers
 * @param a - First number
 * @param b - Second number
 * @returns The sum of a and b
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Subtracts the second number from the first
 * @param a - First number
 * @param b - Second number
 * @returns The difference of a and b
 */
export function subtract(a: number, b: number): number {
  return a - b;
}

/**
 * Multiplies two numbers
 * @param a - First number
 * @param b - Second number
 * @returns The product of a and b
 */
export function multiply(a: number, b: number): number {
  return a * b;
}

/**
 * Divides the first number by the second
 * @param a - Dividend
 * @param b - Divisor
 * @returns The quotient of a and b, or an Error if dividing by zero
 */
export function divide(a: number, b: number): number | Error {
  if (b === 0) {
    return new Error('Cannot divide by zero');
  }
  return a / b;
}
