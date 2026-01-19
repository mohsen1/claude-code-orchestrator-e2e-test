import { Calculator } from './calculator';

describe('Calculator', () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe('add', () => {
    describe('basic operations', () => {
      it('should add two positive numbers correctly', () => {
        expect(calculator.add(2, 3)).toBe(5);
        expect(calculator.add(10, 20)).toBe(30);
      });

      it('should add zero correctly', () => {
        expect(calculator.add(5, 0)).toBe(5);
        expect(calculator.add(0, 5)).toBe(5);
        expect(calculator.add(0, 0)).toBe(0);
      });

      it('should add negative numbers correctly', () => {
        expect(calculator.add(-5, -3)).toBe(-8);
        expect(calculator.add(-5, 3)).toBe(-2);
        expect(calculator.add(5, -3)).toBe(2);
      });
    });

    describe('decimal numbers', () => {
      it('should add decimal numbers correctly', () => {
        expect(calculator.add(1.5, 2.5)).toBe(4);
        expect(calculator.add(0.1, 0.2)).toBeCloseTo(0.3, 10);
      });

      it('should add mixed integer and decimal numbers', () => {
        expect(calculator.add(5, 2.5)).toBe(7.5);
        expect(calculator.add(-3, 1.5)).toBe(-1.5);
      });
    });

    describe('edge cases', () => {
      it('should handle very large numbers', () => {
        expect(calculator.add(1e10, 1e10)).toBe(2e10);
      });

      it('should handle very small decimal numbers', () => {
        expect(calculator.add(0.0001, 0.0002)).toBeCloseTo(0.0003, 10);
      });
    });
  });

  describe('subtract', () => {
    describe('basic operations', () => {
      it('should subtract two positive numbers correctly', () => {
        expect(calculator.subtract(5, 3)).toBe(2);
        expect(calculator.subtract(10, 20)).toBe(-10);
      });

      it('should subtract zero correctly', () => {
        expect(calculator.subtract(5, 0)).toBe(5);
        expect(calculator.subtract(0, 5)).toBe(-5);
        expect(calculator.subtract(0, 0)).toBe(0);
      });

      it('should subtract negative numbers correctly', () => {
        expect(calculator.subtract(-5, -3)).toBe(-2);
        expect(calculator.subtract(-5, 3)).toBe(-8);
        expect(calculator.subtract(5, -3)).toBe(8);
      });
    });

    describe('decimal numbers', () => {
      it('should subtract decimal numbers correctly', () => {
        expect(calculator.subtract(5.5, 2.5)).toBe(3);
        expect(calculator.subtract(1.5, 0.5)).toBe(1);
      });

      it('should subtract mixed integer and decimal numbers', () => {
        expect(calculator.subtract(10, 2.5)).toBe(7.5);
        expect(calculator.subtract(2.5, 1)).toBe(1.5);
      });
    });

    describe('edge cases', () => {
      it('should subtracting a number from itself should return zero', () => {
        expect(calculator.subtract(7, 7)).toBe(0);
        expect(calculator.subtract(-3, -3)).toBe(0);
        expect(calculator.subtract(2.5, 2.5)).toBe(0);
      });
    });
  });

  describe('multiply', () => {
    describe('basic operations', () => {
      it('should multiply two positive numbers correctly', () => {
        expect(calculator.multiply(2, 3)).toBe(6);
        expect(calculator.multiply(5, 10)).toBe(50);
      });

      it('should multiply by zero correctly', () => {
        expect(calculator.multiply(5, 0)).toBe(0);
        expect(calculator.multiply(0, 5)).toBe(0);
        expect(calculator.multiply(0, 0)).toBe(0);
      });

      it('should multiply by one correctly', () => {
        expect(calculator.multiply(5, 1)).toBe(5);
        expect(calculator.multiply(1, 5)).toBe(5);
        expect(calculator.multiply(-3, 1)).toBe(-3);
      });

      it('should multiply negative numbers correctly', () => {
        expect(calculator.multiply(-5, -3)).toBe(15);
        expect(calculator.multiply(-5, 3)).toBe(-15);
        expect(calculator.multiply(5, -3)).toBe(-15);
      });
    });

    describe('decimal numbers', () => {
      it('should multiply decimal numbers correctly', () => {
        expect(calculator.multiply(2.5, 4)).toBe(10);
        expect(calculator.multiply(1.5, 2)).toBe(3);
        expect(calculator.multiply(0.5, 0.5)).toBe(0.25);
      });
    });

    describe('edge cases', () => {
      it('should handle very large numbers', () => {
        expect(calculator.multiply(1e5, 1e5)).toBe(1e10);
      });

      it('should handle very small decimal numbers', () => {
        expect(calculator.multiply(0.01, 0.01)).toBeCloseTo(0.0001, 10);
      });
    });
  });

  describe('divide', () => {
    describe('basic operations', () => {
      it('should divide two positive numbers correctly', () => {
        expect(calculator.divide(6, 2)).toBe(3);
        expect(calculator.divide(10, 5)).toBe(2);
      });

      it('should divide negative numbers correctly', () => {
        expect(calculator.divide(-6, 2)).toBe(-3);
        expect(calculator.divide(6, -2)).toBe(-3);
        expect(calculator.divide(-6, -2)).toBe(3);
      });

      it('should divide zero by a number correctly', () => {
        expect(calculator.divide(0, 5)).toBe(0);
        expect(calculator.divide(0, -3)).toBe(0);
      });
    });

    describe('decimal numbers', () => {
      it('should divide decimal numbers correctly', () => {
        expect(calculator.divide(5.5, 2)).toBe(2.75);
        expect(calculator.divide(1.5, 0.5)).toBe(3);
      });

      it('should divide and return decimal results', () => {
        expect(calculator.divide(1, 2)).toBe(0.5);
        expect(calculator.divide(5, 2)).toBe(2.5);
        expect(calculator.divide(10, 3)).toBeCloseTo(3.3333333333333335, 10);
      });
    });

    describe('divide by zero error handling', () => {
      it('should throw an error when dividing by zero', () => {
        expect(() => calculator.divide(5, 0)).toThrow('Cannot divide by zero');
      });

      it('should throw an error when dividing negative number by zero', () => {
        expect(() => calculator.divide(-5, 0)).toThrow('Cannot divide by zero');
      });

      it('should throw an error when dividing zero by zero', () => {
        expect(() => calculator.divide(0, 0)).toThrow('Cannot divide by zero');
      });

      it('should throw an error object with the correct message', () => {
        try {
          calculator.divide(10, 0);
          fail('Expected an error to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe('Cannot divide by zero');
        }
      });
    });

    describe('edge cases', () => {
      it('should dividing a number by itself should return one', () => {
        expect(calculator.divide(7, 7)).toBe(1);
        expect(calculator.divide(-3, -3)).toBe(1);
        expect(calculator.divide(2.5, 2.5)).toBe(1);
      });

      it('should handle dividing by very small decimals', () => {
        expect(calculator.divide(1, 0.1)).toBe(10);
        expect(calculator.divide(5, 0.01)).toBe(500);
      });

      it('should handle dividing very large numbers', () => {
        expect(calculator.divide(1e10, 1e5)).toBe(1e5);
      });
    });
  });

  describe('combined operations', () => {
    it('should handle multiple operations in sequence', () => {
      const result1 = calculator.add(5, 3);
      const result2 = calculator.multiply(result1, 2);
      const result3 = calculator.subtract(result2, 4);
      const result4 = calculator.divide(result3, 2);

      expect(result4).toBe(8);
    });

    it('should work with decimal calculations through multiple operations', () => {
      const result1 = calculator.divide(10, 4);
      const result2 = calculator.multiply(result1, 2);
      const result3 = calculator.add(result2, 1);

      expect(result3).toBe(6);
    });
  });
});
