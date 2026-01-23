# Branch Protection Rules for SplitSync

This document outlines the recommended branch protection rules for the SplitSync repository to ensure code quality and prevent issues.

## Required Branch Protection Settings

### Main Branch (`main`)

**Status Checks:**
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- Required checks:
  - `Lint (ESLint)`
  - `Type Check (TypeScript)`
  - `Test (Vitest)` (all 4 shards)
  - `Build Verification`
  - `CI Completion Check`

**Branch Protection Rules:**
- ✅ Require pull request reviews before merging
  - Number of approving reviews: **1**
  - Dismiss stale reviews when new commits are pushed
  - Require review from CODEOWNERS
  - Require approval of the most recent review

**Additional Protections:**
- ✅ Do not allow bypassing the above settings
- ✅ Require signed commits (recommended)
- ✅ Restrict who can push to matching branches (maintainers only)
- ❌ Allow force pushes: **Disabled**
- ❌ Allow deletions: **Disabled**

### Development Branch (`develop`)

**Status Checks:**
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- Required checks:
  - `Lint (ESLint)`
  - `Type Check (TypeScript)`
  - `Test (Vitest)` (all 4 shards)
  - `Build Verification`

**Branch Protection Rules:**
- ✅ Require pull request reviews before merging
  - Number of approving reviews: **1**

**Additional Protections:**
- ✅ Do not allow bypassing the above settings
- ❌ Allow force pushes: **Disabled**
- ❌ Allow deletions: **Disabled**

## CODEOWNERS Configuration

Create `.github/CODEOWNERS`:

```
# Global codeowners
* @team-lead @tech-lead

# Specific areas
.github/workflows/** @devops-team
src/db/** @database-team
src/app/api/auth/** @security-team
src/lib/auth/** @security-team
```

## How to Configure Branch Protection

### Via GitHub UI:

1. Go to repository **Settings**
2. Click **Branches** in the left sidebar
3. Click **Add branch protection rule**
4. Enter branch name pattern (`main` or `develop`)
5. Configure settings as listed above
6. Click **Create** or **Save changes**

### Via GitHub CLI:

```bash
# Protect main branch
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/OWNER/REPO/branches/main/protection \
  -f required_status_checks='{
    "strict": true,
    "contexts": [
      "Lint (ESLint)",
      "Type Check (TypeScript)",
      "Test (Vitest)",
      "Build Verification",
      "CI Completion Check"
    ],
    "checks": [
      { "context": "Lint (ESLint)" },
      { "context": "Type Check (TypeScript)" },
      { "context": "Test (Vitest)" },
      { "context": "Build Verification" },
      { "context": "CI Completion Check" }
    ]
  }' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{
    "required_approving_review_count": 1
  }' \
  -f restrictions=null \
  -f allow_force_pushes=false \
  -f allow_deletions=false
```

## Workflow Permissions

Ensure the GitHub Actions workflow has the necessary permissions:

In `.github/workflows/ci.yml`, the workflow implicitly has:
- `contents: read` - to checkout code
- `pull-requests: write` - to annotate PRs with results
- `checks: write` - to post status checks
- `statuses: write` - to update commit statuses

For deployment, additional permissions may be needed:

```yaml
permissions:
  contents: read
  pull-requests: write
  checks: write
  statuses: write
  deployments: write  # for deployment job
```

## CI/CD Best Practices

### 1. Parallel Job Execution
All quality checks (lint, typecheck, test, build) run in parallel for faster feedback.

### 2. Sharded Tests
Tests are split across 4 runners to reduce total execution time:
```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
```

### 3. Caching Strategy
Node modules are cached using `actions/setup-node@v4`:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
```

### 4. Concurrency Control
Cancel in-progress runs for the same branch:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### 5. Artifact Upload
Build artifacts and test results are uploaded for debugging:
```yaml
- uses: actions/upload-artifact@v4
  with:
    name: build-output
    path: .next
    retention-days: 7
```

## Pre-commit Hooks (Recommended)

For faster feedback, consider setting up pre-commit hooks:

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run typecheck"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## Required Environment Variables

For the CI pipeline to run successfully, ensure these are configured:

### GitHub Secrets:
- `CODECOV_TOKEN` - For coverage reporting (optional)
- `NPM_TOKEN` - For private package installation (if needed)

### GitHub Variables:
- `NODE_ENV` - Set to `test` for CI runs

## Monitoring and Alerts

### Recommended Alerts:
1. **CI Failure Alert**: Notify team when main branch CI fails
2. **Deployment Failure Alert**: Critical alert for production deployment issues
3. **Security Vulnerability Alert**: When `npm audit` finds critical/high vulnerabilities

### Dashboard Metrics:
- Average CI run time
- CI success rate (target: >95%)
- Test coverage percentage
- Build failure reasons breakdown

## Troubleshooting

### Common Issues:

**1. Tests pass locally but fail in CI**
- Check Node version mismatch (CI uses Node 20)
- Verify all dependencies are committed (`package-lock.json`)
- Check for environment-specific code

**2. TypeScript errors only in CI**
- Ensure `tsconfig.json` is committed
- Check for absolute import path resolution issues
- Verify all `.d.ts` files are included

**3. Build timeout**
- Increase timeout-minutes in the job
- Check for memory issues with large builds
- Optimize Next.js build configuration

**4. Cached dependencies causing issues**
- Clear cache by updating cache key in workflow
- Manually clear GitHub Actions cache
- Verify `package-lock.json` is consistent

## Continuous Improvement

Regular review and optimization:
- Monthly CI pipeline performance review
- Quarterly dependency updates and security audits
- Adjust timeout and resource allocation based on actual usage
- Evaluate new GitHub Actions features for optimization

---

For questions or updates to these rules, please contact the DevOps team or open an issue.
