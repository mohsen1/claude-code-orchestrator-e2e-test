import { describe, it, expect } from 'vitest';
import { formatCurrency, parseCurrencyToCents, generateId } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format cents to USD currency', () => {
      expect(formatCurrency(100)).toBe('$1.00');
      expect(formatCurrency(1000)).toBe('$10.00');
      expect(formatCurrency(123456)).toBe('$1,234.56');
    });

    it('should handle zero values', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle negative values', () => {
      expect(formatCurrency(-100)).toBe('-$1.00');
    });
  });

  describe('parseCurrencyToCents', () => {
    it('should parse currency string to cents', () => {
      expect(parseCurrencyToCents('$1.00')).toBe(100);
      expect(parseCurrencyToCents('10.00')).toBe(1000);
      expect(parseCurrencyToCents('1,234.56')).toBe(123456);
    });

    it('should handle decimal values', () => {
      expect(parseCurrencyToCents('0.50')).toBe(50);
      expect(parseCurrencyToCents('0.01')).toBe(1);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should generate string IDs', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
    });
  });
});
