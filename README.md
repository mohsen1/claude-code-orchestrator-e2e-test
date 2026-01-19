# Calculator Module

A simple TypeScript calculator module that supports basic arithmetic operations with proper error handling.

## Features

- **Addition** - Add two numbers
- **Subtraction** - Subtract two numbers
- **Multiplication** - Multiply two numbers
- **Division** - Divide two numbers with divide-by-zero error handling

## Installation

```bash
npm install
```

## Usage

### Basic Usage

```typescript
import { Calculator } from './src/index';

// Create a calculator instance
const calc = new Calculator();

// Addition
const sum = calc.add(5, 3);
console.log(sum); // Output: 8

// Subtraction
const difference = calc.subtract(10, 4);
console.log(difference); // Output: 6

// Multiplication
const product = calc.multiply(6, 7);
console.log(product); // Output: 42

// Division
const quotient = calc.divide(20, 4);
console.log(quotient); // Output: 5
```

### Error Handling

The `divide` method throws an error when attempting to divide by zero:

```typescript
import { Calculator } from './src/index';

const calc = new Calculator();

try {
  const result = calc.divide(10, 0);
} catch (error) {
  console.error(error.message); // Output: "Division by zero"
}
```

### Complete Example

```typescript
import { Calculator } from './src/index';

const calc = new Calculator();

// Perform calculations
const a = 15;
const b = 3;

console.log(`${a} + ${b} = ${calc.add(a, b)}`);      // 15 + 3 = 18
console.log(`${a} - ${b} = ${calc.subtract(a, b)}`); // 15 - 3 = 12
console.log(`${a} × ${b} = ${calc.multiply(a, b)}`); // 15 × 3 = 45
console.log(`${a} ÷ ${b} = ${calc.divide(a, b)}`);   // 15 ÷ 3 = 5

// Handle division by zero
try {
  calc.divide(10, 0);
} catch (error) {
  console.error('Error:', error.message);
}
```

## API Reference

### `Calculator.add(a: number, b: number): number`

Adds two numbers.

**Parameters:**
- `a` - First number
- `b` - Second number

**Returns:** The sum of `a` and `b`

---

### `Calculator.subtract(a: number, b: number): number`

Subtracts the second number from the first.

**Parameters:**
- `a` - First number
- `b` - Second number

**Returns:** The difference of `a` and `b`

---

### `Calculator.multiply(a: number, b: number): number`

Multiplies two numbers.

**Parameters:**
- `a` - First number
- `b` - Second number

**Returns:** The product of `a` and `b`

---

### `Calculator.divide(a: number, b: number): number`

Divides the first number by the second.

**Parameters:**
- `a` - Dividend
- `b` - Divisor

**Returns:** The quotient of `a` and `b`

**Throws:** `Error` when `b` is zero with message "Division by zero"

## License

MIT
