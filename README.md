# Claude Code Orchestrator E2E Test

This repository tests the [Claude Code Orchestrator](https://github.com/mohsen1/claude-code-orchestrator-action) action.

## Usage

1. Create a new issue
2. Add the `orchestrator` label
3. The orchestrator will automatically break down the issue and implement it

---

## Calculator Edge Cases Test Suite

This project implements a calculator module with comprehensive edge case testing for division by zero, large numbers, decimal precision, and overflow/underflow scenarios.

### Features

#### Calculator Module (`src/calculator.ts`)
- **Basic Operations**: Addition, Subtraction, Multiplication, Division
- **Advanced Operations**: Power (exponentiation), Square Root
- **Custom Error Types**:
  - `DivisionByZeroError`: Thrown when attempting to divide by zero
  - `OverflowError`: Thrown when operations result in positive infinity
  - `UnderflowError`: Thrown when operations result in negative infinity

#### Edge Cases Test Suite (`src/calculator-edge-cases.test.ts`)

The test suite covers:

1. **Division by Zero Error Handling**
   - Standard division by zero scenarios
   - Positive and negative numbers divided by zero
   - Zero divided by zero
   - Verification of correct error type and messages

2. **Very Large Numbers**
   - Operations at `Number.MAX_SAFE_INTEGER` boundaries
   - Overflow detection in addition, multiplication, and power operations
   - Underflow detection with negative large numbers
   - Division of large numbers

3. **Very Small Decimal Precision**
   - Addition and multiplication of very small decimals
   - Precision maintenance (e.g., 0.1 + 0.2 ≈ 0.3)
   - Division resulting in very small decimals
   - Handling of `Number.MIN_VALUE` (smallest denormal number)
   - Underflow detection with tiny numbers

4. **Overflow/Underflow Scenarios**
   - Detection of operations resulting in ±Infinity
   - Proper error type verification
   - Descriptive error messages with operation details
   - Chain operations that may cause overflow

5. **Combined Edge Cases**
   - Mixed magnitude operations (large + small numbers)
   - Chain operations with precision maintenance
   - Zero handling in various operations
   - Negative zero handling

6. **Special Number Values**
   - NaN handling
   - Infinity handling
   - Epsilon (`Number.EPSILON`) precision testing

7. **Error Message Validation**
   - Verification that error messages contain operation details
   - Correct error names for all custom error types

### Running Tests

```bash
npm install
npm test
```
