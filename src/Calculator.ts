/**
 * Calculator class for basic arithmetic operations
 */
export class Calculator {
  /**
   * Validates that a value is a valid number
   * @param value - The value to validate
   * @throws Error if the value is not a valid number
   */
  private validateNumber(value: number): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`Invalid number: ${value}`);
    }
  }

  /**
   * Adds two numbers together
   * @param a - First number
   * @param b - Second number
   * @returns The sum of a and b
   */
  add(a: number, b: number): number {
    this.validateNumber(a);
    this.validateNumber(b);
    return a + b;
  }

  /**
   * Subtracts the second number from the first
   * @param a - First number
   * @param b - Second number
   * @returns The difference of a and b
   */
  subtract(a: number, b: number): number {
    this.validateNumber(a);
    this.validateNumber(b);
    return a - b;
  }

  /**
   * Multiplies two numbers
   * @param a - First number
   * @param b - Second number
   * @returns The product of a and b
   */
  multiply(a: number, b: number): number {
    this.validateNumber(a);
    this.validateNumber(b);
    return a * b;
  }

  /**
   * Divides the first number by the second
   * @param a - First number (dividend)
   * @param b - Second number (divisor)
   * @returns The quotient of a and b
   * @throws Error if attempting to divide by zero
   */
  divide(a: number, b: number): number {
    this.validateNumber(a);
    this.validateNumber(b);

    if (b === 0) {
      throw new Error('Division by zero is not allowed');
    }

    return a / b;
  }
}
