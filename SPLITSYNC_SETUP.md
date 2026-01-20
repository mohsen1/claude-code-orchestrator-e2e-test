# SplitSync - Expense Sharing Application

A production-ready expense sharing application built with Next.js 14, TypeScript, SQLite, and Socket.io.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Database:** SQLite + Drizzle ORM
- **Real-time:** Socket.io
- **Styling:** Tailwind CSS + shadcn/ui
- **Validation:** Zod
- **Testing:** Vitest + Testing Library
- **Authentication:** NextAuth.js v5
- **Deployment:** Docker + Docker Compose

## 📋 Prerequisites

- Node.js 20+
- npm 10+
- Docker (for containerized deployment)

## 🛠️ Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd splitsync
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. **Generate authentication secret:**
```bash
openssl rand -base64 32
```

5. **Run database migrations:**
```bash
npm run db:push
```

## 🚦 Available Scripts

### Development
```bash
npm run dev          # Start development server with custom Socket.io server
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint
npm run test         # Run Vitest tests
npm run test:ui      # Run tests with UI
```

### Database
```bash
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio
```

### Build & Production
```bash
npm run build        # Build Next.js application
npm start            # Start production server
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

1. **Build and start the container:**
```bash
docker-compose up -d
```

2. **View logs:**
```bash
docker-compose logs -f
```

3. **Stop the container:**
```bash
docker-compose down
```

### Using Docker Directly

1. **Build the image:**
```bash
docker build -t splitsync .
```

2. **Run the container:**
```bash
docker run -p 3000:3000 \
  -v $(pwd)/sqlite_data:/app/db \
  -e DATABASE_URL=file:/app/db/splitsync.sqlite \
  -e AUTH_SECRET=your-secret \
  splitsync
```

## 📁 Project Structure

```
splitsync/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── api/                   # API routes
│   └── health/            # Health check endpoint
├── src/
│   ├── db/                # Database configuration and schema
│   │   ├── index.ts       # Drizzle instance
│   │   └── schema.ts      # Database models
│   ├── lib/               # Utility functions
│   │   └── utils.ts       # Helper functions
│   └── components/        # React components
│       └── ui/            # shadcn/ui components
├── .github/               # GitHub Actions
│   └── workflows/
│       └── ci.yml         # CI/CD pipeline
├── server.ts              # Custom Next.js server with Socket.io
├── middleware.ts          # Next.js middleware for auth
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── vitest.config.ts       # Vitest configuration
├── tsconfig.json          # TypeScript configuration
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
└── drizzle.config.ts      # Drizzle ORM configuration
```

## 🔒 TypeScript Strict Mode

This project uses TypeScript strict mode with enhanced type checking. All code must pass:
- No `any` types allowed
- Strict null checks
- No unused variables
- Implicit returns checked

Run type checking:
```bash
npm run typecheck
```

## 🧪 Testing

Run the test suite:
```bash
npm run test
```

Run tests in watch mode:
```bash
npm run test -- --watch
```

Generate coverage report:
```bash
npm run test -- --coverage
```

## 🔐 Authentication

This app uses NextAuth.js v5 for authentication. To set up OAuth:

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new OAuth 2.0 client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy `Client ID` and `Client Secret` to your `.env` file

## 💾 Database Schema

The app uses the following main tables:
- **users** - User accounts
- **groups** - Expense groups
- **group_members** - Group membership
- **expenses** - Expense records
- **expense_splits** - How expenses are split
- **settlements** - Payment settlements

All monetary values are stored as integers (cents) to avoid floating-point errors.

## 🚀 CI/CD Pipeline

The project includes a GitHub Actions workflow that runs on every push and pull request:
- ESLint checking
- TypeScript type checking
- Unit tests with coverage
- Build verification
- Docker build test

## 📝 License

This project is proprietary and confidential.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 🐛 Troubleshooting

### Database locked error
If you see "database is locked", ensure only one process is accessing the database at a time.

### Port already in use
Change the port in `.env`:
```env
PORT=3001
```

### Socket.io connection issues
Ensure the custom server is running, not the standard Next.js dev server.
