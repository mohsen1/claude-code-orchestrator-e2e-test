/**
 * Test suite for Calculator module
 * Tests basic arithmetic operations including positive/negative numbers, decimals, and zero values
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { add, subtract, multiply, divide } from './calculator';

describe('Calculator', () => {
  // Setup and teardown examples (optional but good practice)
  let testValue: number;

  beforeEach(() => {
    // Setup before each test
    testValue = 10;
  });

  afterEach(() => {
    // Cleanup after each test
    testValue = 0;
  });

  describe('addition', () => {
    it('should add two positive numbers correctly', () => {
      expect(add(5, 3)).toBe(8);
      expect(add(10, 20)).toBe(30);
      expect(add(100, 200)).toBe(300);
    });

    it('should add two negative numbers correctly', () => {
      expect(add(-5, -3)).toBe(-8);
      expect(add(-10, -20)).toBe(-30);
      expect(add(-100, -200)).toBe(-300);
    });

    it('should add positive and negative numbers correctly', () => {
      expect(add(5, -3)).toBe(2);
      expect(add(-5, 3)).toBe(-2);
      expect(add(10, -20)).toBe(-10);
      expect(add(-10, 20)).toBe(10);
    });

    it('should handle decimal numbers correctly', () => {
      expect(add(0.1, 0.2)).toBeCloseTo(0.3, 10);
      expect(add(1.5, 2.5)).toBe(4.0);
      expect(add(-0.1, -0.2)).toBeCloseTo(-0.3, 10);
      expect(add(10.5, -5.5)).toBe(5.0);
    });

    it('should handle zero values correctly', () => {
      expect(add(0, 0)).toBe(0);
      expect(add(5, 0)).toBe(5);
      expect(add(0, 5)).toBe(5);
      expect(add(-5, 0)).toBe(-5);
      expect(add(0, -5)).toBe(-5);
    });

    it('should handle very large numbers', () => {
      expect(add(1000000, 2000000)).toBe(3000000);
      expect(add(Number.MAX_SAFE_INTEGER, 0)).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe('subtraction', () => {
    it('should subtract two positive numbers correctly', () => {
      expect(subtract(10, 5)).toBe(5);
      expect(subtract(20, 10)).toBe(10);
      expect(subtract(100, 50)).toBe(50);
    });

    it('should subtract two negative numbers correctly', () => {
      expect(subtract(-10, -5)).toBe(-5);
      expect(subtract(-5, -10)).toBe(5);
      expect(subtract(-100, -50)).toBe(-50);
    });

    it('should subtract positive and negative numbers correctly', () => {
      expect(subtract(10, -5)).toBe(15);
      expect(subtract(-10, 5)).toBe(-15);
      expect(subtract(5, -10)).toBe(15);
      expect(subtract(-5, 10)).toBe(-15);
    });

    it('should handle decimal numbers correctly', () => {
      expect(subtract(0.5, 0.3)).toBeCloseTo(0.2, 10);
      expect(subtract(2.5, 1.5)).toBe(1.0);
      expect(subtract(-0.5, -0.3)).toBeCloseTo(-0.2, 10);
      expect(subtract(10.5, 5.5)).toBe(5.0);
    });

    it('should handle zero values correctly', () => {
      expect(subtract(0, 0)).toBe(0);
      expect(subtract(5, 0)).toBe(5);
      expect(subtract(0, 5)).toBe(-5);
      expect(subtract(-5, 0)).toBe(-5);
      expect(subtract(0, -5)).toBe(5);
    });

    it('should return zero when subtracting a number from itself', () => {
      expect(subtract(5, 5)).toBe(0);
      expect(subtract(-5, -5)).toBe(0);
      expect(subtract(0, 0)).toBe(0);
      expect(subtract(123.456, 123.456)).toBeCloseTo(0, 10);
    });
  });

  describe('multiplication', () => {
    it('should multiply two positive numbers correctly', () => {
      expect(multiply(5, 3)).toBe(15);
      expect(multiply(10, 20)).toBe(200);
      expect(multiply(100, 2)).toBe(200);
    });

    it('should multiply two negative numbers correctly', () => {
      expect(multiply(-5, -3)).toBe(15);
      expect(multiply(-10, -20)).toBe(200);
      expect(multiply(-2, -5)).toBe(10);
    });

    it('should multiply positive and negative numbers correctly', () => {
      expect(multiply(5, -3)).toBe(-15);
      expect(multiply(-5, 3)).toBe(-15);
      expect(multiply(10, -2)).toBe(-20);
      expect(multiply(-10, 2)).toBe(-20);
    });

    it('should handle decimal numbers correctly', () => {
      expect(multiply(0.5, 0.4)).toBeCloseTo(0.2, 10);
      expect(multiply(1.5, 2.0)).toBe(3.0);
      expect(multiply(-0.5, 0.4)).toBeCloseTo(-0.2, 10);
      expect(multiply(2.5, 4.0)).toBe(10.0);
    });

    it('should handle zero values correctly', () => {
      expect(multiply(0, 0)).toBe(0);
      expect(multiply(5, 0)).toBe(0);
      expect(multiply(0, 5)).toBe(0);
      expect(multiply(-5, 0)).toBe(0);
      expect(multiply(0, -5)).toBe(0);
    });

    it('should handle multiplication by one', () => {
      expect(multiply(5, 1)).toBe(5);
      expect(multiply(1, 5)).toBe(5);
      expect(multiply(-5, 1)).toBe(-5);
      expect(multiply(1, -5)).toBe(-5);
    });

    it('should handle very large numbers', () => {
      expect(multiply(1000, 1000)).toBe(1000000);
      expect(multiply(10000, 10000)).toBe(100000000);
    });
  });

  describe('division', () => {
    it('should divide two positive numbers correctly', () => {
      expect(divide(10, 2)).toBe(5);
      expect(divide(20, 4)).toBe(5);
      expect(divide(100, 10)).toBe(10);
    });

    it('should divide two negative numbers correctly', () => {
      expect(divide(-10, -2)).toBe(5);
      expect(divide(-20, -4)).toBe(5);
      expect(divide(-100, -10)).toBe(10);
    });

    it('should divide positive and negative numbers correctly', () => {
      expect(divide(10, -2)).toBe(-5);
      expect(divide(-10, 2)).toBe(-5);
      expect(divide(20, -4)).toBe(-5);
      expect(divide(-20, 4)).toBe(-5);
    });

    it('should handle decimal numbers correctly', () => {
      expect(divide(0.5, 0.2)).toBeCloseTo(2.5, 10);
      expect(divide(1.5, 0.5)).toBe(3.0);
      expect(divide(-0.6, 0.2)).toBeCloseTo(-3.0, 10);
      expect(divide(10.5, 2.5)).toBeCloseTo(4.2, 10);
    });

    it('should handle zero in numerator correctly', () => {
      expect(divide(0, 5)).toBe(0);
      expect(divide(0, -5)).toBe(0);
      expect(divide(0, 100)).toBe(0);
    });

    it('should throw error when dividing by zero', () => {
      expect(() => divide(5, 0)).toThrow('Cannot divide by zero');
      expect(() => divide(0, 0)).toThrow('Cannot divide by zero');
      expect(() => divide(-5, 0)).toThrow('Cannot divide by zero');
      expect(() => divide(100, 0)).toThrow('Cannot divide by zero');
    });

    it('should handle division by one', () => {
      expect(divide(5, 1)).toBe(5);
      expect(divide(-5, 1)).toBe(-5);
      expect(divide(0, 1)).toBe(0);
    });

    it('should handle division resulting in decimals', () => {
      expect(divide(10, 3)).toBeCloseTo(3.3333333333, 10);
      expect(divide(1, 3)).toBeCloseTo(0.3333333333, 10);
      expect(divide(5, 2)).toBe(2.5);
    });
  });

  describe('edge cases and comprehensive tests', () => {
    it('should handle very small decimal numbers', () => {
      expect(add(0.0001, 0.0002)).toBeCloseTo(0.0003, 10);
      expect(multiply(0.001, 0.001)).toBeCloseTo(0.000001, 10);
    });

    it('should maintain precision with multiple operations', () => {
      const result = add(multiply(2, 3), subtract(10, 5));
      expect(result).toBe(11);
    });

    it('should handle inverse operations', () => {
      // Addition and subtraction are inverse
      const num1 = 50;
      const num2 = 25;
      expect(subtract(add(num1, num2), num2)).toBe(num1);

      // Multiplication and division are inverse
      expect(divide(multiply(num1, num2), num2)).toBe(num1);
    });

    it('should handle identity properties', () => {
      // Additive identity
      expect(add(42, 0)).toBe(42);
      expect(add(0, 42)).toBe(42);

      // Multiplicative identity
      expect(multiply(42, 1)).toBe(42);
      expect(multiply(1, 42)).toBe(42);
    });

    it('should handle commutative properties', () => {
      expect(add(5, 10)).toBe(add(10, 5));
      expect(multiply(5, 10)).toBe(multiply(10, 5));
    });

    it('should handle associative properties', () => {
      const a = 2, b = 3, c = 4;
      expect(add(add(a, b), c)).toBe(add(a, add(b, c)));
      expect(multiply(multiply(a, b), c)).toBe(multiply(a, multiply(b, c)));
    });

    it('should handle distributive property', () => {
      const a = 2, b = 3, c = 4;
      expect(multiply(a, add(b, c))).toBe(add(multiply(a, b), multiply(a, c)));
    });
  });
});
