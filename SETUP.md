# Setup Instructions

## Environment Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

3. **Configure Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new OAuth 2.0 client ID
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Copy Client ID and Client Secret to `.env.local`

4. **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```
   Copy the output to `NEXTAUTH_SECRET` in `.env.local`

5. **Run development server:**
   ```bash
   npm run dev
   ```

## Database

The SQLite database will be automatically created at `./data/expenses.db` when you first run the app.

## Features Implemented

- ✅ better-sqlite3 database with complete schema
- ✅ NextAuth.js with Google OAuth
- ✅ Database adapter for session management
- ✅ User authentication and session handling
- ✅ Database helpers for CRUD operations
- ✅ Support for groups, expenses, and balances
