# EM-2 Task Manifest: Parser & CLI Interface

**Engineering Manager**: em-team-2
**Branch**: em-team-2
**Assigned Workers**: worker-3, worker-4
**Status**: Worker-3 operations.ts COMPLETE ✅ | Waiting on EM-1 calculator.ts

## Directive
Build the user-facing interface for the calculator. Parse mathematical expressions and provide a clean CLI experience. Your team depends on EM-1's core engine.

## High-Priority Tasks (Waiting on EM-1)

### Task 1: Expression Parser Module
**File**: `src/parser.ts`
**Owner**: worker-3 (lead)
**Status**: ⏳ Blocked - Awaiting EM-1's `src/calculator.ts`
**Description**:
- Export function: `parseExpression(input: string): { operation: string; a: number; b: number }`
- Supports formats: "2 + 3", "10-5", "6 * 7", "20 / 4"
- Handle spaces gracefully: " 2 + 3 " should work
- **Invalid input**: throw `Error("Invalid expression")`
- Return object with: `{ operation: string, a: number, b: number }`

**Acceptance Criteria**:
- [ ] Parses all 4 operations (+, -, *, /)
- [ ] Handles decimal numbers
- [ ] Handles negative numbers
- [ ] Rejects invalid input with clear error
- [ ] Tests pass 100%

### Task 2: CLI Entry Point
**File**: `src/index.ts`
**Owner**: worker-4 (lead)
**Status**: ⏳ Blocked - Depends on Task 1 and EM-1's `src/calculator.ts`
**Description**:
- Executable that accepts CLI arguments: `calculator "2 + 3"`
- Parse expression using `parser.ts`
- Calculate result using `Calculator` from `calculator.ts`
- Print result to stdout: `Result: 5`
- Print errors to stderr with descriptive message
- Support `--help` flag showing usage
- Exit with code 0 on success, 1 on error

**Acceptance Criteria**:
- [ ] CLI works: `npx ts-node src/index.ts "2 + 3"`
- [ ] Correct output format
- [ ] Error handling with exit codes
- [ ] Help message works

### Task 3: Parser Unit Tests
**File**: `tests/parser.test.ts`
**Owner**: worker-3
**Test Framework**: vitest
**Status**: ⏳ Blocked - Awaiting Task 1 completion
**Description**:
- Test all 4 operations
- Test with decimals
- Test with negative numbers
- Test with spaces
- Test invalid expressions (various failure modes)
- Aim for 100% coverage

**Acceptance Criteria**:
- [ ] All tests passing
- [ ] Coverage ≥ 95%

### Task 4: Integration Tests
**File**: `tests/integration.test.ts` (optional, if time permits)
**Owner**: worker-4
**Test Framework**: vitest
**Status**: ⏳ Blocked - Depends on all prior tasks
**Description**:
- Test full pipeline: input → parse → calculate → output
- Test CLI with real arguments
- Test error scenarios end-to-end

**Acceptance Criteria**:
- [ ] All tests passing
- [ ] Critical paths validated

## Completed Work ✅

**Worker-3 Completed** (Merged 2026-01-14):
- [x] `src/operations.ts` - Math operations (add, subtract, multiply, divide)
- [x] Division by zero error handling
- [x] Decimal number support

## Deliverables Status
- [ ] `src/parser.ts` - Waiting on EM-1
- [ ] `src/index.ts` - Waiting on EM-1
- [ ] `tests/parser.test.ts` - Waiting on EM-1
- [ ] `tests/integration.test.ts` (if time permits)
- [ ] All tests pass: `npm test`
- [ ] CLI works: `npm start -- "2 + 3"`
- [ ] TypeScript compiles: `npm run build`

## Success Criteria
- Zero test failures
- CLI executable and responsive
- Graceful error messages
- TypeScript strict mode compliance
- Code ready for merge and production

## Critical Blocker
**EM-1 DEPENDENCY**: Must deliver `src/calculator.ts` for EM-2 to proceed.
Contact Director if EM-1 escalates timeline concerns.
