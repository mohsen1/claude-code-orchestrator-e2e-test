# Worker-3 Task List

**Assigned**: 2026-01-14
**Status**: Ready to Start
**Branch**: em-team-2

## Current Assignment: Math Operations Module

### Single Focus Task: Implement operations.ts

**Create file**: `src/operations.ts`

**Export these functions**:

1. **`add(a: number, b: number): number`**
   - Returns a + b
   - Example: add(2, 3) → 5

2. **`subtract(a: number, b: number): number`**
   - Returns a - b
   - Example: subtract(10, 3) → 7

3. **`multiply(a: number, b: number): number`**
   - Returns a * b
   - Example: multiply(4, 2.5) → 10

4. **`divide(a: number, b: number): number`**
   - Returns a / b
   - **IMPORTANT**: Handle division by zero
   - Throw an Error with message: "Division by zero"
   - Example: divide(10, 2) → 5
   - Example: divide(10, 0) → throws Error("Division by zero")

### Requirements
- ✅ TypeScript with strict mode
- ✅ Support decimal numbers
- ✅ Each function takes two numbers, returns a number
- ✅ All exports must be valid for unit testing
- ✅ No console.log or side effects

### Acceptance Criteria
- [ ] File `src/operations.ts` created
- [ ] All 4 functions exported
- [ ] `npm run build` succeeds
- [ ] Functions work with whole and decimal numbers
- [ ] Division by zero throws an error
- [ ] No TypeScript compilation errors

### Example Usage (after build)
```typescript
import { add, subtract, multiply, divide } from './operations.js'

add(2, 3)              // 5
multiply(1.5, 2)       // 3
divide(10, 0)          // throws Error("Division by zero")
```

## When Done
Push to em-team-2 and notify EM-2. Worker-4 will depend on this for integration testing.
