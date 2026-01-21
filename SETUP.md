# SplitSync - Project Setup Complete

This Next.js 14 project has been initialized with all required dependencies and configurations.

## What's Been Configured

### Core Configuration Files
- ✅ `package.json` - All dependencies (NextAuth v5, Drizzle ORM, Zod, Socket.io, shadcn/ui, Vitest)
- ✅ `tsconfig.json` - TypeScript with strict mode enabled
- ✅ `next.config.js` - Standalone output for Docker optimization
- ✅ `tailwind.config.ts` - Tailwind CSS with shadcn/ui theming
- ✅ `postcss.config.js` - PostCSS configuration
- ✅ `.eslintrc.json` - ESLint with Next.js and TypeScript rules
- ✅ `.gitignore` - Comprehensive ignore patterns

### Testing Configuration
- ✅ `vitest.config.ts` - Vitest testing framework setup
- ✅ `vitest.setup.ts` - Test environment setup with mocks

### Database Configuration
- ✅ `drizzle.config.ts` - Drizzle ORM configuration
- ✅ `src/db/schema.ts` - Complete database schema for the app
- ✅ `src/db/index.ts` - Database connection setup with better-sqlite3

### Application Structure
- ✅ `src/app/` - Next.js App Router structure
- ✅ `src/components/ui/` - shadcn/ui components (Button, Input, Card, Dialog, Toast, Select, Label)
- ✅ `src/lib/utils.ts` - Utility functions including currency formatting
- ✅ `src/lib/validations.ts` - Zod validation schemas
- ✅ `src/types/index.ts` - TypeScript type definitions
- ✅ `src/hooks/use-toast.ts` - Toast notification hook

### Custom Server
- ✅ `server.ts` - Socket.io + Next.js custom server

### Docker Configuration
- ✅ `Dockerfile` - Multi-stage Docker build for production
- ✅ `docker-compose.yml` - Local development with persistent volume

### CI/CD
- ✅ `.github/workflows/ci.yml` - GitHub Actions pipeline (lint, typecheck, test, build)

## Next Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Generate an AUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3. Initialize Database
```bash
npm run db:push
```

### 4. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Run Tests
```bash
npm run test
```

### 6. Build for Production
```bash
npm run build
```

### 7. Run with Docker
```bash
docker-compose up
```

## Database Schema

The following tables are configured in `src/db/schema.ts`:
- **users** - User accounts
- **sessions** - NextAuth sessions
- **accounts** - OAuth provider accounts
- **groups** - Expense sharing groups
- **group_members** - Group membership
- **expenses** - Expense records
- **expense_splits** - Individual expense splits
- **settlements** - Payment settlements

## Key Features Implemented

### Type Safety
- Strict TypeScript configuration
- End-to-end type safety with Drizzle ORM
- Zod validation schemas

### Money Handling
- All amounts stored as integers (cents)
- Utility functions for currency conversion
- Equal split algorithm with penny distribution

### UI Components
- Pre-built shadcn/ui components
- Dark mode support
- Responsive design with Tailwind CSS

### Testing
- Vitest configuration with jsdom
- React Testing Library setup
- Mocks for Next.js router and NextAuth

## Architecture Notes

### Custom Server
The app uses a custom server (`server.ts`) to integrate Socket.io with Next.js. This is required for:
- WebSocket connections for real-time updates
- SQLite with better-sqlite3 (stateful database)
- Deployment on VPS/Railway/Fly.io

### Standalone Output
Next.js is configured with `output: 'standalone'` for optimized Docker builds. This creates a minimal server-only build.

### Database Persistence
SQLite database is persisted in Docker volumes to prevent data loss on container restart.

## Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest tests |
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Drizzle Studio |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: SQLite + better-sqlite3
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Auth**: NextAuth.js v5
- **Real-time**: Socket.io
- **UI**: Tailwind CSS + shadcn/ui
- **Testing**: Vitest + React Testing Library
- **CI/CD**: GitHub Actions

## Production Deployment

### Environment Variables Required
- `AUTH_SECRET` - Generated secret for NextAuth
- `DATABASE_URL` - SQLite database path
- `NEXT_PUBLIC_APP_URL` - Application URL
- `GOOGLE_CLIENT_ID` - (Optional) Google OAuth
- `GOOGLE_CLIENT_SECRET` - (Optional) Google OAuth

### Deployment Options
1. **VPS** - Use Docker Compose
2. **Railway** - Deploy with Dockerfile
3. **Fly.io** - Deploy with Dockerfile

Ensure the database file is persisted on a volume for production deployments.
