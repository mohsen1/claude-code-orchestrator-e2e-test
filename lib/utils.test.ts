import { describe, it, expect } from 'vitest';
import { formatCurrency, toCents, distributeEvenly } from './utils';

describe('formatCurrency', () => {
  it('should format basic amounts correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(100)).toBe('$1.00');
    expect(formatCurrency(1000)).toBe('$10.00');
    expect(formatCurrency(123456)).toBe('$1,234.56');
  });

  it('should handle zero values', () => {
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(0, 'EUR')).toBe('€0.00');
  });

  it('should handle negative values', () => {
    expect(formatCurrency(-100)).toBe('-$1.00');
    expect(formatCurrency(-123456)).toBe('-$1,234.56');
  });

  it('should handle decimal precision correctly', () => {
    expect(formatCurrency(1)).toBe('$0.01');
    expect(formatCurrency(99)).toBe('$0.99');
    expect(formatCurrency(101)).toBe('$1.01');
    expect(formatCurrency(999)).toBe('$9.99');
  });

  it('should support different currency codes', () => {
    expect(formatCurrency(1000, 'EUR')).toBe('€10.00');
    expect(formatCurrency(1000, 'GBP')).toBe('£10.00');
    expect(formatCurrency(1000, 'JPY')).toBe('¥10');
  });

  it('should handle large amounts', () => {
    expect(formatCurrency(100000000)).toBe('$1,000,000.00');
    expect(formatCurrency(999999999)).toBe('$9,999,999.99');
  });
});

describe('toCents', () => {
  it('should convert basic amounts correctly', () => {
    expect(toCents(0)).toBe(0);
    expect(toCents(1)).toBe(100);
    expect(toCents(10)).toBe(1000);
    expect(toCents(1234.56)).toBe(123456);
  });

  it('should handle zero values', () => {
    expect(toCents(0)).toBe(0);
    expect(toCents(0.0)).toBe(0);
  });

  it('should handle negative values', () => {
    expect(toCents(-1)).toBe(-100);
    expect(toCents(-10.50)).toBe(-1050);
  });

  it('should handle decimal precision correctly', () => {
    expect(toCents(0.01)).toBe(1);
    expect(toCents(0.99)).toBe(99);
    expect(toCents(0.001)).toBe(0); // Rounding down
    expect(toCents(0.009)).toBe(1); // Rounding up
    expect(toCents(1.005)).toBe(101); // Round half up
  });

  it('should handle edge cases with rounding', () => {
    expect(toCents(0.0049)).toBe(0);
    expect(toCents(0.005)).toBe(1);
    expect(toCents(0.0051)).toBe(1);
    expect(toCents(10.005)).toBe(1001);
  });

  it('should handle fractional cents correctly', () => {
    expect(toCents(1.234)).toBe(123);
    expect(toCents(1.235)).toBe(124);
    expect(toCents(1.236)).toBe(124);
    expect(toCents(99.999)).toBe(10000);
  });
});

describe('distributeEvenly', () => {
  it('should distribute evenly with no remainder', () => {
    expect(distributeEvenly(100, 4)).toEqual([25, 25, 25, 25]);
    expect(distributeEvenly(1000, 10)).toEqual([100, 100, 100, 100, 100, 100, 100, 100, 100, 100]);
    expect(distributeEvenly(99, 3)).toEqual([33, 33, 33]);
  });

  it('should distribute with remainder correctly', () => {
    expect(distributeEvenly(100, 3)).toEqual([34, 33, 33]);
    expect(distributeEvenly(10, 3)).toEqual([4, 3, 3]);
    expect(distributeEvenly(101, 3)).toEqual([34, 34, 33]);
    expect(distributeEvenly(102, 3)).toEqual([34, 34, 34]);
  });

  it('should distribute remainder to the first N people', () => {
    const result = distributeEvenly(100, 7);
    expect(result).toEqual([15, 15, 15, 14, 14, 14, 14]);
    expect(result.reduce((sum, val) => sum + val, 0)).toBe(100);
  });

  it('should handle zero amounts', () => {
    expect(distributeEvenly(0, 5)).toEqual([0, 0, 0, 0, 0]);
    expect(distributeEvenly(0, 1)).toEqual([0]);
  });

  it('should handle single person', () => {
    expect(distributeEvenly(100, 1)).toEqual([100]);
    expect(distributeEvenly(0, 1)).toEqual([0]);
    expect(distributeEvenly(9999, 1)).toEqual([9999]);
  });

  it('should handle large numbers of people', () => {
    const result = distributeEvenly(100, 100);
    expect(result.length).toBe(100);
    expect(result.filter((v) => v === 1).length).toBe(100);
    expect(result.reduce((sum, val) => sum + val, 0)).toBe(100);
  });

  it('should always sum to the original total', () => {
    const testCases = [
      { total: 1, people: 3 },
      { total: 99, people: 7 },
      { total: 100, people: 3 },
      { total: 123456, people: 97 },
      { total: 9999, people: 100 },
    ];

    testCases.forEach(({ total, people }) => {
      const result = distributeEvenly(total, people);
      const sum = result.reduce((acc, val) => acc + val, 0);
      expect(sum).toBe(total);
    });
  });

  it('should throw error for zero or negative number of people', () => {
    expect(() => distributeEvenly(100, 0)).toThrow('Number of people must be greater than 0');
    expect(() => distributeEvenly(100, -1)).toThrow('Number of people must be greater than 0');
    expect(() => distributeEvenly(100, -10)).toThrow('Number of people must be greater than 0');
  });

  it('should handle negative amounts', () => {
    expect(distributeEvenly(-100, 4)).toEqual([-25, -25, -25, -25]);
    expect(distributeEvenly(-101, 3)).toEqual([-34, -34, -33]);
    const result = distributeEvenly(-99, 7);
    expect(result.reduce((sum, val) => sum + val, 0)).toBe(-99);
  });

  it('should distribute remainder correctly for edge cases', () => {
    // Remainder of 1
    expect(distributeEvenly(101, 10)).toEqual([11, 10, 10, 10, 10, 10, 10, 10, 10, 10]);

    // Remainder of (numPeople - 1)
    expect(distributeEvenly(199, 10)).toEqual([20, 20, 20, 20, 20, 20, 20, 20, 20, 19]);

    // Small total with many people
    expect(distributeEvenly(5, 10)).toEqual([1, 1, 1, 1, 1, 0, 0, 0, 0, 0]);

    // Total less than people count
    expect(distributeEvenly(3, 10)).toEqual([1, 1, 1, 0, 0, 0, 0, 0, 0, 0]);
  });
});
