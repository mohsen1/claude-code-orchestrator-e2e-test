import { describe, it, expect } from 'vitest';
import { calculate } from '../src/calculator';

describe('Calculator', () => {
  describe('basic operations', () => {
    it('calculates addition', () => {
      expect(calculate('2 + 3')).toBe(5);
    });

    it('calculates subtraction', () => {
      expect(calculate('10 - 3')).toBe(7);
    });

    it('calculates multiplication', () => {
      expect(calculate('4 * 5')).toBe(20);
    });

    it('calculates division', () => {
      expect(calculate('10 / 2')).toBe(5);
    });
  });

  describe('with decimal numbers', () => {
    it('calculates with decimal operands', () => {
      expect(calculate('1.5 + 2.5')).toBe(4);
      expect(calculate('5.5 - 1.5')).toBe(4);
    });

    it('returns decimal results', () => {
      expect(calculate('10 / 4')).toBe(2.5);
      expect(calculate('0.1 + 0.2')).toBeCloseTo(0.3);
    });
  });

  describe('with negative numbers', () => {
    it('calculates with negative operands', () => {
      expect(calculate('-5 + 3')).toBe(-2);
      expect(calculate('-5 - 3')).toBe(-8);
      expect(calculate('-5 * -3')).toBe(15);
    });
  });

  describe('edge cases', () => {
    it('calculates with zero', () => {
      expect(calculate('0 + 5')).toBe(5);
      expect(calculate('5 - 0')).toBe(5);
      expect(calculate('0 * 100')).toBe(0);
      expect(calculate('0 / 5')).toBe(0);
    });

    it('calculates with single digit', () => {
      expect(calculate('5 + 5')).toBe(10);
    });

    it('calculates with large numbers', () => {
      expect(calculate('1000000 + 1000000')).toBe(2000000);
    });
  });

  describe('error handling', () => {
    it('throws on division by zero', () => {
      expect(() => calculate('5 / 0')).toThrow('Division by zero');
    });

    it('throws on invalid expressions', () => {
      expect(() => calculate('invalid')).toThrow();
      expect(() => calculate('2 + ')).toThrow();
      expect(() => calculate('2 3')).toThrow();
    });

    it('throws on unsupported operators', () => {
      expect(() => calculate('2 % 3')).toThrow();
      expect(() => calculate('2 ^ 3')).toThrow();
    });
  });

  describe('expression parsing', () => {
    it('handles expressions with various spacing', () => {
      expect(calculate('2+3')).toBe(5);
      expect(calculate('2 + 3')).toBe(5);
      expect(calculate('2   +   3')).toBe(5);
      expect(calculate('  2 + 3  ')).toBe(5);
    });
  });
});
