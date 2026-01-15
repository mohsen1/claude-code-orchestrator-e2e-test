# Calculator Project

## Overview
Build a simple command-line calculator in TypeScript.

## Requirements

### Core Features
1. **Basic Operations**: Add, subtract, multiply, divide
2. **Input Handling**: Parse expressions like "2 + 3" or "10 / 2"
3. **Error Handling**: Handle division by zero, invalid input

### File Structure
```
src/
  calculator.ts    # Main calculator logic
  parser.ts        # Expression parser
  operations.ts    # Math operations
  index.ts         # CLI entry point
tests/
  calculator.test.ts
package.json
tsconfig.json
```

### Implementation Notes
- Use TypeScript with strict mode
- Include unit tests using vitest
- Support decimal numbers
- Print results to stdout

## Success Criteria
- All basic operations work correctly
- Tests pass
- Code compiles without errors
