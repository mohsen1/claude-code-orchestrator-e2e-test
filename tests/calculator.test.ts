import { describe, it, expect } from 'vitest';
import { calculate } from '../src/calculator.js';

describe('Calculator', () => {
  describe('Addition', () => {
    it('should add two positive numbers', () => {
      expect(calculate('2 + 3')).toBe(5);
    });

    it('should add negative numbers', () => {
      expect(calculate('-5 + 3')).toBe(-2);
    });

    it('should add decimal numbers', () => {
      expect(calculate('2.5 + 1.5')).toBe(4);
    });

    it('should handle no spaces', () => {
      expect(calculate('10+20')).toBe(30);
    });
  });

  describe('Subtraction', () => {
    it('should subtract two numbers', () => {
      expect(calculate('10 - 3')).toBe(7);
    });

    it('should subtract with negative result', () => {
      expect(calculate('3 - 10')).toBe(-7);
    });

    it('should subtract negative numbers', () => {
      expect(calculate('5 - -3')).toBe(8);
    });

    it('should subtract decimal numbers', () => {
      expect(calculate('5.5 - 2.3')).toBeCloseTo(3.2, 10);
    });
  });

  describe('Multiplication', () => {
    it('should multiply two numbers', () => {
      expect(calculate('4 * 5')).toBe(20);
    });

    it('should multiply with negative numbers', () => {
      expect(calculate('-3 * 4')).toBe(-12);
    });

    it('should multiply decimal numbers', () => {
      expect(calculate('2.5 * 4')).toBe(10);
    });

    it('should multiply by zero', () => {
      expect(calculate('100 * 0')).toBe(0);
    });
  });

  describe('Division', () => {
    it('should divide two numbers', () => {
      expect(calculate('10 / 2')).toBe(5);
    });

    it('should divide with decimal result', () => {
      expect(calculate('5 / 2')).toBe(2.5);
    });

    it('should divide negative numbers', () => {
      expect(calculate('-10 / 2')).toBe(-5);
    });

    it('should divide decimal numbers', () => {
      expect(calculate('7.5 / 2.5')).toBe(3);
    });

    it('should throw error on division by zero', () => {
      expect(() => calculate('10 / 0')).toThrow('Division by zero');
    });
  });

  describe('Error Handling', () => {
    it('should throw error on invalid expression', () => {
      expect(() => calculate('not a number')).toThrow('Invalid expression');
    });

    it('should throw error on missing operator', () => {
      expect(() => calculate('10 20')).toThrow('Invalid expression');
    });

    it('should throw error on invalid operator', () => {
      expect(() => calculate('10 & 20')).toThrow('Invalid expression');
    });

    it('should throw error on incomplete expression', () => {
      expect(() => calculate('10 +')).toThrow('Invalid expression');
    });

    it('should throw error on extra content', () => {
      expect(() => calculate('10 + 20 + 30')).toThrow('Invalid expression');
    });
  });

  describe('Expression parsing', () => {
    it('handles expressions with various spacing', () => {
      expect(calculate('2+3')).toBe(5);
      expect(calculate('2 + 3')).toBe(5);
      expect(calculate('2   +   3')).toBe(5);
      expect(calculate('  2 + 3  ')).toBe(5)
    });
  });
});
