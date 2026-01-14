# Team Structure & Organization

## Project: Calculator Project

### Team Composition
- **2 Engineering Managers (EMs)** leading technical direction
- **4 Workers** organized under EMs based on workload

## Team Breakdown

### EM-1: Core Calculator Engine
**Focus**: Implement the mathematical heart of the calculator
- **Assigned Workers**: worker-1, worker-2
- **Primary Deliverables**:
  - `src/operations.ts` - Basic math operations (add, subtract, multiply, divide)
  - `src/calculator.ts` - Core calculator orchestration logic
  - `tests/operations.test.ts` - Unit tests for operations
  - `tests/calculator.test.ts` - Unit tests for calculator logic
- **Dependencies**: None (independent)
- **Success Criteria**:
  - All operations handle positive/negative numbers
  - Division by zero properly rejected
  - All tests passing

### EM-2: Parser & CLI Interface
**Focus**: Build the user-facing layer and expression parsing
- **Assigned Workers**: worker-3, worker-4
- **Primary Deliverables**:
  - `src/parser.ts` - Parse mathematical expressions (e.g., "2 + 3")
  - `src/index.ts` - CLI entry point and orchestration
  - `tests/parser.test.ts` - Unit tests for expression parsing
  - E2E integration tests
- **Dependencies**: EM-1 (uses operations from Core Engine)
- **Success Criteria**:
  - Parse valid expressions correctly
  - Reject invalid input gracefully
  - CLI executable and responsive

## Workflow
1. EM-1 completes core logic (independent work) - BLOCKING for EM-2
2. EM-2 builds parser and CLI using EM-1's exports
3. Both teams integrate for final validation

## Team Resizing Rules
- Teams will be evaluated after each merge
- Maximum 3 workers per team (currently at 2 each)
- Idle workers may be reassigned to bottleneck teams
- Teams with 1 blocker will be escalated to Director

## Critical Blocking Dependencies
**EM-2 MUST WAIT** for EM-1 to complete and merge:
- `src/operations.ts` - Core math operations module
- `src/calculator.ts` - Calculator orchestration class

**Rationale**: Maintains separation of concerns and prevents merge conflicts from parallel rewrites of core logic.

## Director Decision Log

### Decision 1: EM-2 Escalation Rejection (2026-01-14 07:25)
**Status**: REJECTED

EM-2 submitted modified task list proposing worker-4 implement all modules including operations.ts and calculator.ts.

**Rejection Rationale**:
- Violates established architecture (EM-1 owns core, EM-2 owns interface)
- Bypasses blocking dependency model
- Underutilizes team (worker-3 not included)
- No implementation code provided, only doc changes
- Would cause merge conflicts and duplicate effort

**Director Action**:
- Maintain original team assignments
- EM-1 to deliver operations.ts + calculator.ts (no changes)
- EM-2 to deliver parser.ts + index.ts (as directed)
- Both teams to commit code, not doc modifications
- Re-escalate if EM-1 cannot complete within reasonable time
