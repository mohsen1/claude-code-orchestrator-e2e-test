/**
 * Custom error class for division by zero
 */
export class DivisionByZeroError extends Error {
  constructor(message: string = 'Division by zero is not allowed') {
    super(message);
    this.name = 'DivisionByZeroError';
    Object.setPrototypeOf(this, DivisionByZeroError.prototype);
  }
}

/**
 * Result type for calculator operations
 */
export interface CalculatorResult {
  value: number;
  operation: string;
  timestamp: Date;
}

/**
 * Calculator class supporting basic arithmetic operations
 */
export class Calculator {
  /**
   * Adds two numbers
   * @param a First number
   * @param b Second number
   * @returns The sum of a and b
   */
  add(a: number, b: number): number {
    return a + b;
  }

  /**
   * Subtracts the second number from the first
   * @param a First number
   * @param b Second number
   * @returns The difference of a and b
   */
  subtract(a: number, b: number): number {
    return a - b;
  }

  /**
   * Multiplies two numbers
   * @param a First number
   * @param b Second number
   * @returns The product of a and b
   */
  multiply(a: number, b: number): number {
    return a * b;
  }

  /**
   * Divides the first number by the second
   * @param a Dividend
   * @param b Divisor
   * @returns The quotient of a and b
   * @throws {DivisionByZeroError} If b is zero
   */
  divide(a: number, b: number): number {
    if (b === 0) {
      throw new DivisionByZeroError(`Cannot divide ${a} by zero`);
    }
    return a / b;
  }

  /**
   * Performs a calculation and returns a detailed result
   * @param operation The operation to perform
   * @param a First number
   * @param b Second number
   * @returns A CalculatorResult object with value, operation, and timestamp
   */
  calculate(
    operation: 'add' | 'subtract' | 'multiply' | 'divide',
    a: number,
    b: number
  ): CalculatorResult {
    let value: number;

    switch (operation) {
      case 'add':
        value = this.add(a, b);
        break;
      case 'subtract':
        value = this.subtract(a, b);
        break;
      case 'multiply':
        value = this.multiply(a, b);
        break;
      case 'divide':
        value = this.divide(a, b);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    return {
      value,
      operation,
      timestamp: new Date()
    };
  }

  /**
   * Performs multiple operations in sequence
   * @param operations Array of operations to perform
   * @returns Array of CalculatorResult objects
   */
  calculateBatch(
    operations: Array<{ operation: 'add' | 'subtract' | 'multiply' | 'divide'; a: number; b: number }>
  ): CalculatorResult[] {
    return operations.map(op => this.calculate(op.operation, op.a, op.b));
  }
}

/**
 * Convenience function for addition
 */
export function add(a: number, b: number): number {
  const calculator = new Calculator();
  return calculator.add(a, b);
}

/**
 * Convenience function for subtraction
 */
export function subtract(a: number, b: number): number {
  const calculator = new Calculator();
  return calculator.subtract(a, b);
}

/**
 * Convenience function for multiplication
 */
export function multiply(a: number, b: number): number {
  const calculator = new Calculator();
  return calculator.multiply(a, b);
}

/**
 * Convenience function for division
 */
export function divide(a: number, b: number): number {
  const calculator = new Calculator();
  return calculator.divide(a, b);
}
