# CI/CD Pipeline Setup Documentation

## Overview

SplitSync uses a comprehensive GitHub Actions CI/CD pipeline to ensure code quality, security, and reliable deployments.

## Pipeline Architecture

### Parallel Jobs

The CI pipeline runs multiple jobs in parallel to maximize speed:

1. **Lint** - ESLint with strict TypeScript and React rules
2. **Type Check** - TypeScript compiler verification
3. **Unit Tests** - Vitest with 4-way sharding for parallel execution
4. **Integration Tests** - Database-backed integration tests
5. **Build** - Next.js production build verification
6. **Security** - npm audit, Snyk scan, and secret detection

### Sequential Jobs

1. **Coverage** - Aggregates test coverage from all test jobs
2. **Status Check** - Final verification that all jobs passed
3. **Deploy** - Automated deployment to production (main branch only)

## Caching Strategy

### Dependencies
- `node_modules` and `.npm` directories are cached based on `package-lock.json` hash
- Speeds up dependency installation significantly

### Build Artifacts
- `.next` and `out` directories are cached
- Keyed by package-lock hash and source file hashes

### Test Cache
- Vitest cache for faster test reruns
- Coverage reports cached between runs

## ESLint Configuration

### Strict Rules

**TypeScript:**
- No `any` types (error)
- Explicit return types (error)
- Strict boolean expressions (error)
- No floating promises (error)
- Naming conventions enforced

**React:**
- React Hooks rules enforced
- No array index keys
- JSX key validation
- Self-closing components

**Best Practices (Unicorn):**
- Modern JavaScript patterns
- Prefer native APIs
- Consistent error handling
- Better regex patterns

**Code Quality (SonarJS):**
- Cognitive complexity limits
- No duplicated branches
- Code smell detection
- Dead code elimination

**Security:**
- SQL injection prevention
- XSS detection
- Timing attack prevention
- Eval detection

## Prettier Configuration

### Formatting Rules

- **Indent:** 2 spaces
- **Quotes:** Single quotes
- **Semicolons:** Required (trailing commas in ES5)
- **Print Width:** 100 characters
- **Line Endings:** LF (Unix)

### Import Sorting

Automatically sorts imports in this order:
1. React
2. Next.js
3. Third-party libraries
4. Internal libraries (@/)
5. Types
6. Relative imports

## Test Configuration

### Unit Tests (Vitest)

**Framework:** Vitest with jsdom environment

**Coverage Thresholds:**
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

**Sharding:** 4 parallel shards for faster execution

**Setup:** `src/test/setup.ts` provides:
- Router mocks
- Window API mocks
- Test cleanup

### Integration Tests

**Framework:** Vitest with Node environment

**Database:** In-memory SQLite test database

**Timeouts:** 30 seconds (longer than unit tests)

**Setup:** `src/test/setup-integration.ts` manages test database

## Pre-commit Hooks

### Lint-Staged Configuration

Run before each commit:
1. ESLint with auto-fix
2. Prettier formatting
3. Related tests execution
4. TypeScript type checking
5. File size warnings (500KB limit)

### Husky

Git hooks are managed via Husky:
- `.husky/pre-commit` runs lint-staged
- Automatically installed on `npm install`

## GitHub Actions Features

### Concurrency Control

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

Cancels in-progress runs for the same branch when new commits are pushed.

### Artifact Upload

- Lint reports (HTML and JSON)
- Test results per shard
- Coverage reports
- Build outputs

### Notifications

Pipeline status is reported via:
- GitHub UI (required checks)
- GitHub Step Summaries (formatted reports)
- Deploy notifications on main branch

### Deployment

**Triggers:**
- Only on `main` branch
- Only after all checks pass
- Only on push (not PR)

**Process:**
1. Download build artifacts
2. Configure AWS credentials
3. Sync to S3 bucket
4. Invalidate CloudFront cache

## Local Development

### Running CI Commands Locally

```bash
# Lint
npm run lint
npm run lint:fix

# Type check
npm run typecheck

# Format
npm run format

# Tests
npm run test              # All tests
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests only
npm run test:watch        # Watch mode

# Coverage
npm run test:coverage

# Build
npm run build

# Database
npm run db:generate       # Generate migrations
npm run db:migrate        # Run migrations
npm run db:studio         # Open Drizzle Studio
```

### Checking Coverage

```bash
npm run test:coverage:check
```

Fails if coverage drops below thresholds.

### Pre-commit Check

```bash
npm run precommit
```

Manually run pre-commit hooks (same as git pre-commit).

## Environment Variables

### Required for CI

- `DATABASE_URL` - SQLite database file path
- `NODE_ENV` - Set to `test` in CI

### Required for Deployment

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET`
- `CLOUDFRONT_DISTRIBUTION_ID`

### Optional

- `SNYK_TOKEN` - Snyk security scanning
- `CODECOV_TOKEN` - Codecov coverage reporting

## Troubleshooting

### CI Failures

**Type Check Errors:**
- Ensure all imports are typed
- Check for missing return types
- Run `npm run typecheck` locally

**Lint Errors:**
- Run `npm run lint:fix` to auto-fix
- Check ESLint output for specific rules
- Review `.eslintrc.json` for rule configurations

**Test Failures:**
- Run tests locally: `npm run test`
- Check test logs in GitHub Actions artifacts
- Ensure test database is properly seeded

**Build Failures:**
- Check Next.js build logs
- Verify environment variables are set
- Run `npm run build` locally

### Cache Issues

If caching causes problems, you can:
1. Manually clear GitHub Actions cache
2. Push a commit with `[cache clear]` in the message
3. Increase cache version in workflow file

### Speed Optimization

To speed up CI:
- Use sharding for tests (already configured)
- Enable dependency caching (already configured)
- Use matrix jobs for parallel execution (already configured)
- Consider using larger runners for complex builds

## Security Best Practices

1. **Secret Scanning:** TruffleHog detects leaked credentials
2. **Dependency Auditing:** npm audit and Snyk scanning
3. **Code Quality:** ESLint security plugin detects vulnerabilities
4. **No Secrets in Logs:** Environment variables are not echoed

## Maintenance

### Updating Dependencies

```bash
npm outdated
npm update
```

Review PR changes before merging.

### Updating CI Configuration

1. Edit `.github/workflows/ci.yml`
2. Test in a feature branch
3. Review GitHub Actions logs
4. Merge to main

### Monitoring

- Check GitHub Actions tab regularly
- Review failed builds
- Monitor build duration trends
- Track flaky test failures

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Vitest Documentation](https://vitest.dev/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
