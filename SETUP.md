# Authentication Setup Guide

## Overview
This application now has NextAuth.js authentication configured with:
- Google OAuth provider
- Email/password credentials provider
- Prisma ORM with SQLite database
- TypeScript support

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Update the following values:
- `NEXTAUTH_SECRET`: Generate a secure secret (run: `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID`: Get from Google Cloud Console
- `GOOGLE_CLIENT_SECRET`: Get from Google Cloud Console

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth client ID
5. Authorized JavaScript origins: `http://localhost:3000`
6. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env.local`

### 4. Initialize Database
```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```

## File Structure

### Core Authentication Files
- `src/lib/auth.ts` - NextAuth configuration with providers
- `src/lib/google-oauth.ts` - Google OAuth helper functions
- `src/lib/password.ts` - Password hashing utilities
- `src/lib/prisma.ts` - Prisma client singleton

### API Routes
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth API handler
- `src/app/api/auth/register/route.ts` - User registration endpoint

### Types
- `src/types/next-auth.d.ts` - TypeScript declarations for NextAuth

### Components & Hooks
- `src/components/providers/session-provider.tsx` - Session provider for client
- `src/hooks/use-current-user.ts` - Hook for accessing current user

### Database Schema
- `prisma/schema.prisma` - Database schema with User, Account, Session models

## Usage Examples

### Server-Side Authentication
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome {session.user.name}</div>;
}
```

### Client-Side Authentication
```typescript
"use client";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function Profile() {
  const { user, isLoading, isAuthenticated } = useCurrentUser();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return <div>Welcome {user?.name}</div>;
}
```

### Protected API Route
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ data: "protected data" });
}
```

## API Endpoints

### Sign In
- `POST /api/auth/signin` - Initiate authentication
- `GET /api/auth/signin` - Get sign-in page

### Sign Out
- `POST /api/auth/signout` - End session

### Register (Email/Password)
- `POST /api/auth/register` - Create new account
  Body: `{ email, password, name? }`

### Session
- `GET /api/auth/session` - Get current session
- `GET /api/auth/csrf` - Get CSRF token

## Features Implemented

✅ Google OAuth authentication
✅ Email/password authentication with bcrypt hashing
✅ Prisma database adapter
✅ JWT session strategy
✅ Type-safe with TypeScript
✅ Custom session and JWT callbacks
✅ Registration API endpoint
✅ Protected route utilities
✅ Custom hooks for easy access
✅ Environment variable configuration

## Security Features

- Passwords hashed with bcryptjs (12 salt rounds)
- JWT tokens for sessions
- CSRF protection built into NextAuth
- Environment-based configuration
- Secure cookie handling
- Google OAuth with verified tokens
