# SplitSync

Real-time expense sharing application built with Next.js 16, TypeScript, and SQLite.

## Features

- **Real-time Expense Tracking**: Track shared expenses with live updates
- **Smart Settlement Calculator**: Automatically calculate optimal debt settlements
- **Group Management**: Create and manage expense sharing groups
- **Secure Authentication**: OAuth and credential-based authentication via NextAuth.js
- **Type-Safe**: Full TypeScript coverage with Zod validation
- **Responsive Design**: Mobile-first UI built with Tailwind CSS and shadcn/ui

## Tech Stack

### Core Framework
- **Node.js 20 LTS** - Runtime environment
- **Next.js 16.1.4** - React framework with App Router
- **TypeScript 5.9.3** - Type safety (strict mode)

### Data Layer
- **SQLite** - Embedded database via better-sqlite3 12.6.2
- **Drizzle ORM 0.45.1** - Type-safe database operations
- **Zod 4.3.5** - Runtime schema validation

### Authentication & Real-time
- **NextAuth.js 4.24.13** - Authentication
- **Socket.io 4.8.3** - Real-time bidirectional communication

### User Interface
- **Tailwind CSS 4.1.18** - Utility-first styling
- **shadcn/ui 0.0.4** - Component library
- **React Hook Form 7.71.1** - Form state management

### Testing & CI/CD
- **Vitest 4.0.17** - Unit and integration testing
- **GitHub Actions** - Continuous integration and deployment
- **Docker** - Containerized deployment

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20 LTS** or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or [pnpm](https://pnpm.io/) or [Yarn](https://yarnpkg.com/)
- **Git** ([Download](https://git-scm.com/))
- **Docker** (optional, for containerized deployment) ([Download](https://www.docker.com/))

Verify your installations:

```bash
node --version  # Should be v20.x.x
npm --version   # Should be 10.x.x or higher
git --version
docker --version  # Optional
```

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/splitsync.git
cd splitsync
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your environment variables:

```bash
cp .env.example .env
```

Edit `.env` and configure the following required variables:

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_SECRET="your-super-secret-key-change-this"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

#### Generate NEXTAUTH_SECRET

Generate a secure secret:

```bash
openssl rand -base64 32
# Or
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Database Setup

Generate database schema:

```bash
npm run db:generate
```

Apply migrations:

```bash
npm run db:migrate
```

Seed the database (optional):

```bash
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
splitsync/
├── .github/
│   └── workflows/           # GitHub Actions CI/CD workflows
│       ├── ci.yml           # Main CI pipeline
│       ├── lint.yml         # Linting checks
│       ├── typecheck.yml    # TypeScript type checking
│       ├── test.yml         # Testing pipeline
│       └── build.yml        # Build verification
├── .vscode/
│   ├── settings.json        # VS Code workspace settings
│   └── extensions.json      # Recommended extensions
├── app/                     # Next.js App Router
│   ├── api/                 # API routes
│   ├── dashboard/           # Dashboard pages
│   ├── auth/                # Authentication pages
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   └── features/            # Feature-specific components
├── lib/                     # Utility libraries
│   ├── db/                  # Database utilities
│   ├── auth/                # Authentication utilities
│   └── utils.ts             # General utilities
├── tests/                   # Test files
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                 # End-to-end tests
├── public/                  # Static assets
├── drizzle.config.ts        # Drizzle ORM configuration
├── vitest.config.ts         # Vitest configuration
├── next.config.ts           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Project dependencies
└── README.md                # This file
```

## Available Scripts

### Development

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run typecheck        # Run TypeScript type checking
```

### Database

```bash
npm run db:generate      # Generate database schema
npm run db:migrate       # Apply database migrations
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle Studio
npm run db:seed          # Seed database with sample data
```

### Testing

```bash
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:ui          # Run tests with UI
npm run test:integration # Run integration tests
npm run test:e2e         # Run end-to-end tests
```

### Docker

```bash
docker-compose up        # Start all services
docker-compose down      # Stop all services
docker-compose build     # Build Docker images
```

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment.

### Workflows

1. **CI Pipeline** (`.github/workflows/ci.yml`)
   - Runs on every push and pull request
   - Parallel execution of lint, typecheck, test, and build jobs
   - Coverage reporting and artifact uploads

2. **Lint Workflow** (`.github/workflows/lint.yml`)
   - ESLint with strict rules
   - Code formatting checks
   - Complexity analysis
   - Stylelint for CSS/SCSS

3. **Type Check Workflow** (`.github/workflows/typecheck.yml`)
   - TypeScript compilation
   - Strict mode verification
   - API type validation
   - Zod schema checks

4. **Test Workflow** (`.github/workflows/test.yml`)
   - Unit tests with sharding
   - Integration tests
   - End-to-end tests with Playwright
   - Coverage reporting

5. **Build Workflow** (`.github/workflows/build.yml`)
   - Next.js build verification
   - Docker image build
   - Security scanning with Trivy
   - Production readiness checks

### Caching

The workflows use caching for:
- `node_modules` via `actions/setup-node`
- Build artifacts via `actions/cache`
- Vitest cache for faster test runs
- Docker layers for faster image builds

## Environment Variables

See `.env.example` for all available environment variables.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./dev.db` |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | `random-32-char-string` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `your-client-id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | `your-secret-key` |
| `NODE_ENV` | Environment | `development` / `production` |
| `LOG_LEVEL` | Logging level | `info` / `debug` / `error` |

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes and Test

```bash
# Run tests
npm run test

# Run linting
npm run lint

# Type check
npm run typecheck

# Format code
npm run format
```

### 3. Commit Changes

```bash
git add .
git commit -m "feat: add user profile page"
```

### 4. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Create a pull request on GitHub. The CI pipeline will automatically run.

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks
- `perf:` Performance improvements

## Testing Strategy

### Unit Tests

Located in `tests/unit/`, these test individual functions and components in isolation.

```bash
npm run test
```

### Integration Tests

Located in `tests/integration/`, these test interactions between modules.

```bash
npm run test:integration
```

### End-to-End Tests

Located in `tests/e2e/`, these test complete user flows using Playwright.

```bash
npm run test:e2e
```

### Coverage Goals

- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

## Deployment

### Docker Deployment

Build and run with Docker:

```bash
# Build image
docker build -t splitsync:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=file:./prod.db \
  -e NEXTAUTH_SECRET=your-secret \
  splitsync:latest
```

### Docker Compose

```bash
docker-compose up -d
```

### Production Build

```bash
npm run build
npm run start
```

### Environment Checklist

Before deploying to production:

- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Configure production `DATABASE_URL`
- [ ] Set up SSL/TLS certificates
- [ ] Configure CORS settings
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Review security headers

## Troubleshooting

### Common Issues

#### Port 3000 Already in Use

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use a different port
PORT=3001 npm run dev
```

#### Database Connection Error

Ensure the database file exists and has correct permissions:

```bash
ls -la *.db
chmod 644 dev.db
```

#### Type Errors After Installation

Try regenerating database types:

```bash
npm run db:generate
npm run typecheck
```

#### Tests Failing in CI but Not Locally

Ensure all environment variables are set in `.env.example` and CI secrets.

### Getting Help

- Check existing [GitHub Issues](https://github.com/your-username/splitsync/issues)
- Create a new issue with detailed information
- Include error messages, stack traces, and reproduction steps

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add/update tests
5. Ensure all tests pass
6. Submit a pull request

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Format code with Prettier
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Drizzle ORM](https://orm.drizzle.team/) - The database toolkit
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Vitest](https://vitest.dev/) - Testing framework

## Support

For support, email support@splitsync.example.com or open an issue on GitHub.

---

**Built with ❤️ using Next.js and TypeScript**
