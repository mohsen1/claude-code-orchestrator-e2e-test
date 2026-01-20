# Authentication System Documentation

## Overview

This authentication system provides user registration, login, password management, and session validation for the expense-sharing app.

## Features

- ✅ User registration with email/password
- ✅ User login with session management
- ✅ Password change (authenticated)
- ✅ Password reset flow
- ✅ Secure session tokens (HTTP-only cookies)
- ✅ Route protection via middleware
- ✅ Server-side auth helpers for React Server Components

## API Endpoints

### Registration
**POST** `/api/auth/register`

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "abc123...",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "sessionToken": "xyz789..."
}
```

### Login
**POST** `/api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "abc123...",
    "email": "user@example.com",
    "name": "John Doe",
    "image": null
  },
  "sessionToken": "xyz789..."
}
```

### Get Current User
**GET** `/api/auth/login`

Returns the currently authenticated user based on session cookie.

### Logout
**POST** `/api/auth/logout`

Invalidates the current session and clears the cookie.

### Change Password
**PUT** `/api/auth/password`

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

### Request Password Reset
**POST** `/api/auth/password`

```json
{
  "email": "user@example.com"
}
```

### Reset Password
**PATCH** `/api/auth/password`

```json
{
  "email": "user@example.com",
  "token": "reset-token",
  "newPassword": "newpassword456"
}
```

### Get User Profile
**GET** `/api/user`

Returns the full profile of the authenticated user.

### Update User Profile
**PATCH** `/api/user`

```json
{
  "name": "John Updated",
  "image": "https://example.com/avatar.jpg"
}
```

## Usage in Client Components

```typescript
// Login example
async function login(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  // Session token is automatically set as HTTP-only cookie
  return data;
}

// Register example
async function register(email: string, password: string, name: string) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  const data = await response.json();
  return data;
}

// Logout example
async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  // Redirect to login page
  router.push('/login');
}
```

## Usage in Server Components

```typescript
import { getServerUser, requireServerUser } from '@/lib/server';

export default async function DashboardPage() {
  // Get user (returns null if not authenticated)
  const user = await getServerUser();

  // Or require authentication (throws if not authenticated)
  const authenticatedUser = await requireServerUser();

  return (
    <div>
      <h1>Welcome, {authenticatedUser.name}!</h1>
    </div>
  );
}
```

## Usage in API Routes

```typescript
import { NextRequest } from 'next/server';
import { requireAuth, createSuccessResponse, createErrorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);

    // User is authenticated, proceed with logic
    return createSuccessResponse({ data: 'some data' });
  } catch (error) {
    return createErrorResponse('Authentication failed', 401);
  }
}
```

## Protected Routes

The middleware automatically protects routes defined in `src/middleware.ts`:

- Protected pages: `/dashboard`, `/groups`, `/group/*`, `/create-group`
- Protected API routes: `/api/groups/*`, `/api/expenses/*`, `/api/settlements/*`, `/api/user/*`

Public routes:
- `/`, `/login`, `/register`
- `/api/auth/login`, `/api/auth/register`, `/api/auth/password`

## Security Features

1. **Password Hashing**: Uses SHA-256 with unique salt for each user
2. **HTTP-Only Cookies**: Session tokens stored in HTTP-only cookies prevent XSS attacks
3. **Secure Cookies**: Cookies are marked secure in production
4. **SameSite Protection**: Cookies use 'lax' same-site policy
5. **Session Expiration**: Sessions expire after 30 days of inactivity
6. **Password Validation**: Enforces minimum 8 character password length
7. **Email Validation**: Validates email format before registration
8. **Session Extension**: Valid sessions are automatically extended on each request

## Database Schema

The authentication system uses the following tables:

- `users`: User accounts with credentials
- `sessions`: Active user sessions
- `accounts`: OAuth provider accounts (for future Google OAuth)

## Environment Variables

No environment variables are required for basic authentication. For production:

- `NODE_ENV`: Set to 'production' for secure cookies

## Next Steps

To add Google OAuth:

1. Set up NextAuth.js configuration
2. Add Google OAuth credentials to environment variables
3. Implement OAuth callback handler
4. Update `accounts` table usage in database schema
