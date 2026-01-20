import { describe, it, expect } from 'vitest';
import { formatCurrency, parseCurrency, splitAmountEvenly } from './utils';

describe('formatCurrency', () => {
  it('should format amount in cents to currency string', () => {
    expect(formatCurrency(1050)).toBe('$10.50');
    expect(formatCurrency(100)).toBe('$1.00');
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should handle different currencies', () => {
    expect(formatCurrency(1050, 'EUR')).toBe('€1,050.00');
  });

  it('should handle negative amounts', () => {
    expect(formatCurrency(-1050)).toBe('-$10.50');
  });
});

describe('parseCurrency', () => {
  it('should parse currency string to amount in cents', () => {
    expect(parseCurrency('10.50')).toBe(1050);
    expect(parseCurrency('1.00')).toBe(100);
    expect(parseCurrency('0')).toBe(0);
  });

  it('should throw error for invalid values', () => {
    expect(() => parseCurrency('invalid')).toThrow('Invalid currency value');
    expect(() => parseCurrency('')).toThrow('Invalid currency value');
  });
});

describe('splitAmountEvenly', () => {
  it('should split amount evenly', () => {
    expect(splitAmountEvenly(10000, 3)).toEqual([3334, 3333, 3333]);
    expect(splitAmountEvenly(100, 4)).toEqual([25, 25, 25, 25]);
  });

  it('should handle exact division', () => {
    expect(splitAmountEvenly(10000, 2)).toEqual([5000, 5000]);
    expect(splitAmountEvenly(100, 1)).toEqual([100]);
  });

  it('should throw error for invalid inputs', () => {
    expect(() => splitAmountEvenly(100, 0)).toThrow('Number of people must be greater than 0');
    expect(() => splitAmountEvenly(100, -1)).toThrow('Number of people must be greater than 0');
  });

  it('should ensure sum equals total amount', () => {
    const amounts = splitAmountEvenly(10000, 3);
    const sum = amounts.reduce((acc, val) => acc + val, 0);
    expect(sum).toBe(10000);
  });
});
