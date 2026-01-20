# NextAuth.js Setup Instructions

This document provides instructions for setting up NextAuth.js with Google OAuth in your expense-sharing app.

## Prerequisites

1. **Google Cloud Project**: Create a project at https://console.cloud.google.com
2. **OAuth Consent Screen**: Configure the OAuth consent screen
3. **OAuth Credentials**: Create OAuth 2.0 credentials

## Setup Steps

### 1. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
4. Copy the Client ID and Client Secret

### 2. Update Environment Variables

Edit `.env.local` file:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-secure-secret-here

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL=file:./data/expenses.db
```

**Important**: Generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3. Initialize Database

Run the following commands:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## File Structure

```
src/
├── app/
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts          # NextAuth API route handler
├── components/
│   └── providers/
│       └── session-provider.tsx      # Session provider wrapper
├── hooks/
│   └── use-session.ts                # Client-side auth hooks
├── lib/
│   ├── auth.ts                       # NextAuth configuration
│   ├── auth-utils.ts                 # Auth utility functions
│   ├── prisma.ts                     # Prisma client singleton
│   └── session.ts                    # Server-side session helpers
├── middleware.ts                     # Route protection middleware
└── types/
    └── next-auth.d.ts               # TypeScript declarations
```

## Usage Examples

### Server-Side (Server Components)

```typescript
import { getCurrentUser } from "@/lib/session";

export default async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <div>Welcome, {user.name}!</div>;
}
```

### Client-Side (Client Components)

```typescript
"use client";

import { useAuth } from "@/hooks/use-session";

export function UserProfile() {
  const { user, isAuthenticated, isLoading } = useAuth({
    redirectIfNotAuth: true,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return <div>Welcome, {user.name}!</div>;
}
```

### Server Actions

```typescript
"use server";

import { requireAuth } from "@/lib/auth-utils";

export async function createGroup(name: string) {
  const user = await requireAuth();

  // Create group with authenticated user
  const group = await prisma.group.create({
    data: {
      name,
      createdBy: user.id,
    },
  });

  return group;
}
```

## Protected Routes

The middleware automatically protects all routes except:
- `/` - Landing page
- `/login` - Login page
- `/api/auth/*` - NextAuth API routes

To add more public routes, update `src/middleware.ts`.

## Testing Locally

1. Start the dev server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. You should be redirected to `/dashboard`

## Production Deployment

1. Update `NEXTAUTH_URL` to your production domain
2. Add production OAuth redirect URI in Google Cloud Console
3. Set a secure `NEXTAUTH_SECRET`
4. Run `npx prisma generate` and `npx prisma db push`
5. Deploy your application

## Troubleshooting

### "Invalid NEXTAUTH_SECRET"
Generate a new secret: `openssl rand -base64 32`

### "OAuth credentials not configured"
Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env.local`

### "Database connection failed"
Ensure the database file exists: `mkdir -p data && npx prisma db push`

### "Redirect URI mismatch"
Verify the redirect URI in Google Cloud Console matches your app's URL
