"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceBenchmark = exports.CalculatorAssertions = exports.CalculatorTestHelper = exports.operationTestCases = exports.edgeCases = exports.testFixtures = void 0;
const calculator_1 = require("./calculator");
/**
 * Test fixture data for calculator operations
 */
exports.testFixtures = {
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
exports.edgeCases = {
    verySmallNumber: 0.0000001,
    veryLargeNumber: 999999999999,
    infinity: Infinity,
    negativeInfinity: -Infinity
};
/**
 * Predefined test cases for each operation
 */
exports.operationTestCases = {
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
            errorType: calculator_1.DivisionByZeroError
        }
    ]
};
/**
 * Calculator test helper class
 * Provides utilities for testing calculator operations
 */
class CalculatorTestHelper {
    constructor() {
        this.calculator = new calculator_1.Calculator();
    }
    /**
     * Tests a calculator operation with given inputs
     */
    testOperation(operation, a, b, expected) {
        try {
            const result = this.calculator[operation](a, b);
            const passed = expected === undefined ? true : this.almostEqual(result, expected);
            return { result, passed };
        }
        catch (error) {
            return {
                result: 0,
                passed: false,
                error: error
            };
        }
    }
    /**
     * Tests that an operation throws an error
     */
    testOperationThrows(operation, a, b, errorType) {
        try {
            this.calculator[operation](a, b);
            return { thrown: false };
        }
        catch (error) {
            const isCorrectType = error instanceof errorType;
            return {
                thrown: isCorrectType,
                error: isCorrectType ? error : undefined
            };
        }
    }
    /**
     * Compares two numbers with approximate equality for floating point
     */
    almostEqual(a, b, epsilon = 0.0001) {
        return Math.abs(a - b) < epsilon;
    }
    /**
     * Creates a mock calculator with predefined results
     */
    static createMock() {
        return {
            add: jest.fn((a, b) => a + b),
            subtract: jest.fn((a, b) => a - b),
            multiply: jest.fn((a, b) => a * b),
            divide: jest.fn((a, b) => {
                if (b === 0)
                    throw new calculator_1.DivisionByZeroError();
                return a / b;
            })
        };
    }
    /**
     * Generates a batch of random test operations
     */
    static generateRandomBatch(count = 10) {
        const operations = [
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
    static validateResult(result) {
        return (result !== null &&
            typeof result === 'object' &&
            typeof result.value === 'number' &&
            typeof result.operation === 'string' &&
            result.timestamp instanceof Date);
    }
    /**
     * Measures execution time of a calculator operation
     */
    static measurePerformance(operation, calculator, a, b) {
        const start = performance.now();
        const result = calculator[operation](a, b);
        const end = performance.now();
        return {
            result,
            timeMs: end - start
        };
    }
}
exports.CalculatorTestHelper = CalculatorTestHelper;
/**
 * Assertion helpers for calculator tests
 */
class CalculatorAssertions {
    /**
     * Asserts that the result matches expected value
     */
    static assertResultEqual(actual, expected, message) {
        const epsilon = 0.0001;
        if (Math.abs(actual - expected) >= epsilon) {
            throw new Error(message || `Expected ${expected}, but got ${actual}`);
        }
    }
    /**
     * Asserts that an operation throws a specific error
     */
    static async assertThrows(fn, errorType, message) {
        try {
            fn();
            throw new Error(`Expected ${errorType.name} to be thrown, but no error was thrown`);
        }
        catch (error) {
            if (!(error instanceof errorType)) {
                throw new Error(message || `Expected ${errorType.name}, but got ${error.constructor.name}`);
            }
        }
    }
    /**
     * Asserts that a batch calculation produces correct results
     */
    static assertBatchResults(results, expectedValues) {
        if (results.length !== expectedValues.length) {
            throw new Error(`Expected ${expectedValues.length} results, but got ${results.length}`);
        }
        results.forEach((result, index) => {
            if (!CalculatorTestHelper.validateResult(result)) {
                throw new Error(`Result at index ${index} is not valid`);
            }
            const epsilon = 0.0001;
            if (Math.abs(result.value - expectedValues[index]) >= epsilon) {
                throw new Error(`Result at index ${index}: expected ${expectedValues[index]}, got ${result.value}`);
            }
        });
    }
}
exports.CalculatorAssertions = CalculatorAssertions;
/**
 * Performance benchmark utilities
 */
class PerformanceBenchmark {
    /**
     * Benchmarks a calculator operation over multiple iterations
     */
    static benchmarkOperation(operation, calculator, a, b, iterations = 1000) {
        const times = [];
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
    static runFullBenchmark(calculator) {
        return {
            add: this.benchmarkOperation('add', calculator, 100, 50),
            subtract: this.benchmarkOperation('subtract', calculator, 100, 50),
            multiply: this.benchmarkOperation('multiply', calculator, 100, 50),
            divide: this.benchmarkOperation('divide', calculator, 100, 50)
        };
    }
}
exports.PerformanceBenchmark = PerformanceBenchmark;
//# sourceMappingURL=test-utils.js.map