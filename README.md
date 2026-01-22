# SplitSync - CI/CD Pipeline Configuration

> **Production-Ready CI/CD Pipeline with GitHub Actions, ESLint, and Prettier**

This repository contains a complete, production-ready CI/CD pipeline configuration for the SplitSync expense sharing application.

## 🚀 What's Included

### GitHub Actions CI/CD Pipeline

✅ **Parallel Jobs for Maximum Speed**
- Linting with comprehensive ESLint rules
- Type checking with strict TypeScript configuration
- Unit tests with Vitest (4-way sharding)
- Integration tests with test database
- Build verification and artifact caching
- Security scanning and audit

✅ **Smart Caching**
- node_modules caching
- Next.js build caching
- TypeScript incremental compilation cache
- Vitest cache for faster test runs

✅ **Automated Deployment**
- AWS S3 deployment on main branch
- CloudFront cache invalidation
- Build artifact uploads and downloads

### ESLint Configuration

✅ **Strict Type Safety**
- No `any` types (error)
- Explicit return types required
- Strict null checks
- No floating promises
- Consistent type imports

✅ **React Best Practices**
- React Hooks rules enforcement
- No array index keys
- JSX key validation
- Display name enforcement
- Self-closing components

✅ **Code Quality**
- Unicorn plugin (modern JavaScript patterns)
- SonarJS plugin (bug detection and complexity analysis)
- Import organization and sorting
- No code duplication
- Cognitive complexity limits

✅ **Security Rules**
- SQL injection prevention
- XSS attack detection
- Timing attack prevention
- No eval statements
- CSRF protection checks

✅ **Accessibility**
- JSX A11y plugin
- ARIA prop validation
- Alt text enforcement
- Keyboard event handlers
- Role validation

### Prettier Configuration

✅ **Code Formatting**
- Consistent 2-space indentation
- Single quotes for strings
- Semicolons required
- 100 character line width
- LF line endings

✅ **Import Sorting**
- Automatic import organization
- Groups: React → Next → Third-party → Internal → Types → Relative
- Alphabetical within groups
- Blank lines between import groups

✅ **Plugin Integration**
- Tailwind CSS class sorting
- Import statement ordering
- TypeScript-specific formatting

### Additional Configurations

- **Git**: Comprehensive `.gitignore` for Next.js projects
- **EditorConfig**: Consistent editor settings across team
- **npm**: `.npmrc` with performance optimizations
- **TypeScript**: Strict mode configuration with path aliases
- **Vitest**: Unit and integration test configurations
- **Drizzle ORM**: Database migration and type generation
- **Tailwind CSS**: Utility-first CSS framework setup
- **VS Code**: Recommended extensions and settings

## 📋 Prerequisites

- Node.js 20 LTS or higher
- npm 10 or higher
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd splitsync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Initialize the database**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

## 🏃 Development Commands

```bash
# Start development server
npm run dev

# Run linter
npm run lint
npm run lint:fix        # Auto-fix issues

# Type checking
npm run typecheck

# Format code
npm run format

# Run tests
npm run test            # All tests
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests only
npm run test:watch      # Watch mode

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:generate     # Generate migrations
npm run db:migrate      # Run migrations
npm run db:studio       # Open Drizzle Studio
```

## 🧪 Testing

### Unit Tests

Located in `**/__tests__/**/*.{test,spec}.{ts,tsx}`

Run with:
```bash
npm run test:unit
```

### Integration Tests

Located in `**/integration/**/*.{test,spec}.{ts,tsx}`

Run with:
```bash
npm run test:integration
```

### Coverage

Generate coverage report:
```bash
npm run test:coverage
```

Coverage thresholds:
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## 📦 CI/CD Pipeline

### Pipeline Structure

```
┌─────────────────────────────────────────────────────┐
│                   Push/PR Trigger                    │
└───────────────────┬─────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐      ┌──────────────────────────────────┐
│  Lint Job    │      │        Parallel Jobs              │
│  ─────────── │      │  • Type Check                    │
│  • ESLint    │      │  • Unit Tests (4 shards)         │
│  • Format    │      │  • Integration Tests             │
│  • Report    │      │  • Build Verification            │
└──────┬───────┘      │  • Security Scan                 │
       │              └──────────────┬───────────────────┘
       │                             │
       │              ┌──────────────┴───────────────┐
       │              │                              │
       ▼              ▼                              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐
│ Coverage     │  │ Status Check │  │ Deploy (main only)       │
│ Aggregation  │  │ ──────────── │  │ ──────────────────────── │
│              │  │ Verify all   │  │ • AWS S3 sync            │
│ • Combine    │  │ jobs passed  │  │ • CloudFront invalidate  │
│   reports    │  │ Fail if any  │  │ • Notification           │
│ • Upload to  │  │ job failed   │  │                          │
│   Codecov    │  └──────────────┘  └──────────────────────────┘
└──────────────┘
```

### Required GitHub Secrets

For deployment, configure these secrets in your repository:

- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `S3_BUCKET` - S3 bucket name
- `CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution ID

Optional:
- `SNYK_TOKEN` - Snyk security scanning
- `CODECOV_TOKEN` - Codecov coverage reporting

## 📁 Project Structure

```
.
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions pipeline
├── .vscode/
│   ├── settings.json                 # Editor settings
│   └── extensions.json               # Recommended extensions
├── src/
│   ├── app/                          # Next.js app directory
│   ├── components/                   # React components
│   ├── lib/                          # Utility libraries
│   ├── hooks/                        # Custom React hooks
│   ├── db/                           # Database schema & client
│   │   ├── schema/                   # Drizzle schemas
│   │   └── migrations/               # Database migrations
│   ├── test/                         # Test configuration
│   │   ├── setup.ts                  # Unit test setup
│   │   └── setup-integration.ts      # Integration test setup
│   └── types/                        # TypeScript type definitions
├── scripts/
│   ├── check-coverage.mjs            # Coverage threshold checker
│   └── check-file-size.mjs           # File size validator
├── .eslintrc.json                    # ESLint configuration
├── .prettierrc                       # Prettier configuration
├── .prettierignore                   # Prettier ignore patterns
├── .gitignore                        # Git ignore patterns
├── .editorconfig                     # Editor configuration
├── .npmrc                            # npm configuration
├── tsconfig.json                     # TypeScript configuration
├── vitest.config.ts                  # Vitest unit test config
├── vitest.integration.config.ts      # Vitest integration config
├── drizzle.config.ts                 # Drizzle ORM config
├── drizzle.test.config.ts            # Drizzle test config
├── tailwind.config.ts                # Tailwind CSS config
├── postcss.config.js                 # PostCSS config
├── next.config.js                    # Next.js config
├── package.json                      # Project dependencies
├── lint-staged.config.js             # Pre-commit lint config
└── .env.example                      # Environment variables template
```

## 🔧 Configuration Files

### ESLint (.eslintrc.json)

Comprehensive linting rules including:
- TypeScript strict mode
- React and React Hooks
- Import organization
- Unicorn best practices
- SonarJS code quality
- Security vulnerability detection
- JSX A11y accessibility

### Prettier (.prettierrc)

Code formatting rules:
- 2-space indentation
- Single quotes
- Trailing commas
- Import sorting
- Tailwind class sorting

### TypeScript (tsconfig.json)

Strict type checking:
- Strict mode enabled
- Path aliases configured
- No implicit any
- Unused locals/parameters as errors
- Indexed access checks

### Vitest (vitest.config.ts)

Testing configuration:
- jsdom environment for unit tests
- Coverage reporting
- Test sharding for parallel execution
- Path aliases configured

## 🎯 Code Quality Standards

### TypeScript Standards

- ✅ All functions must have explicit return types
- ✅ No `any` types allowed
- ✅ Strict null checking enabled
- ✅ Unused variables are errors
- ✅ All imports must be typed

### React Standards

- ✅ Functional components with hooks
- ✅ PropTypes replaced with TypeScript
- ✅ All hooks follow rules of hooks
- ✅ No array index keys
- ✅ Accessible by default

### Testing Standards

- ✅ 80% coverage minimum
- ✅ Unit tests for all business logic
- ✅ Integration tests for API endpoints
- ✅ E2E tests for critical user flows
- ✅ All tests must pass before merge

## 🐛 Troubleshooting

### Lint Errors

```bash
# Auto-fix most issues
npm run lint:fix

# Check for remaining errors
npm run lint
```

### Type Errors

```bash
# Run type checker
npm run typecheck

# Check specific file
npx tsc --noEmit path/to/file.ts
```

### Test Failures

```bash
# Run tests locally
npm run test

# Run specific test file
npm run test path/to/test.test.ts

# Run with debug output
DEBUG=vitest:* npm run test
```

### Build Errors

```bash
# Clean build artifacts
npm run clean

# Rebuild
npm run build
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [ESLint Documentation](https://eslint.org/docs/latest)
- [Vitest Documentation](https://vitest.dev)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

All commits must pass:
- ✅ ESLint checks
- ✅ TypeScript type checking
- ✅ Unit tests
- ✅ Integration tests
- ✅ Build verification

---

**Built with ❤️ for SplitSync - Real-time Expense Sharing**
