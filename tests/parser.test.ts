import { describe, it, expect } from 'vitest';
import { parseExpression } from '../src/parser';

describe('Expression Parser', () => {
  describe('valid expressions', () => {
    it('parses simple addition', () => {
      const result = parseExpression('2 + 3');
      expect(result).toEqual({
        left: 2,
        operator: 'add',
        right: 3,
      });
    });

    it('parses simple subtraction', () => {
      const result = parseExpression('5 - 3');
      expect(result).toEqual({
        left: 5,
        operator: 'subtract',
        right: 3,
      });
    });

    it('parses simple multiplication', () => {
      const result = parseExpression('4 * 5');
      expect(result).toEqual({
        left: 4,
        operator: 'multiply',
        right: 5,
      });
    });

    it('parses simple division', () => {
      const result = parseExpression('10 / 2');
      expect(result).toEqual({
        left: 10,
        operator: 'divide',
        right: 2,
      });
    });

    it('parses expressions without spaces', () => {
      const result = parseExpression('2+3');
      expect(result).toEqual({
        left: 2,
        operator: 'add',
        right: 3,
      });
    });

    it('parses expressions with multiple spaces', () => {
      const result = parseExpression('2   +   3');
      expect(result).toEqual({
        left: 2,
        operator: 'add',
        right: 3,
      });
    });

    it('parses decimal numbers', () => {
      const result = parseExpression('1.5 + 2.3');
      expect(result.left).toBeCloseTo(1.5);
      expect(result.operator).toBe('add');
      expect(result.right).toBeCloseTo(2.3);
    });

    it('parses negative numbers', () => {
      const result = parseExpression('-5 + 3');
      expect(result).toEqual({
        left: -5,
        operator: 'add',
        right: 3,
      });
    });

    it('parses both negative numbers', () => {
      const result = parseExpression('-5 - -3');
      expect(result).toEqual({
        left: -5,
        operator: 'subtract',
        right: -3,
      });
    });

    it('parses leading whitespace', () => {
      const result = parseExpression('  10 + 5');
      expect(result).toEqual({
        left: 10,
        operator: 'add',
        right: 5,
      });
    });

    it('parses trailing whitespace', () => {
      const result = parseExpression('10 + 5  ');
      expect(result).toEqual({
        left: 10,
        operator: 'add',
        right: 5,
      });
    });

    it('parses zero operands', () => {
      const result = parseExpression('0 + 0');
      expect(result).toEqual({
        left: 0,
        operator: 'add',
        right: 0,
      });
    });
  });

  describe('invalid expressions', () => {
    it('throws on empty string', () => {
      expect(() => parseExpression('')).toThrow();
    });

    it('throws on missing operator', () => {
      expect(() => parseExpression('2 3')).toThrow();
    });

    it('throws on missing operand', () => {
      expect(() => parseExpression('2 +')).toThrow();
      expect(() => parseExpression('+ 3')).toThrow();
    });

    it('throws on invalid operator', () => {
      expect(() => parseExpression('2 % 3')).toThrow();
      expect(() => parseExpression('2 ^ 3')).toThrow();
    });

    it('throws on non-numeric operands', () => {
      expect(() => parseExpression('abc + 3')).toThrow();
      expect(() => parseExpression('2 + xyz')).toThrow();
    });

    it('throws on multiple operators', () => {
      expect(() => parseExpression('2 + 3 + 4')).toThrow();
    });

    it('throws on invalid characters', () => {
      expect(() => parseExpression('2 + 3!')).toThrow();
      expect(() => parseExpression('2# + 3')).toThrow();
    });
  });
});
