import {
  Calculator,
  DivisionByZeroError,
  add,
  subtract,
  multiply,
  divide,
  CalculatorResult
} from './calculator';
import {
  testFixtures,
  edgeCases,
  operationTestCases,
  CalculatorTestHelper,
  CalculatorAssertions,
  PerformanceBenchmark
} from './test-utils';

describe('Calculator Integration Tests', () => {
  let calculator: Calculator;
  let testHelper: CalculatorTestHelper;

  beforeEach(() => {
    calculator = new Calculator();
    testHelper = new CalculatorTestHelper();
  });

  describe('Basic Operations', () => {
    describe('Addition', () => {
      it('should perform addition with positive numbers', () => {
        const { a, b, expected } = testFixtures.positiveNumbers;
        expect(calculator.add(a, b)).toBe(expected.sum);
      });

      it('should perform addition with negative numbers', () => {
        const { a, b, expected } = testFixtures.negativeNumbers;
        expect(calculator.add(a, b)).toBe(expected.sum);
      });

      it('should perform addition with mixed signs', () => {
        const { a, b, expected } = testFixtures.mixedNumbers;
        expect(calculator.add(a, b)).toBe(expected.sum);
      });

      it('should perform addition with decimal numbers', () => {
        const { a, b, expected } = testFixtures.decimalNumbers;
        expect(calculator.add(a, b)).toBeCloseTo(expected.sum, 1);
      });

      it('should perform addition with zeros', () => {
        const { a, b, expected } = testFixtures.zeros;
        expect(calculator.add(a, b)).toBe(expected.sum);
      });

      it('should handle large numbers', () => {
        const { a, b, expected } = testFixtures.largeNumbers;
        expect(calculator.add(a, b)).toBe(expected.sum);
      });
    });

    describe('Subtraction', () => {
      it('should perform subtraction with positive numbers', () => {
        const { a, b, expected } = testFixtures.positiveNumbers;
        expect(calculator.subtract(a, b)).toBe(expected.difference);
      });

      it('should perform subtraction with negative numbers', () => {
        const { a, b, expected } = testFixtures.negativeNumbers;
        expect(calculator.subtract(a, b)).toBe(expected.difference);
      });

      it('should perform subtraction with mixed signs', () => {
        const { a, b, expected } = testFixtures.mixedNumbers;
        expect(calculator.subtract(a, b)).toBe(expected.difference);
      });

      it('should perform subtraction with decimal numbers', () => {
        const { a, b, expected } = testFixtures.decimalNumbers;
        expect(calculator.subtract(a, b)).toBeCloseTo(expected.difference, 1);
      });

      it('should perform subtraction with zeros', () => {
        const { a, b, expected } = testFixtures.zeros;
        expect(calculator.subtract(a, b)).toBe(expected.difference);
      });
    });

    describe('Multiplication', () => {
      it('should perform multiplication with positive numbers', () => {
        const { a, b, expected } = testFixtures.positiveNumbers;
        expect(calculator.multiply(a, b)).toBe(expected.product);
      });

      it('should perform multiplication with negative numbers', () => {
        const { a, b, expected } = testFixtures.negativeNumbers;
        expect(calculator.multiply(a, b)).toBe(expected.product);
      });

      it('should perform multiplication with mixed signs', () => {
        const { a, b, expected } = testFixtures.mixedNumbers;
        expect(calculator.multiply(a, b)).toBe(expected.product);
      });

      it('should perform multiplication with decimal numbers', () => {
        const { a, b, expected } = testFixtures.decimalNumbers;
        expect(calculator.multiply(a, b)).toBeCloseTo(expected.product, 2);
      });

      it('should perform multiplication with zeros', () => {
        const { a, b, expected } = testFixtures.zeros;
        expect(calculator.multiply(a, b)).toBe(expected.product);
      });

      it('should handle large numbers', () => {
        const { a, b, expected } = testFixtures.largeNumbers;
        expect(calculator.multiply(a, b)).toBe(expected.product);
      });
    });

    describe('Division', () => {
      it('should perform division with positive numbers', () => {
        const { a, b, expected } = testFixtures.positiveNumbers;
        expect(calculator.divide(a, b)).toBe(expected.quotient);
      });

      it('should perform division with negative numbers', () => {
        const { a, b, expected } = testFixtures.negativeNumbers;
        expect(calculator.divide(a, b)).toBe(expected.quotient);
      });

      it('should perform division with mixed signs', () => {
        const { a, b, expected } = testFixtures.mixedNumbers;
        expect(calculator.divide(a, b)).toBe(expected.quotient);
      });

      it('should perform division with decimal numbers', () => {
        const { a, b, expected } = testFixtures.decimalNumbers;
        expect(calculator.divide(a, b)).toBeCloseTo(expected.quotient, 1);
      });

      it('should throw DivisionByZeroError when dividing by zero', () => {
        expect(() => calculator.divide(10, 0)).toThrow(DivisionByZeroError);
        expect(() => calculator.divide(10, 0)).toThrow('Cannot divide 10 by zero');
      });

      it('should provide custom error message in DivisionByZeroError', () => {
        try {
          calculator.divide(42, 0);
          fail('Expected DivisionByZeroError to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(DivisionByZeroError);
          expect((error as DivisionByZeroError).message).toContain('Cannot divide 42 by zero');
        }
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small numbers', () => {
      const result = calculator.add(edgeCases.verySmallNumber, edgeCases.verySmallNumber);
      expect(result).toBeCloseTo(0.0000002, 7);
    });

    it('should handle very large numbers', () => {
      const result = calculator.add(edgeCases.veryLargeNumber, 1);
      expect(result).toBe(1000000000000);
    });

    it('should handle Infinity in addition', () => {
      expect(calculator.add(Infinity, 1)).toBe(Infinity);
      expect(calculator.add(-Infinity, 1)).toBe(-Infinity);
      expect(calculator.add(Infinity, -Infinity)).toBeNaN();
    });

    it('should handle negative zero', () => {
      expect(calculator.add(-0, 0)).toBe(0);
      expect(calculator.multiply(-0, 5)).toBe(-0);
    });
  });

  describe('Calculate Method', () => {
    it('should return a valid CalculatorResult for add operation', () => {
      const result = calculator.calculate('add', 10, 5);

      expect(result.value).toBe(15);
      expect(result.operation).toBe('add');
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(CalculatorTestHelper.validateResult(result)).toBe(true);
    });

    it('should return a valid CalculatorResult for subtract operation', () => {
      const result = calculator.calculate('subtract', 10, 5);

      expect(result.value).toBe(5);
      expect(result.operation).toBe('subtract');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should return a valid CalculatorResult for multiply operation', () => {
      const result = calculator.calculate('multiply', 10, 5);

      expect(result.value).toBe(50);
      expect(result.operation).toBe('multiply');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should return a valid CalculatorResult for divide operation', () => {
      const result = calculator.calculate('divide', 10, 5);

      expect(result.value).toBe(2);
      expect(result.operation).toBe('divide');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should throw error for invalid operation', () => {
      expect(() =>
        calculator.calculate('invalid' as any, 10, 5)
      ).toThrow('Unknown operation: invalid');
    });

    it('should throw DivisionByZeroError through calculate method', () => {
      expect(() => calculator.calculate('divide', 10, 0)).toThrow(DivisionByZeroError);
    });
  });

  describe('Batch Calculations', () => {
    it('should process multiple operations in batch', () => {
      const operations = [
        { operation: 'add' as const, a: 10, b: 5 },
        { operation: 'subtract' as const, a: 10, b: 5 },
        { operation: 'multiply' as const, a: 10, b: 5 },
        { operation: 'divide' as const, a: 10, b: 5 }
      ];

      const results = calculator.calculateBatch(operations);

      expect(results).toHaveLength(4);
      expect(results[0].value).toBe(15);
      expect(results[1].value).toBe(5);
      expect(results[2].value).toBe(50);
      expect(results[3].value).toBe(2);

      results.forEach(result => {
        expect(CalculatorTestHelper.validateResult(result)).toBe(true);
      });
    });

    it('should handle large batch operations', () => {
      const batch = CalculatorTestHelper.generateRandomBatch(100);
      const results = calculator.calculateBatch(batch);

      expect(results).toHaveLength(100);
      results.forEach((result, index) => {
        expect(result.operation).toBe(batch[index].operation);
        expect(result.timestamp).toBeInstanceOf(Date);
      });
    });

    it('should throw error on first divide by zero in batch', () => {
      const operations = [
        { operation: 'add' as const, a: 10, b: 5 },
        { operation: 'divide' as const, a: 10, b: 0 },
        { operation: 'multiply' as const, a: 10, b: 5 }
      ];

      expect(() => calculator.calculateBatch(operations)).toThrow(DivisionByZeroError);
    });
  });

  describe('Convenience Functions', () => {
    it('should provide add convenience function', () => {
      expect(add(10, 5)).toBe(15);
    });

    it('should provide subtract convenience function', () => {
      expect(subtract(10, 5)).toBe(5);
    });

    it('should provide multiply convenience function', () => {
      expect(multiply(10, 5)).toBe(50);
    });

    it('should provide divide convenience function', () => {
      expect(divide(10, 5)).toBe(2);
    });

    it('should throw DivisionByZeroError in convenience divide function', () => {
      expect(() => divide(10, 0)).toThrow(DivisionByZeroError);
    });
  });

  describe('Test Helper Integration', () => {
    it('should use test helper to verify operations', () => {
      const testCases = operationTestCases.add;

      testCases.forEach(testCase => {
        const { result, passed, error } = testHelper.testOperation(
          'add',
          testCase.a,
          testCase.b,
          testCase.expected
        );

        expect(error).toBeUndefined();
        expect(passed).toBe(true);
        expect(result).toBe(testCase.expected);
      });
    });

    it('should use test helper without expected value', () => {
      const { result, passed, error } = testHelper.testOperation('add', 10, 5);

      expect(error).toBeUndefined();
      expect(passed).toBe(true); // Should pass when no expected value provided
      expect(result).toBe(15);
    });

    it('should use test helper to verify error throwing', () => {
      const result = testHelper.testOperationThrows('divide', 10, 0, DivisionByZeroError);

      expect(result.thrown).toBe(true);
      expect(result.error).toBeInstanceOf(DivisionByZeroError);
    });

    it('should handle testOperationThrows when no error is thrown', () => {
      const result = testHelper.testOperationThrows('add', 10, 5, DivisionByZeroError);

      expect(result.thrown).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it('should handle testOperationThrows when wrong error type is thrown', () => {
      // Create a custom calculator that throws a different error
      class CustomCalculator extends Calculator {
        divide(a: number, b: number): number {
          throw new Error('Generic error');
        }
      }

      const customCalc = new CustomCalculator();
      const customHelper = new CalculatorTestHelper();

      // Access the private calculator property via reflection or create a new helper
      Object.assign(customHelper, { calculator: customCalc });

      const result = customHelper.testOperationThrows('divide', 10, 5, DivisionByZeroError);

      expect(result.thrown).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it('should generate and validate random batch', () => {
      const batch = CalculatorTestHelper.generateRandomBatch(20);

      expect(batch).toHaveLength(20);

      batch.forEach(item => {
        expect(['add', 'subtract', 'multiply', 'divide']).toContain(item.operation);
        expect(typeof item.a).toBe('number');
        expect(typeof item.b).toBe('number');
      });
    });

    it('should generate random batch with default count', () => {
      const batch = CalculatorTestHelper.generateRandomBatch();

      expect(batch).toHaveLength(10); // Default count

      batch.forEach(item => {
        expect(['add', 'subtract', 'multiply', 'divide']).toContain(item.operation);
        expect(typeof item.a).toBe('number');
        expect(typeof item.b).toBe('number');
      });
    });

    it('should use test helper with error operations', () => {
      const { result, passed, error } = testHelper.testOperation('divide', 10, 0);

      expect(result).toBe(0);
      expect(passed).toBe(false);
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(DivisionByZeroError);
    });

    it('should create mock calculator', () => {
      const mock = CalculatorTestHelper.createMock();

      expect(mock.add).toBeDefined();
      expect(mock.subtract).toBeDefined();
      expect(mock.multiply).toBeDefined();
      expect(mock.divide).toBeDefined();

      // Test mock operations
      expect(mock.add(10, 5)).toBe(15);
      expect(mock.subtract(10, 5)).toBe(5);
      expect(mock.multiply(10, 5)).toBe(50);
      expect(mock.divide(10, 5)).toBe(2);

      // Test mock was called
      expect(mock.add).toHaveBeenCalledWith(10, 5);
      expect(mock.subtract).toHaveBeenCalledWith(10, 5);
      expect(mock.multiply).toHaveBeenCalledWith(10, 5);
      expect(mock.divide).toHaveBeenCalledWith(10, 5);
    });

    it('should test mock throws error', () => {
      const mock = CalculatorTestHelper.createMock();

      expect(() => mock.divide(10, 0)).toThrow(DivisionByZeroError);
    });
  });

  describe('Calculator Assertions', () => {
    it('should assert result equality correctly', () => {
      expect(() => {
        CalculatorAssertions.assertResultEqual(10.5, 10.5);
      }).not.toThrow();

      expect(() => {
        CalculatorAssertions.assertResultEqual(10.5, 10.5001);
      }).not.toThrow(); // Within epsilon

      expect(() => {
        CalculatorAssertions.assertResultEqual(10, 15, 'Values do not match');
      }).toThrow('Values do not match');
    });

    it('should assert result equality with default message', () => {
      expect(() => {
        CalculatorAssertions.assertResultEqual(10, 15);
      }).toThrow('Expected 15, but got 10');
    });

    it('should assert batch results correctly', () => {
      const results: CalculatorResult[] = [
        { value: 15, operation: 'add', timestamp: new Date() },
        { value: 5, operation: 'subtract', timestamp: new Date() },
        { value: 50, operation: 'multiply', timestamp: new Date() }
      ];

      const expectedValues = [15, 5, 50];

      expect(() => {
        CalculatorAssertions.assertBatchResults(results, expectedValues);
      }).not.toThrow();
    });

    it('should detect invalid batch results', () => {
      const results: CalculatorResult[] = [
        { value: 15, operation: 'add', timestamp: new Date() },
        { value: 5, operation: 'subtract', timestamp: new Date() }
      ];

      const expectedValues = [15, 10]; // Wrong value

      expect(() => {
        CalculatorAssertions.assertBatchResults(results, expectedValues);
      }).toThrow();
    });

    it('should detect invalid result objects in batch', () => {
      const results = [
        { value: 15, operation: 'add', timestamp: new Date() },
        null as any, // Invalid result
        { value: 50, operation: 'multiply', timestamp: new Date() }
      ];

      const expectedValues = [15, 5, 50];

      expect(() => {
        CalculatorAssertions.assertBatchResults(results, expectedValues);
      }).toThrow('Result at index 1 is not valid');
    });

    it('should detect mismatched batch lengths', () => {
      const results: CalculatorResult[] = [
        { value: 15, operation: 'add', timestamp: new Date() },
        { value: 5, operation: 'subtract', timestamp: new Date() }
      ];

      const expectedValues = [15, 5, 50]; // Different length

      expect(() => {
        CalculatorAssertions.assertBatchResults(results, expectedValues);
      }).toThrow('Expected 3 results, but got 2');
    });

    it('should assert throws correctly', async () => {
      await expect(
        CalculatorAssertions.assertThrows(
          () => calculator.divide(10, 0),
          DivisionByZeroError
        )
      ).resolves.not.toThrow();
    });

    it('should detect when wrong error type is thrown', async () => {
      await expect(
        CalculatorAssertions.assertThrows(
          () => {
            throw new Error('Generic error');
          },
          DivisionByZeroError
        )
      ).rejects.toThrow();
    });

    it('should detect when no error is thrown', async () => {
      await expect(
        CalculatorAssertions.assertThrows(
          () => calculator.add(10, 5),
          DivisionByZeroError
        )
      ).rejects.toThrow('Expected DivisionByZeroError');
    });
  });

  describe('Performance Benchmarks', () => {
    it('should benchmark add operation', () => {
      const benchmark = PerformanceBenchmark.benchmarkOperation('add', calculator, 100, 50, 100);

      expect(benchmark.totalTimeMs).toBeGreaterThan(0);
      expect(benchmark.avgTimeMs).toBeGreaterThan(0);
      expect(benchmark.minTimeMs).toBeLessThanOrEqual(benchmark.avgTimeMs);
      expect(benchmark.maxTimeMs).toBeGreaterThanOrEqual(benchmark.avgTimeMs);
    });

    it('should run full performance suite', () => {
      const benchmarks = PerformanceBenchmark.runFullBenchmark(calculator);

      expect(benchmarks.add).toBeDefined();
      expect(benchmarks.subtract).toBeDefined();
      expect(benchmarks.multiply).toBeDefined();
      expect(benchmarks.divide).toBeDefined();

      Object.values(benchmarks).forEach(benchmark => {
        expect(benchmark.totalTimeMs).toBeGreaterThan(0);
        expect(benchmark.avgTimeMs).toBeGreaterThan(0);
      });
    });

    it('should measure performance accurately', () => {
      const { result, timeMs } = CalculatorTestHelper.measurePerformance('add', calculator, 10, 5);

      expect(result).toBe(10 + 5);
      expect(timeMs).toBeGreaterThanOrEqual(0);
      expect(timeMs).toBeLessThan(100); // Should be very fast
    });
  });

  describe('Real-World Scenarios', () => {
    it('should calculate shopping cart total', () => {
      const items = [
        { price: 10.99, quantity: 2 },
        { price: 5.50, quantity: 3 },
        { price: 2.99, quantity: 1 }
      ];

      const total = items.reduce((sum, item) =>
        calculator.add(sum, calculator.multiply(item.price, item.quantity)), 0
      );

      expect(total).toBeCloseTo(10.99 * 2 + 5.50 * 3 + 2.99, 2);
    });

    it('should calculate average score', () => {
      const scores = [85, 90, 78, 92, 88];

      const sum = scores.reduce((acc, score) => calculator.add(acc, score), 0);
      const count = scores.length;
      const average = calculator.divide(sum, count);

      expect(average).toBeCloseTo((85 + 90 + 78 + 92 + 88) / 5, 1);
    });

    it('should calculate temperature conversion', () => {
      const celsius = 25;
      const fahrenheit = calculator.add(
        calculator.multiply(calculator.divide(9, 5), celsius),
        32
      );

      expect(fahrenheit).toBe(77);
    });

    it('should handle compound interest calculation', () => {
      const principal = 1000;
      const rate = 0.05; // 5%
      const years = 10;

      const amount = calculator.add(
        principal,
        calculator.multiply(principal, calculator.multiply(rate, years))
      );

      expect(amount).toBe(1500); // Simple interest for 10 years at 5%
    });
  });

  describe('State Management', () => {
    it('should maintain independent state across instances', () => {
      const calc1 = new Calculator();
      const calc2 = new Calculator();

      expect(calc1.add(10, 5)).toBe(15);
      expect(calc2.add(20, 30)).toBe(50);

      // Each instance should work independently
      expect(calc1.subtract(100, 50)).toBe(50);
      expect(calc2.multiply(3, 7)).toBe(21);
    });

    it('should handle sequential operations on same instance', () => {
      const result1 = calculator.add(10, 5);
      const result2 = calculator.multiply(result1, 2);
      const result3 = calculator.subtract(result2, 5);
      const result4 = calculator.divide(result3, 3);

      expect(result1).toBe(15);
      expect(result2).toBe(30);
      expect(result3).toBe(25);
      expect(result4).toBeCloseTo(8.333, 3);
    });
  });

  describe('Type Safety', () => {
    it('should enforce operation types', () => {
      const validOperation: 'add' | 'subtract' | 'multiply' | 'divide' = 'add';
      const result = calculator.calculate(validOperation, 10, 5);

      expect(result.value).toBe(15);
    });

    it('should handle type coercion correctly', () => {
      // TypeScript/JavaScript will convert these to numbers
      expect(calculator.add('10' as any, '5' as any)).toBe('105'); // String concatenation
      expect(calculator.add(Number('10'), Number('5'))).toBe(15); // Proper conversion
    });
  });

  describe('Error Handling', () => {
    it('should provide detailed error information', () => {
      try {
        calculator.divide(100, 0);
        fail('Expected DivisionByZeroError');
      } catch (error) {
        expect(error).toBeInstanceOf(DivisionByZeroError);
        expect((error as Error).name).toBe('DivisionByZeroError');
        expect((error as Error).message).toBeTruthy();
      }
    });

    it('should handle NaN inputs gracefully', () => {
      expect(calculator.add(NaN, 5)).toBeNaN();
      expect(calculator.multiply(NaN, 5)).toBeNaN();
    });

    it('should handle undefined behavior', () => {
      // Our calculator throws DivisionByZeroError for 0/0 instead of returning NaN
      expect(() => calculator.divide(0, 0)).toThrow(DivisionByZeroError);
    });
  });
});
