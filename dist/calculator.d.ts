/**
 * Custom error class for division by zero
 */
export declare class DivisionByZeroError extends Error {
    constructor(message?: string);
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
export declare class Calculator {
    /**
     * Adds two numbers
     * @param a First number
     * @param b Second number
     * @returns The sum of a and b
     */
    add(a: number, b: number): number;
    /**
     * Subtracts the second number from the first
     * @param a First number
     * @param b Second number
     * @returns The difference of a and b
     */
    subtract(a: number, b: number): number;
    /**
     * Multiplies two numbers
     * @param a First number
     * @param b Second number
     * @returns The product of a and b
     */
    multiply(a: number, b: number): number;
    /**
     * Divides the first number by the second
     * @param a Dividend
     * @param b Divisor
     * @returns The quotient of a and b
     * @throws {DivisionByZeroError} If b is zero
     */
    divide(a: number, b: number): number;
    /**
     * Performs a calculation and returns a detailed result
     * @param operation The operation to perform
     * @param a First number
     * @param b Second number
     * @returns A CalculatorResult object with value, operation, and timestamp
     */
    calculate(operation: 'add' | 'subtract' | 'multiply' | 'divide', a: number, b: number): CalculatorResult;
    /**
     * Performs multiple operations in sequence
     * @param operations Array of operations to perform
     * @returns Array of CalculatorResult objects
     */
    calculateBatch(operations: Array<{
        operation: 'add' | 'subtract' | 'multiply' | 'divide';
        a: number;
        b: number;
    }>): CalculatorResult[];
}
/**
 * Convenience function for addition
 */
export declare function add(a: number, b: number): number;
/**
 * Convenience function for subtraction
 */
export declare function subtract(a: number, b: number): number;
/**
 * Convenience function for multiplication
 */
export declare function multiply(a: number, b: number): number;
/**
 * Convenience function for division
 */
export declare function divide(a: number, b: number): number;
//# sourceMappingURL=calculator.d.ts.map