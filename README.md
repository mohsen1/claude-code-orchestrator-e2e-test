# SplitSync

A modern, real-time expense sharing application built with Next.js 16, TypeScript, and SQLite.

## 🚀 Features

- **Real-time expense tracking** with Socket.io
- **Smart settlement calculations** to minimize transactions
- **Group management** with secure invite links
- **OAuth authentication** via Google and email/password
- **Type-safe** with TypeScript throughout
- **Modern UI** with Tailwind CSS and shadcn/ui
- **Full testing** with Vitest
- **CI/CD pipeline** with GitHub Actions

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.4 (App Router)
- **Language**: TypeScript 5.9.3 (strict mode)
- **Database**: SQLite with better-sqlite3 12.6.2
- **ORM**: Drizzle ORM 0.45.1
- **Validation**: Zod 4.3.5
- **Auth**: NextAuth.js 4.24.13
- **Real-time**: Socket.io 4.8.3
- **Styling**: Tailwind CSS 4.1.18 + shadcn/ui 0.0.4
- **Forms**: React Hook Form 7.71.1
- **Testing**: Vitest 4.0.17
- **CI/CD**: GitHub Actions
- **Containerization**: Docker

## 📋 Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Git

## 🏃 Local Development Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd splitsync
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and configure the following required variables:

```env
# Generate a secure secret with:
# openssl rand -base64 32
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=file:./data/splitsync.db
```

### 4. Initialize the database

```bash
# Create database directory
mkdir -p data

# Generate and run migrations
npm run db:generate
npm run db:push
```

### 5. Start the development server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🧪 Testing

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## 🎨 Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Run TypeScript type checking
npm run typecheck

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check
```

## 🐳 Docker Development

### Build and run with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Build Docker image only

```bash
docker build -t splitsync:latest .
docker run -p 3000:3000 --env-file .env splitsync:latest
```

## 📁 Project Structure

```
splitsync/
├── .github/
│   └── workflows/
│       └── ci.yml          # CI/CD pipeline
├── src/
│   ├── app/                # Next.js App Router
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   └── ...            # Feature components
│   ├── lib/               # Utility libraries
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── db/                # Database schema and queries
│   ├── config/            # Configuration files
│   ├── utils/             # Helper functions
│   └── styles/            # Global styles
├── public/                # Static assets
├── .env.example           # Environment variable template
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## 🔐 Environment Variables

See `.env.example` for all available environment variables.

Key variables:

- `NEXTAUTH_SECRET`: Required. Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Required. URL of your application
- `DATABASE_URL`: Required. SQLite database path
- `GOOGLE_CLIENT_ID`: Optional. For Google OAuth
- `GOOGLE_CLIENT_SECRET`: Optional. For Google OAuth

## 🚢 Deployment

### Build for production

```bash
npm run build
```

### Start production server

```bash
npm start
```

### Deploy with Docker

```bash
docker-compose -f docker-compose.yml up -d
```

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks
- `npm run test` - Run tests
- `npm run format` - Format code
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

## 🧩 Development Tools

### VS Code Extensions

Recommended extensions are listed in `.vscode/extensions.json`:

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Drizzle ORM

### Pre-commit Hooks

Install Husky for pre-commit hooks (optional):

```bash
npm install -D husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

Add to `package.json`:

```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

## 🐛 Troubleshooting

### Database issues

```bash
# Reset database
rm -rf data/*.db*
npm run db:push
```

### Build issues

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Dependency issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

All changes must pass CI checks before merging.

## 📞 Support

For issues or questions, please open an issue in the repository.
