import { Calculator, CalculatorResult } from './calculator';
/**
 * Test fixture data for calculator operations
 */
export declare const testFixtures: {
    positiveNumbers: {
        a: number;
        b: number;
        expected: {
            sum: number;
            difference: number;
            product: number;
            quotient: number;
        };
    };
    negativeNumbers: {
        a: number;
        b: number;
        expected: {
            sum: number;
            difference: number;
            product: number;
            quotient: number;
        };
    };
    mixedNumbers: {
        a: number;
        b: number;
        expected: {
            sum: number;
            difference: number;
            product: number;
            quotient: number;
        };
    };
    decimalNumbers: {
        a: number;
        b: number;
        expected: {
            sum: number;
            difference: number;
            product: number;
            quotient: number;
        };
    };
    zeros: {
        a: number;
        b: number;
        expected: {
            sum: number;
            difference: number;
            product: number;
            quotient: number;
        };
    };
    largeNumbers: {
        a: number;
        b: number;
        expected: {
            sum: number;
            difference: number;
            product: number;
            quotient: number;
        };
    };
};
/**
 * Edge case test data
 */
export declare const edgeCases: {
    verySmallNumber: number;
    veryLargeNumber: number;
    infinity: number;
    negativeInfinity: number;
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
export declare const operationTestCases: Record<string, OperationTestCase[]>;
/**
 * Calculator test helper class
 * Provides utilities for testing calculator operations
 */
export declare class CalculatorTestHelper {
    private calculator;
    constructor();
    /**
     * Tests a calculator operation with given inputs
     */
    testOperation(operation: 'add' | 'subtract' | 'multiply' | 'divide', a: number, b: number, expected?: number): {
        result: number;
        passed: boolean;
        error?: Error;
    };
    /**
     * Tests that an operation throws an error
     */
    testOperationThrows(operation: 'add' | 'subtract' | 'multiply' | 'divide', a: number, b: number, errorType: new (...args: any[]) => Error): {
        thrown: boolean;
        error?: Error;
    };
    /**
     * Compares two numbers with approximate equality for floating point
     */
    private almostEqual;
    /**
     * Creates a mock calculator with predefined results
     */
    static createMock(): {
        add: jest.Mock<number, [number, number]>;
        subtract: jest.Mock<number, [number, number]>;
        multiply: jest.Mock<number, [number, number]>;
        divide: jest.Mock<number, [number, number]>;
    };
    /**
     * Generates a batch of random test operations
     */
    static generateRandomBatch(count?: number): Array<{
        operation: 'add' | 'subtract' | 'multiply' | 'divide';
        a: number;
        b: number;
    }>;
    /**
     * Validates a CalculatorResult object
     */
    static validateResult(result: CalculatorResult): boolean;
    /**
     * Measures execution time of a calculator operation
     */
    static measurePerformance(operation: 'add' | 'subtract' | 'multiply' | 'divide', calculator: Calculator, a: number, b: number): {
        result: number;
        timeMs: number;
    };
}
/**
 * Assertion helpers for calculator tests
 */
export declare class CalculatorAssertions {
    /**
     * Asserts that the result matches expected value
     */
    static assertResultEqual(actual: number, expected: number, message?: string): void;
    /**
     * Asserts that an operation throws a specific error
     */
    static assertThrows(fn: () => void, errorType: new (...args: any[]) => Error, message?: string): Promise<void>;
    /**
     * Asserts that a batch calculation produces correct results
     */
    static assertBatchResults(results: CalculatorResult[], expectedValues: number[]): void;
}
/**
 * Performance benchmark utilities
 */
export declare class PerformanceBenchmark {
    /**
     * Benchmarks a calculator operation over multiple iterations
     */
    static benchmarkOperation(operation: 'add' | 'subtract' | 'multiply' | 'divide', calculator: Calculator, a: number, b: number, iterations?: number): {
        totalTimeMs: number;
        avgTimeMs: number;
        minTimeMs: number;
        maxTimeMs: number;
    };
    /**
     * Runs a comprehensive performance suite
     */
    static runFullBenchmark(calculator: Calculator): Record<string, ReturnType<typeof PerformanceBenchmark.benchmarkOperation>>;
}
//# sourceMappingURL=test-utils.d.ts.map