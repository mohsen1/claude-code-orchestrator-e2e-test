/**
 * Calculator class providing basic arithmetic operations.
 */
export class Calculator {
  /**
   * Adds two numbers together.
   * @param a - The first number
   * @param b - The second number
   * @returns The sum of a and b
   */
  add(a: number, b: number): number {
    return a + b;
  }

  /**
   * Subtracts the second number from the first.
   * @param a - The number to subtract from
   * @param b - The number to subtract
   * @returns The difference of a and b
   */
  subtract(a: number, b: number): number {
    return a - b;
  }
}
