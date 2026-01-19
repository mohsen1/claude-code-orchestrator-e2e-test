import { Calculator, CalculatorResult, DivisionByZeroError } from './calculator';

/**
 * Test fixture data for calculator operations
 */
export const testFixtures = {
  positiveNumbers: {
    a: 10,
    b: 5,
    expected: {
      sum: 15,
      difference: 5,
      product: 50,
      quotient: 2
    }
  },
  negativeNumbers: {
    a: -10,
    b: -5,
    expected: {
      sum: -15,
      difference: -5,
      product: 50,
      quotient: 2
    }
  },
  mixedNumbers: {
    a: 10,
    b: -5,
    expected: {
      sum: 5,
      difference: 15,
      product: -50,
      quotient: -2
    }
  },
  decimalNumbers: {
    a: 10.5,
    b: 2.5,
    expected: {
      sum: 13.0,
      difference: 8.0,
      product: 26.25,
      quotient: 4.2
    }
  },
  zeros: {
    a: 0,
    b: 0,
    expected: {
      sum: 0,
      difference: 0,
      product: 0,
      quotient: NaN // Division by zero
    }
  },
  largeNumbers: {
    a: 1000000,
    b: 1000,
    expected: {
      sum: 1001000,
      difference: 999000,
      product: 1000000000,
      quotient: 1000
    }
  }
};

/**
 * Edge case test data
 */
export const edgeCases = {
  verySmallNumber: 0.0000001,
  veryLargeNumber: 999999999999,
  infinity: Infinity,
  negativeInfinity: -Infinity
};

/**
 * Operation test suite template
 */
export interface OperationTestCase {
  description: string;
  a: number;
  b: number;
  expected: number;
  shouldThrow?: boolean;
  errorType?: new (...args: any[]) => Error;
}

/**
 * Predefined test cases for each operation
 */
export const operationTestCases: Record<string, OperationTestCase[]> = {
  add: [
    { description: 'positive numbers', a: 10, b: 5, expected: 15 },
    { description: 'negative numbers', a: -10, b: -5, expected: -15 },
    { description: 'mixed signs', a: 10, b: -5, expected: 5 },
    { description: 'decimals', a: 10.5, b: 2.5, expected: 13.0 },
    { description: 'zeros', a: 0, b: 0, expected: 0 }
  ],
  subtract: [
    { description: 'positive numbers', a: 10, b: 5, expected: 5 },
    { description: 'negative numbers', a: -10, b: -5, expected: -5 },
    { description: 'mixed signs', a: 10, b: -5, expected: 15 },
    { description: 'decimals', a: 10.5, b: 2.5, expected: 8.0 },
    { description: 'zeros', a: 0, b: 0, expected: 0 }
  ],
  multiply: [
    { description: 'positive numbers', a: 10, b: 5, expected: 50 },
    { description: 'negative numbers', a: -10, b: -5, expected: 50 },
    { description: 'mixed signs', a: 10, b: -5, expected: -50 },
    { description: 'decimals', a: 10.5, b: 2.5, expected: 26.25 },
    { description: 'zeros', a: 0, b: 0, expected: 0 }
  ],
  divide: [
    { description: 'positive numbers', a: 10, b: 5, expected: 2 },
    { description: 'negative numbers', a: -10, b: -5, expected: 2 },
    { description: 'mixed signs', a: 10, b: -5, expected: -2 },
    { description: 'decimals', a: 10.5, b: 2.5, expected: 4.2 },
    {
      description: 'divide by zero',
      a: 10,
      b: 0,
      expected: 0,
      shouldThrow: true,
      errorType: DivisionByZeroError
    }
  ]
};

/**
 * Calculator test helper class
 * Provides utilities for testing calculator operations
 */
export class CalculatorTestHelper {
  private calculator: Calculator;

  constructor() {
    this.calculator = new Calculator();
  }

  /**
   * Tests a calculator operation with given inputs
   */
  testOperation(
    operation: 'add' | 'subtract' | 'multiply' | 'divide',
    a: number,
    b: number,
    expected?: number
  ): { result: number; passed: boolean; error?: Error } {
    try {
      const result = this.calculator[operation](a, b);
      const passed = expected === undefined ? true : this.almostEqual(result, expected);
      return { result, passed };
    } catch (error) {
      return {
        result: 0,
        passed: false,
        error: error as Error
      };
    }
  }

  /**
   * Tests that an operation throws an error
   */
  testOperationThrows(
    operation: 'add' | 'subtract' | 'multiply' | 'divide',
    a: number,
    b: number,
    errorType: new (...args: any[]) => Error
  ): { thrown: boolean; error?: Error } {
    try {
      this.calculator[operation](a, b);
      return { thrown: false };
    } catch (error) {
      const isCorrectType = error instanceof errorType;
      return {
        thrown: isCorrectType,
        error: isCorrectType ? (error as Error) : undefined
      };
    }
  }

  /**
   * Compares two numbers with approximate equality for floating point
   */
  private almostEqual(a: number, b: number, epsilon: number = 0.0001): boolean {
    return Math.abs(a - b) < epsilon;
  }

  /**
   * Creates a mock calculator with predefined results
   */
  static createMock(): {
    add: jest.Mock<number, [number, number]>;
    subtract: jest.Mock<number, [number, number]>;
    multiply: jest.Mock<number, [number, number]>;
    divide: jest.Mock<number, [number, number]>;
  } {
    return {
      add: jest.fn((a: number, b: number) => a + b),
      subtract: jest.fn((a: number, b: number) => a - b),
      multiply: jest.fn((a: number, b: number) => a * b),
      divide: jest.fn((a: number, b: number) => {
        if (b === 0) throw new DivisionByZeroError();
        return a / b;
      })
    };
  }

  /**
   * Generates a batch of random test operations
   */
  static generateRandomBatch(count: number = 10): Array<{
    operation: 'add' | 'subtract' | 'multiply' | 'divide';
    a: number;
    b: number;
  }> {
    const operations: Array<'add' | 'subtract' | 'multiply' | 'divide'> = [
      'add',
      'subtract',
      'multiply',
      'divide'
    ];

    return Array.from({ length: count }, () => ({
      operation: operations[Math.floor(Math.random() * operations.length)],
      a: Math.floor(Math.random() * 100),
      b: Math.floor(Math.random() * 10) + 1 // Avoid zero for division
    }));
  }

  /**
   * Validates a CalculatorResult object
   */
  static validateResult(result: CalculatorResult): boolean {
    return (
      result !== null &&
      typeof result === 'object' &&
      typeof result.value === 'number' &&
      typeof result.operation === 'string' &&
      result.timestamp instanceof Date
    );
  }

  /**
   * Measures execution time of a calculator operation
   */
  static measurePerformance(
    operation: 'add' | 'subtract' | 'multiply' | 'divide',
    calculator: Calculator,
    a: number,
    b: number
  ): { result: number; timeMs: number } {
    const start = performance.now();
    const result = calculator[operation](a, b);
    const end = performance.now();
    return {
      result,
      timeMs: end - start
    };
  }
}

/**
 * Assertion helpers for calculator tests
 */
export class CalculatorAssertions {
  /**
   * Asserts that the result matches expected value
   */
  static assertResultEqual(
    actual: number,
    expected: number,
    message?: string
  ): void {
    const epsilon = 0.0001;
    if (Math.abs(actual - expected) >= epsilon) {
      throw new Error(
        message || `Expected ${expected}, but got ${actual}`
      );
    }
  }

  /**
   * Asserts that an operation throws a specific error
   */
  static async assertThrows(
    fn: () => void,
    errorType: new (...args: any[]) => Error,
    message?: string
  ): Promise<void> {
    try {
      fn();
      throw new Error(`Expected ${errorType.name} to be thrown, but no error was thrown`);
    } catch (error) {
      if (!(error instanceof errorType)) {
        throw new Error(
          message || `Expected ${errorType.name}, but got ${(error as Error).constructor.name}`
        );
      }
    }
  }

  /**
   * Asserts that a batch calculation produces correct results
   */
  static assertBatchResults(
    results: CalculatorResult[],
    expectedValues: number[]
  ): void {
    if (results.length !== expectedValues.length) {
      throw new Error(
        `Expected ${expectedValues.length} results, but got ${results.length}`
      );
    }

    results.forEach((result, index) => {
      if (!CalculatorTestHelper.validateResult(result)) {
        throw new Error(`Result at index ${index} is not valid`);
      }

      const epsilon = 0.0001;
      if (Math.abs(result.value - expectedValues[index]) >= epsilon) {
        throw new Error(
          `Result at index ${index}: expected ${expectedValues[index]}, got ${result.value}`
        );
      }
    });
  }
}

/**
 * Performance benchmark utilities
 */
export class PerformanceBenchmark {
  /**
   * Benchmarks a calculator operation over multiple iterations
   */
  static benchmarkOperation(
    operation: 'add' | 'subtract' | 'multiply' | 'divide',
    calculator: Calculator,
    a: number,
    b: number,
    iterations: number = 1000
  ): { totalTimeMs: number; avgTimeMs: number; minTimeMs: number; maxTimeMs: number } {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const { timeMs } = CalculatorTestHelper.measurePerformance(operation, calculator, a, b);
      times.push(timeMs);
    }

    return {
      totalTimeMs: times.reduce((sum, time) => sum + time, 0),
      avgTimeMs: times.reduce((sum, time) => sum + time, 0) / times.length,
      minTimeMs: Math.min(...times),
      maxTimeMs: Math.max(...times)
    };
  }

  /**
   * Runs a comprehensive performance suite
   */
  static runFullBenchmark(
    calculator: Calculator
  ): Record<string, ReturnType<typeof PerformanceBenchmark.benchmarkOperation>> {
    return {
      add: this.benchmarkOperation('add', calculator, 100, 50),
      subtract: this.benchmarkOperation('subtract', calculator, 100, 50),
      multiply: this.benchmarkOperation('multiply', calculator, 100, 50),
      divide: this.benchmarkOperation('divide', calculator, 100, 50)
    };
  }
}
