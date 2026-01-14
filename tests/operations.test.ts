import { describe, it, expect } from 'vitest';
import { add, subtract, multiply, divide } from '../src/operations';

describe('Math Operations', () => {
  describe('add', () => {
    it('adds two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('adds two negative numbers', () => {
      expect(add(-2, -3)).toBe(-5);
    });

    it('adds positive and negative numbers', () => {
      expect(add(5, -3)).toBe(2);
    });

    it('adds decimal numbers', () => {
      expect(add(0.1, 0.2)).toBeCloseTo(0.3);
    });

    it('adds zero', () => {
      expect(add(5, 0)).toBe(5);
      expect(add(0, 0)).toBe(0);
    });
  });

  describe('subtract', () => {
    it('subtracts two positive numbers', () => {
      expect(subtract(5, 3)).toBe(2);
    });

    it('subtracts two negative numbers', () => {
      expect(subtract(-5, -3)).toBe(-2);
    });

    it('subtracts negative from positive', () => {
      expect(subtract(5, -3)).toBe(8);
    });

    it('subtracts positive from negative', () => {
      expect(subtract(-5, 3)).toBe(-8);
    });

    it('subtracts decimal numbers', () => {
      expect(subtract(1.5, 0.5)).toBe(1);
    });

    it('subtracts zero', () => {
      expect(subtract(5, 0)).toBe(5);
      expect(subtract(0, 5)).toBe(-5);
    });
  });

  describe('multiply', () => {
    it('multiplies two positive numbers', () => {
      expect(multiply(3, 4)).toBe(12);
    });

    it('multiplies two negative numbers', () => {
      expect(multiply(-3, -4)).toBe(12);
    });

    it('multiplies positive and negative numbers', () => {
      expect(multiply(3, -4)).toBe(-12);
      expect(multiply(-3, 4)).toBe(-12);
    });

    it('multiplies decimal numbers', () => {
      expect(multiply(2.5, 4)).toBe(10);
      expect(multiply(0.5, 0.5)).toBeCloseTo(0.25);
    });

    it('multiplies by zero', () => {
      expect(multiply(5, 0)).toBe(0);
      expect(multiply(0, 0)).toBe(0);
    });

    it('multiplies by one', () => {
      expect(multiply(5, 1)).toBe(5);
    });
  });

  describe('divide', () => {
    it('divides two positive numbers', () => {
      expect(divide(10, 2)).toBe(5);
    });

    it('divides two negative numbers', () => {
      expect(divide(-10, -2)).toBe(5);
    });

    it('divides positive by negative', () => {
      expect(divide(10, -2)).toBe(-5);
    });

    it('divides negative by positive', () => {
      expect(divide(-10, 2)).toBe(-5);
    });

    it('divides decimal numbers', () => {
      expect(divide(10, 2.5)).toBe(4);
      expect(divide(1, 4)).toBe(0.25);
    });

    it('divides by one', () => {
      expect(divide(5, 1)).toBe(5);
    });

    it('divides zero by non-zero', () => {
      expect(divide(0, 5)).toBe(0);
    });

    it('throws error on division by zero', () => {
      expect(() => divide(10, 0)).toThrow('Division by zero');
      expect(() => divide(0, 0)).toThrow('Division by zero');
      expect(() => divide(-5, 0)).toThrow('Division by zero');
    });
  });
});
