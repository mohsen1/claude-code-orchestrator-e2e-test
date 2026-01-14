# Worker-4 Task List

**Assigned**: 2026-01-14
**Status**: Ready to Start
**Branch**: em-team-2

## Current Assignment: Parser, Calculator, CLI & Tests

### Priority Order

#### 1. Implement parser.ts ⭐ START HERE
- Export `parseExpression(input: string)` function
- Parse expressions like "2 + 3", "10 / 2", "5.5 * 2"
- Support: +, -, *, /
- Trim whitespace
- Return object with { left: number, operator: string, right: number }

#### 2. Implement calculator.ts
- Export `calculate(expression: string)` function
- Use parser to parse input
- Import and use operations from worker-3's operations.ts
- Return result
- Handle errors gracefully

#### 3. Implement index.ts (CLI entry point)
- Read command line argument (the expression)
- Call calculate()
- Print result to stdout
- Example: `node dist/index.js "2 + 3"` → outputs `5`

#### 4. Implement calculator.test.ts
- Test parser with various inputs
- Test calculator end-to-end integration
- Test invalid input handling
- Import operations and test integration with parser/calculator
- Test division by zero error handling

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
- **Dependency**: Requires worker-3's operations.ts to be completed first
- You can start parser.ts while worker-3 works on operations.ts

## When Done
Push to em-team-2 and notify EM-2 for validation and merging
