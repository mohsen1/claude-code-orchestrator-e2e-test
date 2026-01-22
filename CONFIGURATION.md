# Development Tooling Configuration Summary

This document provides an overview of all development tooling configured for the SplitSync project.

## Configuration Files

### Code Quality & Formatting

| File | Purpose |
|------|---------|
| `.eslintrc.json` | ESLint rules for Next.js, TypeScript, and React |
| `.prettierrc` / `.prettierrc.js` | Prettier code formatting rules |
| `.prettierignore` | Files to exclude from Prettier |
| `.editorconfig` | Editor-agnostic configuration |

### Testing

| File | Purpose |
|------|---------|
| `vitest.config.ts` | Vitest configuration for unit tests |
| `vitest.integration.config.ts` | Vitest configuration for integration tests |
| `tests/setup.ts` | Test setup and global mocks |
| `tests/integration-setup.ts` | Integration test database setup |
| `tests/lib/test-utils.tsx` | Testing utility functions and helpers |

### TypeScript

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript compiler configuration |
| `next.config.ts` | Next.js framework configuration |

### Styling

| File | Purpose |
|------|---------|
| `tailwind.config.ts` | Tailwind CSS configuration |
| `postcss.config.mjs` | PostCSS configuration |
| `app/globals.css` | Global styles and CSS variables |

### Build & Deployment

| File | Purpose |
|------|---------|
| `Dockerfile` | Docker container build configuration |
| `docker-compose.yml` | Docker Compose orchestration |
| `.dockerignore` | Files to exclude from Docker image |
| `.nvmrc` | Node.js version specification |

### Git & CI/CD

| File | Purpose |
|------|---------|
| `.gitignore` | Files to exclude from Git |
| `.github/workflows/ci.yml` | GitHub Actions CI/CD pipeline |
| `.github/workflows/dependabot.yml` | Dependabot dependency update configuration |
| `.github/dependabot-automerge.yml` | Dependabot auto-merge rules |
| `.husky/pre-commit` | Pre-commit hooks |
| `.commitlintrc.js` | Commit message linting |

### Environment & Dependencies

| File | Purpose |
|------|---------|
| `package.json` | Project dependencies and scripts |
| `.env.example` | Environment variable template |
| `drizzle.config.ts` | Drizzle ORM configuration |

## Development Scripts

```bash
# Development
yarn dev              # Start development server

# Building
yarn build            # Build for production
yarn start            # Start production server

# Code Quality
yarn lint             # Run ESLint
yarn lint:fix         # Fix ESLint errors
yarn format           # Format code with Prettier
yarn format:check     # Check code formatting
yarn typecheck        # Run TypeScript type checking

# Testing
yarn test             # Run tests in watch mode
yarn test:ci          # Run tests with coverage
yarn test:integration # Run integration tests
yarn test:ui          # Run tests with UI

# Database
yarn db:generate      # Generate database migrations
yarn db:push          # Push schema to database
yarn db:studio        # Open Drizzle Studio
yarn db:seed          # Seed database with test data

# Utilities
yarn clean            # Remove build artifacts
```

## CI/CD Pipeline

The GitHub Actions workflow includes:

1. **Dependency Caching** - Speed up builds with cached node_modules
2. **Lint** - ESLint with Next.js and TypeScript rules
3. **Type Check** - TypeScript compiler with strict mode
4. **Unit Tests** - Vitest with jsdom environment
5. **Integration Tests** - Database and API testing
6. **Build** - Production build verification
7. **Security Audit** - npm audit and Snyk scanning
8. **Docker Build** - Multi-platform image build (on main branch)

All jobs run in parallel where possible, with comprehensive caching for faster execution.

## Code Quality Standards

### ESLint Rules

- **TypeScript strict mode** - No `any` types, explicit returns
- **Import organization** - Auto-sorted with proper grouping
- **React best practices** - Hooks rules, JSX best practices
- **No console.logs** - Warnings for console statements (except error/warn)

### Prettier Rules

- **100 character line width** - Readable but concise
- **Single quotes** - Consistent code style
- **Trailing commas** - ES5 compatible for cleaner diffs
- **LF line endings** - Consistent across platforms

### TypeScript Configuration

- **Strict mode** - Maximum type safety
- **No unchecked indexed access** - Prevent undefined errors
- **Path aliases** - `@/` for clean imports
- **ES2022 target** - Modern JavaScript features

### Testing Requirements

- **80% code coverage** - Minimum threshold for all metrics
- **Jest DOM matchers** - Extended assertions for DOM testing
- **React Testing Library** - User-centric testing approach
- **Test isolation** - Each test runs independently

## Git Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- Feature branches - `feature/feature-name`
- Bugfix branches - `bugfix/bug-name`

### Commit Message Format

Follow Conventional Commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `test` - Tests
- `refactor` - Code refactoring
- `chore` - Maintenance tasks

### Pre-commit Hooks

- Run ESLint with auto-fix
- Run Prettier for formatting
- Prevent commits with failing checks

## IDE Setup

### VS Code Extensions (Recommended)

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Vitest
- Error Lens
- GitLens
- REST Client
- Material Icon Theme

### VS Code Settings

- Format on save: Enabled
- Auto-fix ESLint on save
- TypeScript: Use workspace version
- Files: LF line endings, trim trailing whitespace

## Environment Variables

### Required

```env
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with openssl>
DATABASE_URL=file:./dev.db
```

### Optional (Google OAuth)

```env
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
```

### Optional (Email)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## Performance Optimization

### Build Performance

- **Turbopack** - Next.js 16 bundler for faster builds
- **Module caching** - Cached between builds
- **Parallel processing** - Multi-core compilation
- **Incremental builds** - Only rebuild changed files

### Development Experience

- **Fast Refresh** - Instant component updates
- **Hot reloading** - Automatic browser refresh
- **Source maps** - Full debugging support
- **Error overlay** - In-browser error reporting

### Runtime Performance

- **Image optimization** - AVIF/WebP formats
- **Code splitting** - Route-based chunks
- **Tree shaking** - Remove unused code
- **Font optimization** - Automatic font subsetting

## Security Features

- **No .env in git** - Already in .gitignore
- **Secret management** - Environment variables only
- **Dependency updates** - Automated via Dependabot
- **Security headers** - CSP, XSS protection
- **CSRF protection** - NextAuth.js built-in
- **Rate limiting** - API endpoint protection

## Monitoring & Observability

### Logging

- Structured JSON logging format
- Request/response logging
- Error tracking with stack traces
- Performance metrics

### Health Checks

- `/api/health` endpoint for uptime monitoring
- Database connection checks
- Memory/CPU monitoring
- Response time tracking

## Troubleshooting

### Common Issues

**TypeScript errors after install:**
```bash
rm -rf node_modules .next
yarn install
```

**Tests failing:**
```bash
yarn test --reporter=verbose
yarn test -u  # Update snapshots
```

**Docker build fails:**
```bash
docker system prune -a
docker-compose build --no-cache
```

### Debug Mode

Enable verbose output:
```bash
yarn dev --verbose
yarn test --debug
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vitest Documentation](https://vitest.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)

---

**Last Updated:** January 2026
