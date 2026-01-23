# SplitSync - Expense Sharing Application

A modern expense sharing application built with Next.js 16, TypeScript, Drizzle ORM, and real-time updates via Socket.io.

## Features

- **User Management**: Registration, authentication, and profile management
- **Group Management**: Create groups, add/remove members, and manage roles
- **Expense Tracking**: Add expenses with custom splits, categories, and receipt uploads
- **Real-time Updates**: Live balance updates using Socket.io
- **Settlement Tracking**: Record and manage payments between users
- **Smart Balance Calculation**: Automatic debt simplification for minimum transactions

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: Socket.io
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: JWT with bcrypt password hashing

## Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 14+ (or use Docker Compose)

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd splitsync
npm install
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and update the following variables:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `NEXT_PUBLIC_APP_URL`: Your application URL (default: http://localhost:3000)

### 3. Database Setup

#### Option A: Using Docker Compose (Recommended)

```bash
docker-compose up -d postgres
```

#### Option B: Using Local PostgreSQL

Ensure PostgreSQL is running and create a database:

```sql
CREATE DATABASE splitsync;
```

Update `DATABASE_URL` in your `.env` file with your connection details.

### 4. Run Migrations

```bash
npm run db:generate
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Project Structure

```
.
├── .github/workflows/   # CI/CD workflows
├── app/                 # Next.js App Router pages
├── components/          # React components
├── lib/                 # Utility functions and configurations
├── db/                  # Database schema and queries
└── public/              # Static assets
```

## Database Schema

The application uses the following main tables:

- `users` - User accounts and profiles
- `groups` - Expense sharing groups
- `group_members` - Group membership and roles
- `expenses` - Expense records
- `expense_splits` - How expenses are split among users
- `settlements` - Payment records between users

## Docker Deployment

Build and run with Docker:

```bash
docker-compose up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details
