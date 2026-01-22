# SplitSync

A real-time expense sharing application that allows groups to track shared expenses, calculate optimal debt settlements, and manage group finances transparently.

## 🚀 Tech Stack

- **Node.js 20 LTS** - Runtime environment
- **Next.js 16.1.4** - React framework with App Router
- **TypeScript 5.9.3** - Type-safe development
- **SQLite + Drizzle ORM** - Database layer
- **NextAuth.js 4.24.13** - Authentication
- **Socket.io 4.8.3** - Real-time communication
- **Tailwind CSS 4.1.18 + shadcn/ui** - UI components
- **Vitest 4.0.17** - Unit & integration tests
- **Playwright 1.50.0** - E2E testing
- **Docker** - Containerization

## 📋 Prerequisites

- Node.js 20 LTS or higher
- npm 10+ or yarn/pnpm
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
   ```

   Edit `.env.local` and configure the required variables:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-here-generate-with-openssl-rand-base64-32"

   # OAuth Providers (Optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Initialize the database**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐳 Docker Setup

### Using Docker Compose (Recommended)

1. **Build and start containers**
   ```bash
   docker-compose up --build
   ```

2. **Run database migrations**
   ```bash
   docker-compose exec app npm run db:migrate
   ```

3. **Access the application**
   - Application: http://localhost:3000
   - Database file is persisted in Docker volume

### Using Docker directly

1. **Build the image**
   ```bash
   docker build -t splitsync .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="file:./data/prod.db" \
     -e NEXTAUTH_SECRET="your-secret" \
     -e NEXTAUTH_URL="http://localhost:3000" \
     splitsync
   ```

## 📝 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking

### Database
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:push` - Push schema changes to database

### Testing
- `npm run test` - Run Vitest unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:all` - Run all tests (unit + E2E)

## 🏗️ Project Structure

```
splitsync/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline
├── app/                        # Next.js App Router
│   ├── api/                    # API routes
│   ├── auth/                   # Authentication pages
│   ├── dashboard/              # Main application pages
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # shadcn/ui components
│   └── ...                     # Feature components
├── lib/
│   ├── db/                     # Database layer
│   │   ├── schema.ts           # Drizzle schema
│   │   └── index.ts            # Database client
│   ├── auth/                   # Authentication utilities
│   └── utils.ts                # Helper functions
├── hooks/                      # React hooks
├── types/                      # TypeScript type definitions
├── tests/                      # Test files
│   ├── unit/                   # Vitest unit tests
│   └── e2e/                    # Playwright E2E tests
├── prisma/drizzle/             # Drizzle migrations
├── public/                     # Static assets
├── .eslintrc.js                # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── tsconfig.json               # TypeScript configuration
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── vitest.config.ts            # Vitest configuration
├── playwright.config.ts        # Playwright configuration
├── drizzle.config.ts           # Drizzle configuration
└── docker-compose.yml          # Docker Compose setup
```

## 🔐 Environment Variables

See `.env.example` for all available environment variables.

### Required Variables
- `DATABASE_URL` - SQLite database path
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Secret for NextAuth.js session encryption

### Optional Variables
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `NODE_ENV` - Environment (development/production)

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

## 📦 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Docker Production
```bash
docker-compose -f docker-compose.yml up -d
```

### Environment Setup for Production
1. Set `NODE_ENV=production`
2. Configure production database URL
3. Set strong `NEXTAUTH_SECRET`
4. Configure OAuth providers
5. Set up proper backup strategy for database

## 🔒 Security Considerations

- All monetary values are stored as integers (cents)
- Database file should be encrypted at rest
- TLS/SSL enabled for all connections
- Session tokens are securely managed
- Rate limiting on authentication endpoints
- Input validation on all API endpoints

## 📊 Monitoring & Observability

- Health check endpoint: `/api/health`
- Structured JSON logging with correlation IDs
- Error tracking with stack traces
- Request metrics and performance monitoring

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

### Code Style
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Database Issues
```bash
# Reset database
rm -f data/*.db
npm run db:migrate
npm run db:seed
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Socket.io Documentation](https://socket.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## 🎯 Roadmap

### Phase 1: Foundation (Current)
- ✅ Project setup and configuration
- ✅ CI/CD pipeline
- 🔄 Database schema design
- 🔄 Authentication system

### Phase 2: Core Features
- ⏳ Group management
- ⏳ Expense tracking
- ⏳ Settlement calculation
- ⏳ Real-time synchronization

### Phase 3: Advanced Features
- ⏳ Receipt attachments
- ⏳ Expense categories
- ⏳ Advanced reporting
- ⏳ Mobile apps

---

Built with ❤️ using Next.js and modern web technologies.
