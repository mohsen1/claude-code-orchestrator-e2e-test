/**
 * Calculator class with basic arithmetic operations
 */
export class Calculator {
  /**
   * Add two numbers
   */
  add(a: number, b: number): number {
    return a + b;
  }

  /**
   * Subtract b from a
   */
  subtract(a: number, b: number): number {
    return a - b;
  }

  /**
   * Multiply two numbers
   */
  multiply(a: number, b: number): number {
    return a * b;
  }

  /**
   * Divide a by b
   */
  divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error("Cannot divide by zero");
    }
    return a / b;
  }
}
