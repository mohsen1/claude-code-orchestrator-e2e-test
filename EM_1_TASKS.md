# EM-1 Task Manifest: Core Calculator Engine

**Engineering Manager**: em-team-1
**Branch**: em-team-1
**Assigned Workers**: worker-1, worker-2
**Dependencies**: None

## Directive
Implement the core mathematical engine of the calculator. Your work is the foundation for EM-2's parser and CLI. Quality and correctness are paramount.

## High-Priority Tasks (Blocking for EM-2)

### Task 1: Math Operations Module
**File**: `src/operations.ts`
**Owner**: worker-1 (lead)
**Description**:
- Export functions: `add(a, b)`, `subtract(a, b)`, `multiply(a, b)`, `divide(a, b)`
- Handle decimal numbers
- Handle negative numbers
- **Division by zero**: throw `Error("Division by zero")`
- Include JSDoc comments for each function

**Acceptance Criteria**:
- [ ] All 4 operations work correctly
- [ ] Division by zero throws error
- [ ] Decimal precision maintained
- [ ] Tests pass 100%

### Task 2: Calculator Orchestrator
**File**: `src/calculator.ts`
**Owner**: worker-2 (lead)
**Description**:
- Export a `Calculator` class with method: `calculate(operation: string, a: number, b: number): number`
- Use operations from `operations.ts`
- Validate inputs before calculation
- Throw descriptive errors for invalid inputs

**Acceptance Criteria**:
- [ ] Takes operation name and operands
- [ ] Returns correct result
- [ ] Validates operation names
- [ ] Error handling works

### Task 3: Operations Unit Tests
**File**: `tests/operations.test.ts`
**Owner**: worker-1
**Test Framework**: vitest
**Description**:
- Test all operations with normal values
- Test with decimals (e.g., 0.1 + 0.2)
- Test with negative numbers
- Test division by zero error case
- Aim for 100% coverage

**Acceptance Criteria**:
- [ ] All tests passing
- [ ] Coverage ≥ 95%

### Task 4: Calculator Unit Tests
**File**: `tests/calculator.test.ts`
**Owner**: worker-2
**Test Framework**: vitest
**Description**:
- Test Calculator class with all operations
- Test invalid operation names
- Test invalid input types
- Test error handling

**Acceptance Criteria**:
- [ ] All tests passing
- [ ] Coverage ≥ 95%

## Deliverables
- [ ] `src/operations.ts` - Complete and tested
- [ ] `src/calculator.ts` - Complete and tested
- [ ] `tests/operations.test.ts` - Full test coverage
- [ ] `tests/calculator.test.ts` - Full test coverage
- [ ] All tests pass: `npm test`
- [ ] TypeScript compiles cleanly: `npm run build`

## Success Criteria
- Zero test failures
- TypeScript strict mode compliance
- Code ready for EM-2 to consume
- Branch passes code review before merge

## Escalation Triggers
- Task blocked beyond 2 hours
- Test failures that can't be resolved by team
- TypeScript compilation errors blocking progress
- Architectural questions about calculator design

**Report escalations to**: Director (via escalation protocol)
