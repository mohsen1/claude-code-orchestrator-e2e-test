export class Calculator {
  /**
   * Adds two numbers together
   * @param a - First number
   * @param b - Second number
   * @returns The sum of a and b
   */
  add(a: number, b: number): number {
    return a + b;
  }

  /**
   * Subtracts the second number from the first
   * @param a - First number
   * @param b - Second number
   * @returns The difference of a and b
   */
  subtract(a: number, b: number): number {
    return a - b;
  }

  /**
   * Multiplies two numbers together
   * @param a - First number
   * @param b - Second number
   * @returns The product of a and b
   */
  multiply(a: number, b: number): number {
    return a * b;
  }
}
