# EM-2 Task Manifest: Parser & CLI Interface

**Engineering Manager**: em-team-2
**Branch**: em-team-2
**Assigned Workers**: worker-3, worker-4
**Blocking Dependencies**: EM-1 must complete `src/operations.ts` and `src/calculator.ts`

## Directive
Build the user-facing interface for the calculator. Parse mathematical expressions and provide a clean CLI experience. Your team depends on EM-1's core engine.

## High-Priority Tasks (Requires EM-1 Completion)

### Task 1: Expression Parser Module
**File**: `src/parser.ts`
**Owner**: worker-3 (lead)
**Dependencies**: Must wait for EM-1's `src/calculator.ts`
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
**Dependencies**: Must wait for EM-1's `src/calculator.ts` and Task 1 completion
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
**Description**:
- Test full pipeline: input → parse → calculate → output
- Test CLI with real arguments
- Test error scenarios end-to-end

**Acceptance Criteria**:
- [ ] All tests passing
- [ ] Critical paths validated

## Deliverables
- [ ] `src/parser.ts` - Complete and tested
- [ ] `src/index.ts` - Complete and tested
- [ ] `tests/parser.test.ts` - Full test coverage
- [ ] `tests/integration.test.ts` (if completed)
- [ ] All tests pass: `npm test`
- [ ] CLI works: `npm start -- "2 + 3"`
- [ ] TypeScript compiles: `npm run build`

## Success Criteria
- Zero test failures
- CLI executable and responsive
- Graceful error messages
- TypeScript strict mode compliance
- Code ready for merge and production

## Escalation Triggers
- Blocked waiting for EM-1 beyond scheduled time
- Parser design questions
- CLI usability concerns
- Test failures that can't be resolved by team

**Report escalations to**: Director (via escalation protocol)

## Wait Gate
**Do not start until**: EM-1 completes and merges `src/operations.ts` and `src/calculator.ts`
