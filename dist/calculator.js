"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Calculator = exports.DivisionByZeroError = void 0;
exports.add = add;
exports.subtract = subtract;
exports.multiply = multiply;
exports.divide = divide;
/**
 * Custom error class for division by zero
 */
class DivisionByZeroError extends Error {
    constructor(message = 'Division by zero is not allowed') {
        super(message);
        this.name = 'DivisionByZeroError';
        Object.setPrototypeOf(this, DivisionByZeroError.prototype);
    }
}
exports.DivisionByZeroError = DivisionByZeroError;
/**
 * Calculator class supporting basic arithmetic operations
 */
class Calculator {
    /**
     * Adds two numbers
     * @param a First number
     * @param b Second number
     * @returns The sum of a and b
     */
    add(a, b) {
        return a + b;
    }
    /**
     * Subtracts the second number from the first
     * @param a First number
     * @param b Second number
     * @returns The difference of a and b
     */
    subtract(a, b) {
        return a - b;
    }
    /**
     * Multiplies two numbers
     * @param a First number
     * @param b Second number
     * @returns The product of a and b
     */
    multiply(a, b) {
        return a * b;
    }
    /**
     * Divides the first number by the second
     * @param a Dividend
     * @param b Divisor
     * @returns The quotient of a and b
     * @throws {DivisionByZeroError} If b is zero
     */
    divide(a, b) {
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
    calculate(operation, a, b) {
        let value;
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
    calculateBatch(operations) {
        return operations.map(op => this.calculate(op.operation, op.a, op.b));
    }
}
exports.Calculator = Calculator;
/**
 * Convenience function for addition
 */
function add(a, b) {
    const calculator = new Calculator();
    return calculator.add(a, b);
}
/**
 * Convenience function for subtraction
 */
function subtract(a, b) {
    const calculator = new Calculator();
    return calculator.subtract(a, b);
}
/**
 * Convenience function for multiplication
 */
function multiply(a, b) {
    const calculator = new Calculator();
    return calculator.multiply(a, b);
}
/**
 * Convenience function for division
 */
function divide(a, b) {
    const calculator = new Calculator();
    return calculator.divide(a, b);
}
//# sourceMappingURL=calculator.js.map