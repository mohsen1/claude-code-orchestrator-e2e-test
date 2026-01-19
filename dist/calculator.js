"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Calculator = void 0;
class Calculator {
    /**
     * Adds two numbers together
     * @param a - The first number
     * @param b - The second number
     * @returns The sum of the two numbers
     */
    add(a, b) {
        return a + b;
    }
    /**
     * Subtracts the second number from the first
     * @param a - The number to subtract from
     * @param b - The number to subtract
     * @returns The difference of the two numbers
     */
    subtract(a, b) {
        return a - b;
    }
    /**
     * Multiplies two numbers together
     * @param a - The first number
     * @param b - The second number
     * @returns The product of the two numbers
     */
    multiply(a, b) {
        return a * b;
    }
    /**
     * Divides the first number by the second
     * @param numerator - The dividend
     * @param denominator - The divisor
     * @returns The quotient of the two numbers
     * @throws Error when attempting to divide by zero
     */
    divide(numerator, denominator) {
        if (denominator === 0) {
            throw new Error('Division by zero is not allowed');
        }
        return numerator / denominator;
    }
}
exports.Calculator = Calculator;
//# sourceMappingURL=calculator.js.map