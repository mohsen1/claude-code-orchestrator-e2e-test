# Authentication Setup

This project is configured with NextAuth.js v5 for authentication.

## Features

- **Google OAuth**: Sign in with Google account
- **Email/Password**: Traditional credentials-based authentication
- **Protected Routes**: Middleware to protect authenticated pages
- **TypeScript**: Full type safety with custom NextAuth types

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your values:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env`

### 4. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## File Structure

```
src/
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── auth-helpers.ts      # Password utilities
│   ├── client-utils.ts      # React hooks for auth
│   └── prisma.ts            # Prisma client
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/route.ts  # NextAuth API route
│   │       └── register/route.ts       # Registration endpoint
│   ├── login/page.tsx       # Login page
│   ├── register/page.tsx    # Registration page
│   └── dashboard/page.tsx   # Protected dashboard
├── components/
│   └── providers/
│       └── session-provider.tsx  # Session provider wrapper
├── middleware.ts            # Route protection
└── types/
    └── next-auth.d.ts       # TypeScript definitions
```

## Protected Routes

The middleware automatically protects these routes:
- `/dashboard/*`
- `/groups/*`
- `/api/protected/*`

## Usage Examples

### Server-Side (App Router)

```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function Page() {
  const session = await getServerSession(authOptions)

  if (!session) {
    // Handle unauthenticated
  }

  // Use session.user
}
```

### Client-Side

```typescript
"use client"

import { useSession } from "next-auth/react"

export function Component() {
  const { data: session } = useSession()

  // Use session?.user
}
```

### Custom Hook

```typescript
import { useAuth } from "@/lib/client-utils"

export function Component() {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Redirecting...</div>

  // Use user
}
```

## API Endpoints

- `POST /api/auth/register` - Register new user with email/password
- `POST /api/auth/signin` - Sign in (handled by NextAuth)
- `POST /api/auth/signout` - Sign out (handled by NextAuth)

## Database Schema

The Prisma schema includes:
- `User` - User accounts
- `Account` - OAuth provider accounts
- `Session` - User sessions
- `Group` - Expense groups
- `GroupMember` - Group memberships
- `Expense` - Shared expenses
- `ExpenseSplit` - How expenses are split
- `Settlement` - Debt settlements
