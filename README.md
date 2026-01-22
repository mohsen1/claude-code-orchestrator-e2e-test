# SplitSync - Expense Sharing Application

A real-time expense sharing application built with Next.js 16, TypeScript, and Tailwind CSS. SplitSync helps groups track shared expenses, calculate optimal debt settlements, and manage group finances transparently.

## 🚀 Tech Stack

- **Framework**: Next.js 16.1.4 (App Router)
- **Language**: TypeScript 5.9.3 (strict mode)
- **Database**: SQLite (via better-sqlite3 12.6.2)
- **ORM**: Drizzle ORM 0.45.1
- **Validation**: Zod 4.3.5
- **Authentication**: NextAuth.js 4.24.13
- **Real-time**: Socket.io 4.8.3
- **Styling**: Tailwind CSS 4.1.18 + shadcn/ui 0.0.4
- **Forms**: React Hook Form 7.71.1
- **Testing**: Vitest 4.0.17
- **CI/CD**: GitHub Actions
- **Containerization**: Docker

## 📋 Prerequisites

- Node.js 20 LTS or higher
- npm 10 or higher
- Git

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd splitsync
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

4. **Configure your environment**:
   Edit `.env` and fill in the required values:
   ```env
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   DATABASE_URL=file:./data/splitsync.db
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

5. **Run database migrations**:
   ```bash
   npm run db:generate
   npm run db:push
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

7. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors automatically |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run test` | Run tests with Vitest |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run db:generate` | Generate database migrations |
| `npm run db:push` | Push database schema |
| `npm run db:studio` | Open Drizzle Studio |

## 🏗️ Project Structure

```
splitsync/
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI/CD pipeline
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   │   ├── utils.ts        # General utilities
│   │   └── validations.ts  # Zod schemas
│   ├── styles/             # Additional styles
│   ├── tests/              # Test files
│   └── types/              # TypeScript type definitions
│       └── index.ts        # Core types
├── .env.example            # Environment variables template
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Git ignore rules
├── .prettierrc.json        # Prettier configuration
├── components.json         # shadcn/ui configuration
├── docker-compose.yml      # Docker compose configuration
├── Dockerfile              # Docker image configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies and scripts
├── postcss.config.mjs      # PostCSS configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vitest.config.ts        # Vitest configuration
```

## 🐳 Docker Deployment

### Using Docker Compose

1. **Build and start all services**:
   ```bash
   docker-compose up -d
   ```

2. **View logs**:
   ```bash
   docker-compose logs -f app
   ```

3. **Stop services**:
   ```bash
   docker-compose down
   ```

### Development with Docker

To run the development environment with hot reload:

```bash
docker-compose --profile dev up
```

## 🧪 Testing

- **Run all tests**: `npm test`
- **Run tests in watch mode**: `npm run test -- --watch`
- **Run tests with UI**: `npm run test:ui`
- **Generate coverage report**: `npm run test:coverage`

## 📝 Code Quality

- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier with Tailwind CSS plugin
- **Type Checking**: TypeScript strict mode
- **Pre-commit hooks**: Husky with lint-staged

## 🔐 Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `NEXTAUTH_SECRET`: Required for NextAuth.js session encryption
- `DATABASE_URL`: SQLite database file path
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth credentials
- `NEXT_PUBLIC_APP_URL`: Public URL of the application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Drizzle ORM](https://orm.drizzle.team/)

---

Built with ❤️ for SplitSync
