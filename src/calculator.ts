/**
 * Calculator module with basic arithmetic operations
 * Includes error handling for edge cases like division by zero
 */

export class DivisionByZeroError extends Error {
  constructor(message: string = 'Division by zero is not allowed') {
    super(message);
    this.name = 'DivisionByZeroError';
  }
}

export class OverflowError extends Error {
  constructor(message: string = 'Number overflow detected') {
    super(message);
    this.name = 'OverflowError';
  }
}

export class UnderflowError extends Error {
  constructor(message: string = 'Number underflow detected') {
    super(message);
    this.name = 'UnderflowError';
  }
}

export class Calculator {
  /**
   * Adds two numbers
   */
  add(a: number, b: number): number {
    const result = a + b;

    // Check for overflow
    if (!Number.isFinite(result)) {
      if (result > 0) {
        throw new OverflowError(`Addition overflow: ${a} + ${b} results in infinity`);
      } else {
        throw new UnderflowError(`Addition underflow: ${a} + ${b} results in negative infinity`);
      }
    }

    return result;
  }

  /**
   * Subtracts b from a
   */
  subtract(a: number, b: number): number {
    const result = a - b;

    // Check for overflow/underflow
    if (!Number.isFinite(result)) {
      if (result > 0) {
        throw new OverflowError(`Subtraction overflow: ${a} - ${b} results in infinity`);
      } else {
        throw new UnderflowError(`Subtraction underflow: ${a} - ${b} results in negative infinity`);
      }
    }

    return result;
  }

  /**
   * Multiplies two numbers
   */
  multiply(a: number, b: number): number {
    const result = a * b;

    // Check for overflow/underflow
    if (!Number.isFinite(result)) {
      if (result > 0) {
        throw new OverflowError(`Multiplication overflow: ${a} * ${b} results in infinity`);
      } else {
        throw new UnderflowError(`Multiplication underflow: ${a} * ${b} results in negative infinity`);
      }
    }

    return result;
  }

  /**
   * Divides a by b
   * @throws {DivisionByZeroError} when b is zero
   */
  divide(a: number, b: number): number {
    if (b === 0) {
      throw new DivisionByZeroError(`Cannot divide ${a} by zero`);
    }

    const result = a / b;

    // Check for overflow/underflow
    if (!Number.isFinite(result)) {
      if (result > 0) {
        throw new OverflowError(`Division overflow: ${a} / ${b} results in infinity`);
      } else {
        throw new UnderflowError(`Division underflow: ${a} / ${b} results in negative infinity`);
      }
    }

    return result;
  }

  /**
   * Calculates power (a^b)
   */
  power(a: number, b: number): number {
    const result = Math.pow(a, b);

    // Check for overflow/underflow
    if (!Number.isFinite(result)) {
      if (result > 0) {
        throw new OverflowError(`Power overflow: ${a} ^ ${b} results in infinity`);
      } else {
        throw new UnderflowError(`Power underflow: ${a} ^ ${b} results in negative infinity`);
      }
    }

    return result;
  }

  /**
   * Calculates square root
   * @throws {Error} when a is negative
   */
  sqrt(a: number): number {
    if (a < 0) {
      throw new Error(`Cannot calculate square root of negative number: ${a}`);
    }

    return Math.sqrt(a);
  }
}
