# Authentication Setup Guide

This application uses **NextAuth.js** for authentication with support for both Google OAuth and email/password credentials.

## Features

- ✅ Google OAuth authentication
- ✅ Email/password authentication with bcrypt hashing
- ✅ JWT-based sessions
- ✅ Protected API routes
- ✅ Server-side and client-side session management
- ✅ Route protection with middleware
- ✅ TypeScript type safety

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Client Secret

## File Structure

```
src/
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── auth.config.ts       # Auth callbacks and config
│   ├── auth-utils.ts        # Database helpers for users
│   ├── auth-types.ts        # TypeScript definitions
│   ├── auth-helpers.ts      # Validation and utility functions
│   ├── session.ts           # Server-side session helpers
│   ├── use-session.ts       # Client-side session hooks
│   ├── api-auth.ts          # API route authentication helpers
│   └── db.ts                # Database initialization
├── middleware.ts            # Route protection
└── app/api/auth/
    └── [...nextauth]/
        └── route.ts         # NextAuth API route handler
```

## Usage

### Server Components

```tsx
import { getCurrentUser, requireAuth } from "@/lib/session";

export default async function Dashboard() {
  const user = await requireAuth(); // Throws if not authenticated

  return <div>Welcome, {user.name}!</div>;
}
```

### Server Actions

```ts
"use server";

import { requireAuth } from "@/lib/session";

export async function createExpense(data: FormData) {
  const user = await requireAuth();

  // User is guaranteed to be authenticated
  // Create expense for user.id
}
```

### Client Components

```tsx
"use client";

import { useSession } from "@/lib/use-session";

export default function Profile() {
  const { user, isAuthenticated, isLoading, signOut } = useSession();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### API Routes

```ts
import { withAuth } from "@/lib/api-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuth(async (req, user) => {
  // User is guaranteed to be authenticated
  return NextResponse.json({ data: "protected data" });
});
```

### Protecting Routes

Routes are automatically protected by `middleware.ts`:
- `/dashboard/*` - Requires authentication
- `/api/*` - Requires authentication (except `/api/auth/*`)

## Database Schema

The database is automatically initialized on first run with these tables:

- `users` - User accounts
- `accounts` - OAuth provider accounts
- `sessions` - User sessions

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Authentication Providers

### 1. Credentials (Email/Password)

Users can sign up with email and password. Passwords are hashed using bcrypt.

### 2. Google OAuth

Users can sign in with their Google account. Requires Google OAuth credentials.

## API Endpoints

All authentication endpoints are handled by NextAuth.js:

- `GET /api/auth/signin` - Sign in page
- `POST /api/auth/signin` - Sign in request
- `GET /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session
- `GET /api/auth/csrf` - CSRF token
- `GET /api/auth/providers` - Available providers
- `GET /api/auth/callback/google` - Google OAuth callback

## Testing Authentication

### Test with Credentials

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Protected Route

```bash
curl http://localhost:3000/api/protected \
  -H "Cookie: next-auth.session-token=your-session-token"
```

## Troubleshooting

### Session Not Persisting

- Ensure `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Verify cookies are enabled in browser

### Google OAuth Not Working

- Verify redirect URI in Google Console matches your domain
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Ensure OAuth consent screen is configured

### Database Errors

- Ensure `dev.db` file exists and is writable
- Check that better-sqlite3 is installed: `npm install better-sqlite3`

## Security Best Practices

1. Always use `requireAuth()` in server actions that need authentication
2. Never expose passwords or session tokens
3. Use HTTPS in production
4. Set secure cookie flags in production
5. Regularly update dependencies
6. Monitor for suspicious activity

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)
