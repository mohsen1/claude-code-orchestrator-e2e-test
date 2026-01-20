# SplitWise - Expense Sharing App

A modern expense-sharing application built with Next.js 14, NextAuth.js, and SQLite.

## Features

- 🔐 Google OAuth authentication via NextAuth.js
- 👥 Create and manage expense groups
- 💰 Add and split expenses equally
- 📊 Real-time balance tracking
- 🎨 Beautiful UI with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth.js v4 with Google OAuth
- **Database**: SQLite with better-sqlite3
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Real-time**: Socket.io

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

You'll need to:

1. **Generate a NEXTAUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```

2. **Set up Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### 3. Initialize Database

The database will be automatically created on first run in `data/expenses.db`.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
expense-sharing-app/
├── src/
│   ├── app/
│   │   ├── api/auth/[...nextauth]/  # NextAuth API routes
│   │   ├── dashboard/               # Protected dashboard page
│   │   ├── login/                   # Login page
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Landing page
│   │   └── globals.css              # Global styles
│   ├── lib/
│   │   ├── auth.ts                  # NextAuth configuration
│   │   └── db.ts                    # Database utilities
│   └── middleware.ts                # Auth middleware
├── public/                          # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Authentication Flow

1. User visits `/login` page
2. Clicks "Sign in with Google"
3. Redirected to Google OAuth consent screen
4. Upon successful auth, user is created in database
5. Session is established and user redirected to `/dashboard`
6. Middleware protects dashboard and other protected routes

## Database Schema

- **User**: Stores user information from Google OAuth
- **Session**: Manages user sessions
- **Account**: Links OAuth accounts to users
- **Group**: Expense groups
- **GroupMember**: Group membership
- **Expense**: Individual expenses with amounts and descriptions

## Production Deployment

### Environment Variables

Ensure you set these in your production environment:

```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DATABASE_URL=./data/expenses.db
```

### Deployment Platforms

This app can be deployed to:
- Vercel (recommended for Next.js)
- Railway
- Render
- Any platform supporting Node.js

Note: For production, consider migrating to PostgreSQL or MySQL instead of SQLite.

## License

MIT
