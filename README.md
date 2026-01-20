# SplitSync - Expense Sharing Application

A production-ready expense sharing application built with Next.js 14, TypeScript, SQLite, and Socket.io for real-time updates.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Database:** SQLite with better-sqlite3
- **ORM:** Drizzle ORM
- **Validation:** Zod
- **Authentication:** NextAuth.js v5
- **Real-time:** Socket.io
- **UI:** Tailwind CSS + shadcn/ui
- **Forms:** React Hook Form
- **Testing:** Vitest

## 📋 Prerequisites

- Node.js 20 or higher
- npm or yarn
- Git

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd splitsync
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Generate an `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

Update `.env` with your generated secret and OAuth credentials.

### 4. Database Setup

Initialize the SQLite database:

```bash
npm run db:generate
npm run db:push
```

### 5. Development Server

Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run Vitest tests
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push database schema
- `npm run db:studio` - Open Drizzle Studio

## 🐳 Docker Deployment

### Build the Image

```bash
docker build -t splitsync .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

The database will be persisted in a Docker volume at `./sqlite_data`.

### Manual Container Run

```bash
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/sqlite_data:/app/db \
  -e DATABASE_URL="file:/app/db/splitsync.sqlite" \
  -e AUTH_SECRET="your-secret" \
  --name splitsync \
  splitsync
```

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `DATABASE_URL` | SQLite database path | Yes |
| `AUTH_SECRET` | NextAuth secret key | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Yes |

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

## 📝 Project Structure

```
splitsync/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── db/              # Database schema and migrations
│   ├── lib/             # Utility functions
│   └── styles/          # Global styles
├── public/              # Static assets
├── .eslintrc.json      # ESLint configuration
├── .env.example        # Environment variables template
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose setup
└── package.json        # Dependencies and scripts
```

## 🔐 Security Notes

- Never commit `.env` files
- Use strong, unique `AUTH_SECRET` in production
- Enable HTTPS in production
- Regularly update dependencies
- Review OAuth scopes carefully

## 🚢 Production Deployment

### Railway

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy automatically on push to main

### Fly.io

```bash
fly launch
fly deploy
```

### VPS

```bash
docker-compose up -d
```

Configure nginx as reverse proxy for HTTPS.

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [NextAuth.js](https://authjs.dev/)
- [Socket.io](https://socket.io/docs/)

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## ✅ Setup Verification

To verify your setup is correct:

```bash
# Check environment
npm run type-check

# Run linter
npm run lint

# Run tests
npm run test

# Build project
npm run build
```

If all commands pass successfully, your environment is ready for development!
