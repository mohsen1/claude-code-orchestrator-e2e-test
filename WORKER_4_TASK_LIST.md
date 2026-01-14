# Worker-4 Task List

**Assigned**: 2026-01-14
**Status**: Ready to Start
**Branch**: em-team-2

## Current Assignment: Implement Calculator

### Priority Order

#### 1. Implement operations.ts ⭐ START HERE
- Export functions: `add`, `subtract`, `multiply`, `divide`
- Each function takes two numbers and returns result
- Handle division by zero (throw error or return message)

#### 2. Implement parser.ts
- Export `parseExpression(input: string)` function
- Parse expressions like "2 + 3", "10 / 2", "5.5 * 2"
- Support: +, -, *, /
- Trim whitespace
- Return object with { left: number, operator: string, right: number }

#### 3. Implement calculator.ts
- Export `calculate(expression: string)` function
- Use parser to parse input
- Use operations to compute result
- Return result
- Handle errors gracefully

#### 4. Implement index.ts (CLI entry point)
- Read command line argument (the expression)
- Call calculate()
- Print result to stdout
- Example: `node dist/index.js "2 + 3"` → outputs `5`

#### 5. Implement calculator.test.ts
- Test each operation: add, subtract, multiply, divide
- Test division by zero handling
- Test parser with various inputs
- Test calculator end-to-end
- Test invalid input handling

## Acceptance Criteria
- [ ] All files created in src/
- [ ] `npm run build` succeeds with no errors
- [ ] `npm run test` passes all tests
- [ ] CLI works: `node dist/index.js "2 + 3"` returns `5`
- [ ] Division by zero handled
- [ ] Invalid input handled

## Notes
- Use TypeScript strict mode
- Decimal numbers should work: "1.5 * 2" → 3
- Keep implementation simple and focused
- Export functions/classes for testing

## When Done
Push to em-team-2 and notify EM-2 for validation and merging
