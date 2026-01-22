# SplitSync

Real-time expense sharing application for tracking shared expenses, calculating optimal debt settlements, and managing group finances transparently.

## 🚀 Tech Stack

- **Framework:** Node.js 20 LTS + Next.js 16.1.4 (App Router)
- **Language:** TypeScript 5.9.3 (strict mode)
- **Database:** SQLite (better-sqlite3 12.6.2)
- **ORM:** Drizzle ORM 0.45.1
- **Validation:** Zod 4.3.5
- **Authentication:** NextAuth.js 4.24.13
- **Real-time:** Socket.io 4.8.3
- **UI:** Tailwind CSS 4.1.18 + shadcn/ui 0.0.4
- **Forms:** React Hook Form 7.71.1
- **Testing:** Vitest 4.0.17
- **CI/CD:** GitHub Actions
- **Container:** Docker (multi-stage build)

## 📋 Features

### Core Functionality
- **Group Management** - Create expense sharing groups with secure invite links
- **Expense Tracking** - Record expenses with equal split calculations across members
- **Settlement Engine** - Optimal debt settlement path computation
- **Real-time Sync** - Live updates across all group members via Socket.io
- **Authentication** - Google OAuth and email/password credentials

### Data Integrity
- All monetary values stored as integers (cents) - no floating-point arithmetic
- Zod schema validation on all inputs
- Type-safe database operations via Drizzle ORM
- Transaction atomicity for all financial operations

### Security
- TLS 1.3 for data in transit
- Database encryption at rest
- Secure password hashing (bcrypt)
- Session timeout and CSRF protection
- Rate limiting on authentication endpoints

## 🏗️ Project Structure

```
splitsync/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Authentication routes
│   ├── (dashboard)/         # Protected dashboard routes
│   ├── api/                 # API routes
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── auth/                # Authentication components
│   └── expenses/            # Expense-related components
├── lib/                     # Core application logic
│   ├── db/                  # Database configuration & queries
│   ├── auth/                # Authentication configuration
│   ├── utils/               # Utility functions
│   └── validators/          # Zod schemas
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript type definitions
└── tests/                   # Unit and integration tests
```

## 🚦 Quick Start

### Prerequisites

- Node.js 20 LTS or higher
- npm, yarn, or pnpm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/splitsync.git
   cd splitsync
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and set the following required variables:
   ```env
   # Generate with: openssl rand -base64 32
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"

   # Get from Google Cloud Console
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐳 Docker Deployment

### Local Development with Docker

1. **Build and start containers**
   ```bash
   docker-compose up --build
   ```

2. **Access the application**
   - App: http://localhost:3000
   - Database: Available via Docker volume

3. **Stop containers**
   ```bash
   docker-compose down
   ```

### Production Docker Deployment

1. **Build the production image**
   ```bash
   docker build -t splitsync:latest .
   ```

2. **Run the container**
   ```bash
   docker run -d \
     --name splitsync \
     -p 3000:3000 \
     -v $(pwd)/data:/app/data \
     -v $(pwd)/uploads:/app/public/uploads \
     --env-file .env.production \
     splitsync:latest
   ```

3. **View logs**
   ```bash
   docker logs -f splitsync
   ```

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript compiler |
| `npm run test` | Run Vitest tests |
| `npm run test:ui` | Run Vitest with UI |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run db:push` | Push database schema |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:migrate` | Run database migrations |
| `npm run format` | Format code with Prettier |

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## 📊 CI/CD Pipeline

The project uses GitHub Actions for continuous integration:

- **Lint** - ESLint with strict rules
- **Type Check** - TypeScript compilation
- **Test** - Vitest unit and integration tests
- **Build** - Production build verification

All checks must pass before merging pull requests.

## 🔒 Environment Variables

See `.env.example` for all available configuration options.

**Required for production:**
- `NEXTAUTH_SECRET` - Cryptographic secret for NextAuth
- `NEXTAUTH_URL` - Canonical URL of your application
- `DATABASE_URL` - SQLite database path
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

## 🗄️ Database Management

### Drizzle ORM

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio

# Push schema changes (development only)
npm run db:push
```

### Backups

Automated daily backups are configured via cron. Manual backup:

```bash
# Backup database
cp data/splitsync.db backups/splitsync-$(date +%Y%m%d).db
```

## 🔧 Development Tools

### Recommended VS Code Extensions

- **TypeScript** - Microsoft TypeScript support
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - CSS autocomplete
- **Drizzle ORM** - Database helpers

### Code Style

- **TypeScript:** Strict mode enabled
- **Linting:** ESLint with Next.js config
- **Formatting:** Prettier with consistent rules
- **Import Sort:** Organized by type and path

## 🚨 Security Best Practices

1. **Never commit** `.env.local` or environment files with secrets
2. **Use strong secrets** - Generate with `openssl rand -base64 32`
3. **Keep dependencies updated** - Run `npm audit` regularly
4. **Enable HTTPS** in production with valid TLS certificates
5. **Review logs** for suspicious activity
6. **Backup regularly** and test restoration procedures

## 📈 Performance Targets

- API response time: p95 < 200ms
- Settlement calculation: < 500ms (50 members)
- Real-time event latency: < 100ms
- Build time: < 60 seconds
- Test suite: < 30 seconds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Branch Protection:**
- All commits must pass CI checks
- At least one approval required
- No direct commits to main branch

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/splitsync/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/splitsync/discussions)
- **Email:** support@splitsync.app

## 🗺️ Roadmap

### Phase 1: Foundation (Current)
- ✅ Repository setup
- ✅ CI/CD pipeline
- ✅ Docker configuration
- 🔨 Core authentication
- 🔨 Database schema

### Phase 2: Core Features
- ⏳ Group management
- ⏳ Expense tracking
- ⏳ Settlement calculation
- ⏳ Real-time synchronization

### Phase 3: Enhanced Features
- ⏳ Receipt uploads
- ⏳ Advanced settlement options
- ⏳ Expense categories
- ⏳ Analytics dashboard

### Phase 4: Production Ready
- ⏳ Performance optimization
- ⏳ Security hardening
- ⏳ Monitoring & alerting
- ⏳ Documentation completion

---

**Built with ❤️ for hassle-free expense sharing**
