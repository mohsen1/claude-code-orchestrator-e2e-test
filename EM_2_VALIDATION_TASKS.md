# EM-2 Revised Directive: Quality Assurance & Validation

**Status**: POST-MERGE REASSIGNMENT
**Effective**: After EM-1 merge (commit ff9899b)
**Engineering Manager**: em-team-2
**Branch**: em-team-2 (reset for validation work)
**Assigned Workers**: worker-4 (validation lead)
**Worker-3 Status**: Available for reassignment

---

## Context
EM-1 completed the entire calculator implementation (operations.ts, parser.ts, calculator.ts, index.ts) with 131 passing tests. The project is feature-complete. EM-2's original scope (parser + CLI) has been fulfilled by EM-1.

**Director Decision**: Reassign EM-2 to validation/acceptance testing role to ensure production-ready quality.

---

## New Mandate: Quality Assurance & CLI Hardening

### High-Priority Validation Tasks

#### Task 1: Edge Case Testing
**Owner**: worker-4
**Deliverable**: `tests/edge-cases.test.ts`
**Description**:
- Test boundary conditions: very large numbers, very small decimals
- Test precision edge cases: 0.1 + 0.2, floating-point rounding
- Test special cases: negative inputs, zero operands
- Test all operation combinations with edge case values
- Ensure division by zero consistently handled

**Acceptance Criteria**:
- [ ] New test file covers 15+ edge cases
- [ ] All tests pass
- [ ] No precision errors in output

#### Task 2: CLI Hardening & Error Messages
**Owner**: worker-4
**Deliverable**: Validation report + CLI improvements
**Description**:
- Test CLI with malformed inputs: empty string, special characters, extra spaces
- Test invalid operations: "2 & 3", "2 ^ 3", unknown operators
- Verify error messages are clear and helpful
- Test exit codes: verify 0 on success, 1 on error
- Verify --help flag works correctly

**Acceptance Criteria**:
- [ ] No crashes on bad input
- [ ] Exit codes correct
- [ ] Error messages user-friendly
- [ ] --help displays usage

#### Task 3: Integration Testing
**Owner**: worker-4
**Deliverable**: `tests/integration.test.ts`
**Description**:
- Test full pipeline: expression input → parsing → calculation → output
- Test complex expressions if supported
- Test CLI with file input (if applicable)
- Verify output format consistency
- Test sequential operations

**Acceptance Criteria**:
- [ ] 10+ integration tests
- [ ] All critical workflows validated
- [ ] Output format consistent

#### Task 4: Performance & Usability Check
**Owner**: worker-4
**Deliverable**: Brief validation report
**Description**:
- Verify CLI response time (should be <100ms)
- Check memory usage for large numbers
- Verify clear help/usage documentation
- Ensure consistent user experience across platforms

**Acceptance Criteria**:
- [ ] CLI responds quickly
- [ ] No memory leaks observed
- [ ] Documentation complete

---

## Deliverables
- [ ] `tests/edge-cases.test.ts` - Comprehensive edge case coverage
- [ ] `tests/integration.test.ts` - Full workflow integration tests
- [ ] CLI Validation Report (markdown) - Issues found, recommendations
- [ ] All tests pass: `npm test`
- [ ] Build passes: `npm run build`

## Success Criteria
- Zero new bugs discovered
- 100% test pass rate maintained
- CLI handles all error conditions gracefully
- Ready for production deployment

## Next Steps for EM-2
After validation complete:
1. Merge validation test suite to main
2. Document any issues found
3. Team available for new initiatives or maintenance

## Worker-3 Availability
**worker-3** is unassigned post-merge and available for:
- New feature development
- Cross-project work
- Team scaling on other initiatives
- Director discretion

---

**EM-2**: Please reset em-team-2 branch to main and begin validation work immediately.
