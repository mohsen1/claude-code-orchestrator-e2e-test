# SplitSync Development Setup Guide

Complete development environment setup for the SplitSync expense sharing application.

## Prerequisites

- **Node.js 20+** (LTS version recommended)
- **Yarn 1.22+** (package manager)
- **Git** for version control
- **Docker** (optional, for containerized deployment)

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd splitsync
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure:
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
   - `DATABASE_URL`: SQLite path or PostgreSQL connection string

4. **Initialize the database:**
   ```bash
   yarn db:generate
   yarn db:push
   ```

5. **Start the development server:**
   ```bash
   yarn dev
   ```
   Visit http://localhost:3000

## Development Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start Next.js development server |
| `yarn build` | Build for production |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Fix ESLint errors automatically |
| `yarn format` | Format code with Prettier |
| `yarn format:check` | Check code formatting |
| `yarn typecheck` | Run TypeScript type checking |
| `yarn test` | Run Vitest tests in watch mode |
| `yarn test:ci` | Run tests with coverage |
| `yarn test:integration` | Run integration tests |
| `yarn db:generate` | Generate database migrations |
| `yarn db:push` | Push schema changes to database |
| `yarn db:studio` | Open Drizzle Studio |
| `yarn clean` | Remove build artifacts and node_modules |

## Code Quality Tools

### ESLint

ESLint is configured with Next.js and TypeScript rules:

- **Next.js specific rules**: `next/core-web-vitals`
- **TypeScript rules**: Strict type checking
- **Import organization**: Auto-sorted imports
- **React Hooks**: Enforces Rules of Hooks

Configuration: `.eslintrc.json`

### Prettier

Code formatting with Tailwind CSS plugin support:

- **Single quotes**: Enabled
- **Trailing commas**: ES5 compatible
- **Print width**: 100 characters
- **Line endings**: LF (Unix)

Configuration: `.prettierrc`

### Vitest

Testing framework with React Testing Library:

- **Unit tests**: Component and utility testing
- **Integration tests**: API and database testing
- **Coverage**: 80% minimum threshold
- **UI**: Available via `yarn test:ui`

Configuration: `vitest.config.ts`

## TypeScript Configuration

The project uses TypeScript in strict mode with enhanced type checking:

- **Strict mode**: Enabled
- **No unchecked indexed access**: Prevents undefined errors
- **Path aliases**: `@/` for root imports
- **Module resolution**: Bundler mode for Next.js

Configuration: `tsconfig.json`

## Git Workflow

### Pre-commit Hooks

Husky runs lint-staged on pre-commit:
- ESLint auto-fix for JS/TS files
- Prettier formatting for all files

### Branch Protection

Protected branches require:
- Pull request reviews
- Passing CI checks
- No direct commits

### CI/CD Pipeline

GitHub Actions workflow runs on push and PR:
- ✅ Linting (ESLint + Prettier)
- ✅ Type checking (TypeScript)
- ✅ Unit tests (Vitest)
- ✅ Integration tests
- ✅ Build verification
- ✅ Security audit

## Docker Deployment

### Local Development with Docker

```bash
# Build and start containers
docker-compose up --build

# View logs
docker-compose logs -f app

# Stop containers
docker-compose down
```

### Production Build

```bash
# Build Docker image
docker build -t splitsync:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=file:./data/prod.db \
  -e NEXTAUTH_SECRET=your-secret \
  -v $(pwd)/data:/app/data \
  splitsync:latest
```

## Database Management

### SQLite (Default)

- **Location**: `./dev.db` (development), `./data/prod.db` (production)
- **Tool**: Drizzle ORM + better-sqlite3
- **Migrations**: Auto-generated from schema

### PostgreSQL (Optional)

Update `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/splitsync
```

### Drizzle Studio

View and edit database data:
```bash
yarn db:studio
```
Visit http://localhost:4983

## VS Code Setup

The project includes VS Code settings and recommended extensions:

### Extensions

Install these for the best experience:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Vitest
- Error Lens
- GitLens
- REST Client

### Settings

- **Format on save**: Enabled
- **Auto-fix ESLint**: On save
- **TypeScript**: Uses workspace version

Configuration: `.vscode/settings.json`

## Environment Variables

Copy `.env.example` to `.env` and configure:

### Required

- `NEXTAUTH_URL`: Application URL
- `NEXTAUTH_SECRET`: Secret key for NextAuth
- `DATABASE_URL`: Database connection string

### Optional

- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth secret
- `SMTP_*`: Email configuration for invites
- `SENTRY_DSN`: Error tracking

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Locked

```bash
# Remove lock files
rm *.db-shm *.db-wal
```

### TypeScript Errors

```bash
# Rebuild TypeScript
rm -rf node_modules .next
yarn install
yarn typecheck
```

### Tests Failing

```bash
# Run with verbose output
yarn test --reporter=verbose

# Update snapshots
yarn test -u
```

## Performance Optimization

### Build Optimization

- **Turbopack**: Enabled in Next.js 16
- **Image optimization**: AVIF/WebP formats
- **Code splitting**: Automatic route-based splitting
- **Tree shaking**: Unused code elimination

### Development

- **Fast Refresh**: Enabled for components
- **Incremental builds**: Cached between runs
- **Source maps**: Full debugging support

## Security Best Practices

- **No .env in commits**: Already in .gitignore
- **Secret management**: Use environment variables
- **Dependency updates**: Automated via Dependabot
- **Security audits**: Run `yarn audit`

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vitest Documentation](https://vitest.dev)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

## Support

For issues or questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with details

---

**Happy coding! 🚀**
