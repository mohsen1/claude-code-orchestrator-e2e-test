# Worker-1 Task List

## Assignment: Parser & Operations Implementation

### Tasks

#### Task 1: Implement `src/operations.ts`
Implement the core math operations module.

**Requirements:**
- Export functions: `add`, `subtract`, `multiply`, `divide`
- Each function takes two numbers and returns a number
- `divide()` must throw an error if divisor is zero
- Support decimal numbers
- Use TypeScript with strict mode

**Example:**
```typescript
export function add(a: number, b: number): number { ... }
export function subtract(a: number, b: number): number { ... }
export function multiply(a: number, b: number): number { ... }
export function divide(a: number, b: number): number { ... }
```

#### Task 2: Implement `src/parser.ts`
Implement the expression parser module.

**Requirements:**
- Export a parse function that takes a string expression
- Should handle formats like "2 + 3", "10 / 2.5"
- Support operators: +, -, *, /
- Handle whitespace
- Support decimal numbers
- Return an object with operands and operator
- Throw error for invalid input

**Example:**
```typescript
interface ParseResult {
  operand1: number;
  operator: string;
  operand2: number;
}

export function parse(expression: string): ParseResult { ... }
```

### Deliverables
- ✅ Code compiles without TypeScript errors
- ✅ Error handling for invalid input
- ✅ Support for decimal numbers
- ✅ Ready for integration with calculator.ts

### Branch
Create and work on: `worker-1` branch
Final PR: Merge back to `em-team-1`

### Notes
- Tests will be written by worker-3
- Ensure proper error messages for debugging
- Keep functions pure and testable
