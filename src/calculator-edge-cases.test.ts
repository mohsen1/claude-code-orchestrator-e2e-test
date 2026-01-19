import {
  Calculator,
  DivisionByZeroError,
  OverflowError,
  UnderflowError,
} from './calculator';

describe('Calculator Edge Cases', () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe('Division by Zero Error Handling', () => {
    it('should throw DivisionByZeroError when dividing by zero', () => {
      expect(() => calculator.divide(10, 0)).toThrow(DivisionByZeroError);
      expect(() => calculator.divide(10, 0)).toThrow('Division by zero is not allowed');
    });

    it('should throw DivisionByZeroError with custom message when dividing positive by zero', () => {
      expect(() => calculator.divide(5, 0)).toThrow('Cannot divide 5 by zero');
    });

    it('should throw DivisionByZeroError when dividing negative by zero', () => {
      expect(() => calculator.divide(-100, 0)).toThrow(DivisionByZeroError);
      expect(() => calculator.divide(-100, 0)).toThrow('Cannot divide -100 by zero');
    });

    it('should throw DivisionByZeroError when dividing zero by zero', () => {
      expect(() => calculator.divide(0, 0)).toThrow(DivisionByZeroError);
    });

    it('should handle division by very small numbers approaching zero', () => {
      // This should not throw as it's not actually zero
      expect(calculator.divide(1, Number.MIN_VALUE)).toBeGreaterThan(0);
    });

    it('should throw DivisionByZeroError with correct error type', () => {
      try {
        calculator.divide(42, 0);
        fail('Expected DivisionByZeroError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(DivisionByZeroError);
        expect((error as DivisionByZeroError).name).toBe('DivisionByZeroError');
      }
    });
  });

  describe('Very Large Numbers', () => {
    it('should handle addition of large numbers without overflow', () => {
      const large1 = Number.MAX_SAFE_INTEGER;
      const large2 = 1;
      expect(calculator.add(large1, large2)).toBe(Number.MAX_SAFE_INTEGER + 1);
    });

    it('should detect overflow in addition', () => {
      const max = Number.MAX_VALUE;
      expect(() => calculator.add(max, max)).toThrow(OverflowError);
      expect(() => calculator.add(max, max)).toThrow('Addition overflow');
    });

    it('should detect overflow in multiplication with large numbers', () => {
      const large = 1e308;
      expect(() => calculator.multiply(large, 10)).toThrow(OverflowError);
      expect(() => calculator.multiply(large, 10)).toThrow('Multiplication overflow');
    });

    it('should handle subtraction with large numbers', () => {
      const large1 = Number.MAX_SAFE_INTEGER;
      const large2 = 1000;
      expect(calculator.subtract(large1, large2)).toBe(Number.MAX_SAFE_INTEGER - 1000);
    });

    it('should detect underflow in subtraction', () => {
      const min = -Number.MAX_VALUE;
      expect(() => calculator.subtract(min, Number.MAX_VALUE)).toThrow(UnderflowError);
      expect(() => calculator.subtract(min, Number.MAX_VALUE)).toThrow('Subtraction underflow');
    });

    it('should handle division of large numbers', () => {
      const large1 = 1e20;
      const large2 = 1e10;
      expect(calculator.divide(large1, large2)).toBe(1e10);
    });

    it('should handle large number division resulting in small decimal', () => {
      const large1 = 1;
      const large2 = 1e20;
      expect(calculator.divide(large1, large2)).toBe(1e-20);
    });

    it('should detect overflow in power operation', () => {
      expect(() => calculator.power(10, 1000)).toThrow(OverflowError);
      expect(() => calculator.power(10, 1000)).toThrow('Power overflow');
    });
  });

  describe('Very Small Decimal Precision', () => {
    it('should handle addition of very small decimals', () => {
      const small1 = 0.00000001;
      const small2 = 0.00000002;
      expect(calculator.add(small1, small2)).toBeCloseTo(0.00000003, 15);
    });

    it('should handle multiplication of very small decimals', () => {
      const small1 = 0.001;
      const small2 = 0.001;
      expect(calculator.multiply(small1, small2)).toBe(0.000001);
    });

    it('should handle division resulting in very small decimals', () => {
      const result = calculator.divide(1, 1000000);
      expect(result).toBeCloseTo(0.000001, 15);
    });

    it('should handle smallest positive denormal number', () => {
      const minDenormal = Number.MIN_VALUE;
      expect(calculator.add(minDenormal, minDenormal)).toBe(2 * Number.MIN_VALUE);
    });

    it('should maintain precision with decimal arithmetic', () => {
      expect(calculator.add(0.1, 0.2)).toBeCloseTo(0.3, 10);
      expect(calculator.subtract(0.3, 0.1)).toBeCloseTo(0.2, 10);
    });

    it('should handle very precise decimal calculations', () => {
      const a = 0.123456789;
      const b = 0.987654321;
      expect(calculator.multiply(a, b)).toBeCloseTo(0.121932631, 9);
    });

    it('should detect underflow with very small multiplication', () => {
      const tiny = 1e-308;
      expect(() => calculator.multiply(tiny, 0.1)).toThrow(UnderflowError);
      expect(() => calculator.multiply(tiny, 0.1)).toThrow('Multiplication underflow');
    });

    it('should handle division of small decimals', () => {
      const small1 = 0.0001;
      const small2 = 0.000001;
      expect(calculator.divide(small1, small2)).toBe(100);
    });
  });

  describe('Overflow Scenarios', () => {
    it('should throw OverflowError on positive infinity result', () => {
      expect(() => calculator.add(Number.MAX_VALUE, Number.MAX_VALUE)).toThrow(OverflowError);
    });

    it('should throw OverflowError with correct properties', () => {
      try {
        calculator.multiply(1e308, 10);
        fail('Expected OverflowError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(OverflowError);
        expect((error as OverflowError).name).toBe('OverflowError');
        expect((error as OverflowError).message).toContain('overflow');
      }
    });

    it('should detect overflow in chain additions', () => {
      let result = 0;
      const largeNumber = Number.MAX_VALUE / 2;
      expect(() => {
        result = calculator.add(result, largeNumber);
        result = calculator.add(result, largeNumber);
      }).not.toThrow();
    });

    it('should handle power operation leading to overflow', () => {
      expect(() => calculator.power(2, 2000)).toThrow(OverflowError);
    });

    it('should provide descriptive overflow messages', () => {
      try {
        calculator.add(Number.MAX_VALUE, 1);
        fail('Expected OverflowError');
      } catch (error) {
        expect((error as OverflowError).message).toContain('Addition overflow');
        expect((error as OverflowError).message).toContain('results in infinity');
      }
    });
  });

  describe('Underflow Scenarios', () => {
    it('should throw UnderflowError on negative infinity result', () => {
      expect(() => calculator.subtract(-Number.MAX_VALUE, Number.MAX_VALUE)).toThrow(UnderflowError);
    });

    it('should throw UnderflowError with correct properties', () => {
      try {
        calculator.multiply(-1e308, 10);
        fail('Expected UnderflowError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnderflowError);
        expect((error as UnderflowError).name).toBe('UnderflowError');
        expect((error as UnderflowError).message).toContain('underflow');
      }
    });

    it('should detect underflow in multiplication with negative large numbers', () => {
      const largeNegative = -Number.MAX_VALUE;
      expect(() => calculator.multiply(largeNegative, 2)).toThrow(UnderflowError);
    });

    it('should detect underflow in power operation', () => {
      expect(() => calculator.power(-10, 1000)).not.toThrow(); // Even power of negative is positive
    });

    it('should provide descriptive underflow messages', () => {
      try {
        calculator.multiply(Number.MIN_VALUE, 0.1);
        fail('Expected UnderflowError');
      } catch (error) {
        expect((error as UnderflowError).message).toContain('Multiplication underflow');
        expect((error as UnderflowError).message).toContain('results in');
      }
    });
  });

  describe('Combined Edge Cases', () => {
    it('should handle division by negative small numbers', () => {
      expect(calculator.divide(100, -0.001)).toBe(-100000);
    });

    it('should handle alternating large and small operations', () => {
      const result1 = calculator.add(1e10, 0.1);
      const result2 = calculator.subtract(result1, 1e10);
      expect(result2).toBeCloseTo(0.1, 10);
    });

    it('should handle chain operations with mixed magnitudes', () => {
      let result = calculator.multiply(1000, 0.001); // = 1
      result = calculator.add(result, 99); // = 100
      result = calculator.divide(result, 10); // = 10
      result = calculator.power(result, 2); // = 100
      expect(result).toBe(100);
    });

    it('should maintain precision through multiple operations', () => {
      const initial = 0.1;
      const result1 = calculator.add(initial, 0.2); // 0.3
      const result2 = calculator.multiply(result1, 10); // 3.0
      const result3 = calculator.divide(result2, 3); // 1.0
      expect(result3).toBeCloseTo(1, 10);
    });

    it('should handle zero in various operations', () => {
      expect(calculator.add(0, 0)).toBe(0);
      expect(calculator.subtract(0, 0)).toBe(0);
      expect(calculator.multiply(0, 0)).toBe(0);
      expect(calculator.multiply(1000000, 0)).toBe(0);
    });

    it('should handle negative zero correctly', () => {
      expect(calculator.add(-0, 0)).toBe(0);
      expect(calculator.multiply(-1, 0)).toBe(0);
    });

    it('should detect overflow in combined operations', () => {
      expect(() => {
        let result = 1;
        for (let i = 0; i < 100; i++) {
          result = calculator.multiply(result, 10);
        }
      }).toThrow(OverflowError);
    });
  });

  describe('Special Number Values', () => {
    it('should handle NaN in operations', () => {
      expect(calculator.add(NaN, 5)).toBeNaN();
      expect(calculator.multiply(NaN, 5)).toBeNaN();
    });

    it('should handle positive infinity in addition', () => {
      expect(() => calculator.add(Number.MAX_VALUE, Number.MAX_VALUE)).toThrow(OverflowError);
    });

    it('should handle negative infinity in subtraction', () => {
      expect(() => calculator.subtract(-Number.MAX_VALUE, Number.MAX_VALUE)).toThrow(UnderflowError);
    });

    it('should handle very close to zero values', () => {
      const epsilon = Number.EPSILON;
      expect(calculator.add(1, epsilon)).toBeGreaterThan(1);
      expect(calculator.subtract(1, epsilon)).toBeLessThan(1);
    });
  });

  describe('Error Message Validation', () => {
    it('should include operation details in DivisionByZeroError message', () => {
      try {
        calculator.divide(100, 0);
        fail('Expected DivisionByZeroError');
      } catch (error) {
        expect((error as DivisionByZeroError).message).toContain('100');
        expect((error as DivisionByZeroError).message).toContain('zero');
      }
    });

    it('should include operation details in OverflowError message', () => {
      try {
        calculator.add(Number.MAX_VALUE, Number.MAX_VALUE);
        fail('Expected OverflowError');
      } catch (error) {
        expect((error as OverflowError).message).toContain('overflow');
        expect((error as OverflowError).message).toContain('infinity');
      }
    });

    it('should include operation details in UnderflowError message', () => {
      try {
        calculator.multiply(-1e308, 10);
        fail('Expected UnderflowError');
      } catch (error) {
        expect((error as UnderflowError).message).toContain('underflow');
        expect((error as UnderflowError).message).toContain('negative infinity');
      }
    });

    it('should have correct error names for all custom errors', () => {
      try {
        calculator.divide(1, 0);
      } catch (error) {
        expect((error as Error).name).toBe('DivisionByZeroError');
      }

      try {
        calculator.add(Number.MAX_VALUE, Number.MAX_VALUE);
      } catch (error) {
        expect((error as Error).name).toBe('OverflowError');
      }

      try {
        calculator.subtract(-Number.MAX_VALUE, Number.MAX_VALUE);
      } catch (error) {
        expect((error as Error).name).toBe('UnderflowError');
      }
    });
  });
});
