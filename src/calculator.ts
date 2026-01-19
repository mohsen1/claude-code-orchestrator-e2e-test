export class Calculator {
  /**
   * Adds two numbers together
   * @param a - The first number
   * @param b - The second number
   * @returns The sum of the two numbers
   */
  add(a: number, b: number): number {
    return a + b;
  }

  /**
   * Subtracts the second number from the first
   * @param a - The number to subtract from
   * @param b - The number to subtract
   * @returns The difference of the two numbers
   */
  subtract(a: number, b: number): number {
    return a - b;
  }

  /**
   * Multiplies two numbers together
   * @param a - The first number
   * @param b - The second number
   * @returns The product of the two numbers
   */
  multiply(a: number, b: number): number {
    return a * b;
  }

  /**
   * Divides the first number by the second
   * @param numerator - The dividend
   * @param denominator - The divisor
   * @returns The quotient of the two numbers
   * @throws Error when attempting to divide by zero
   */
  divide(numerator: number, denominator: number): number {
    if (denominator === 0) {
      throw new Error('Division by zero is not allowed');
    }
    return numerator / denominator;
  }
}
