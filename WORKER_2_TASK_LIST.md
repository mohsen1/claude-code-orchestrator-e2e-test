# Worker-2 Task List

## Assignment: Calculator & CLI Implementation

### Tasks

#### Task 1: Implement `src/calculator.ts`
Implement the main calculator orchestrator module.

**Requirements:**
- Export a `calculate()` function that takes an expression string
- Use parser to parse the expression
- Use operations to perform the calculation
- Handle and propagate errors appropriately
- Return the result as a number

**Example:**
```typescript
export function calculate(expression: string): number {
  // Parse expression
  // Perform operation
  // Return result
}
```

#### Task 2: Implement `src/index.ts`
Implement the CLI entry point.

**Requirements:**
- Accept command-line arguments (the expression to calculate)
- Use the calculator module to compute result
- Print the result to stdout
- Handle errors gracefully (print error message)
- Exit with appropriate status codes

**Example usage:**
```
node dist/index.js "2 + 3"
# Output: 5

node dist/index.js "10 / 2.5"
# Output: 4

node dist/index.js "invalid input"
# Output: Error: Invalid expression
```

### Deliverables
- ✅ Code compiles without TypeScript errors
- ✅ CLI works with various expressions
- ✅ Proper error messages for invalid input
- ✅ Results printed to stdout
- ✅ Works with decimal numbers

### Branch
Create and work on: `worker-2` branch
Final PR: Merge back to `em-team-1`

### Dependencies
- Requires: `src/operations.ts` and `src/parser.ts` from worker-1
- Wait for worker-1 to complete core modules before starting

### Notes
- Error handling is critical for user experience
- Keep the CLI simple and clean
- Support various input formats from users
