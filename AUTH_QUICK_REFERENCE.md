# Authentication Quick Reference

## Quick Import Guide

```typescript
// Server-side: Get current user
import { getCurrentUser, requireAuth, isAuthenticated, getUserId } from "@/lib/session";

// Client-side: Use session in components
import { useSession, useRequireAuth } from "@/lib/use-session";

// Database operations for users
import { getUserByEmail, createUser, updateUser } from "@/lib/auth-utils";

// API route authentication
import { withAuth, authenticateApiRoute } from "@/lib/api-auth";

// Validation helpers
import { validateSignupData, validateLoginData, isValidEmail } from "@/lib/auth-helpers";

// NextAuth core functions
import { auth, signIn, signOut } from "@/lib/auth";
```

## Common Patterns

### 1. Protected Server Component

```tsx
import { requireAuth } from "@/lib/session";

export default async function ProtectedPage() {
  const user = await requireAuth();

  return <div>Welcome, {user.name}!</div>;
}
```

### 2. Optional Auth Server Component

```tsx
import { getCurrentUser } from "@/lib/session";

export default async function HomePage() {
  const user = await getCurrentUser();

  return user ? <div>Welcome back, {user.name}</div> : <div>Please sign in</div>;
}
```

### 3. Protected Server Action

```ts
"use server";

import { requireAuth } from "@/lib/session";

export async function createGroup(name: string) {
  const user = await requireAuth();
  // Create group with user.id as creator
}
```

### 4. Client Component with Auth

```tsx
"use client";

import { useSession } from "@/lib/use-session";

export function UserProfile() {
  const { user, isAuthenticated, isLoading, signOut } = useSession();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <SignInButton />;

  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### 5. Protected API Route

```ts
import { withAuth } from "@/lib/api-auth";
import { NextResponse } from "next/server";

export const GET = withAuth(async (req, user) => {
  return NextResponse.json({ userId: user.id });
});
```

### 6. Manual Auth Check in API

```ts
import { authenticateApiRoute, forbiddenResponse } from "@/lib/api-auth";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userOrResponse = await authenticateApiRoute(req);

  // Check if it's an error response
  if (userOrResponse instanceof NextResponse) {
    return userOrResponse;
  }

  // Now user is authenticated
  const user = userOrResponse;
  return NextResponse.json({ userId: user.id });
}
```

### 7. Server Action with Optional Auth

```ts
"use server";

import { getCurrentUser } from "@/lib/session";

export async function getPublicData() {
  const user = await getCurrentUser();

  return {
    data: "public data",
    user: user ? { name: user.name } : null,
  };
}
```

### 8. Sign In with Different Providers

```tsx
"use client";

import { signIn } from "next-auth/react";

export function SignInButtons() {
  return (
    <div>
      <button onClick={() => signIn("google")}>Sign in with Google</button>
      <button onClick={() => signIn("credentials", {
        email: "user@example.com",
        password: "password"
      })}>
        Sign in with Email
      </button>
    </div>
  );
}
```

### 9. Validation in Server Actions

```ts
"use server";

import { validateSignupData } from "@/lib/auth-helpers";
import { createUser } from "@/lib/auth-utils";

export async function signupAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  // Validate
  const errors = validateSignupData({ email, password, name });
  if (errors.length > 0) {
    return { error: errors[0].message };
  }

  // Create user
  const user = await createUser({ email, password, name });
  if (!user) {
    return { error: "Failed to create user" };
  }

  return { success: true };
}
```

### 10. Permission Check

```ts
"use server";

import { requireAuth, isOwner } from "@/lib/session";

export async function deleteGroup(groupId: string) {
  const user = await requireAuth();

  // Check if user owns the group
  const group = await getGroup(groupId);
  if (!isOwner(user.id, group.createdBy)) {
    throw new Error("You don't have permission to delete this group");
  }

  // Delete group
  await deleteGroupById(groupId);
}
```

## Session Helpers Cheat Sheet

### Server-side (`src/lib/session.ts`)

| Function | Returns | Description |
|----------|---------|-------------|
| `getServerSession()` | `Session \| null` | Get full session |
| `getCurrentUser()` | `User \| null` | Get current user |
| `requireAuth()` | `User` | Get user or throw |
| `isAuthenticated()` | `Promise<boolean>` | Check if logged in |
| `getUserId()` | `string \| null` | Get user ID |
| `isOwner(resourceOwnerId)` | `Promise<boolean>` | Check ownership |
| `requireOwner(resourceOwnerId)` | `Promise<void>` | Require ownership |

### Client-side (`src/lib/use-session.ts`)

| Hook Property | Type | Description |
|--------------|------|-------------|
| `user` | `User \| null` | Current user |
| `session` | `Session \| null` | Full session |
| `isAuthenticated` | `boolean` | Logged in status |
| `isLoading` | `boolean` | Loading state |
| `status` | `'loading' \| 'authenticated' \| 'unauthenticated'` | Auth status |
| `signOut()` | `() => Promise<void>` | Sign out function |
| `signOutAndRedirect(url)` | `(url) => Promise<void>` | Sign out and redirect |

## Database Helpers (`src/lib/auth-utils.ts`)

| Function | Description |
|----------|-------------|
| `getUserByEmail(email)` | Get user by email |
| `getUserById(id)` | Get user by ID |
| `createUser(data)` | Create new user |
| `updateUser(id, data)` | Update user |
| `deleteUser(id)` | Delete user |
| `verifyPassword(email, password)` | Verify password |
| `linkOAuthAccount(userId, provider, accountId)` | Link OAuth account |

## Validation Helpers (`src/lib/auth-helpers.ts`)

| Function | Description |
|----------|-------------|
| `isValidEmail(email)` | Validate email format |
| `validatePassword(password)` | Validate password strength |
| `validateSignupData(data)` | Validate signup form |
| `validateLoginData(data)` | Validate login form |
| `getPasswordStrength(password)` | Get password score (0-100) |
| `getInitials(name)` | Get user initials |

## Error Handling

```typescript
// In Server Actions
try {
  const user = await requireAuth();
  // Do work
} catch (error) {
  return { error: "Authentication required" };
}

// In Client Components
try {
  await signOut();
} catch (error) {
  console.error("Sign out failed:", error);
}

// In API Routes
import { errorResponse, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = await getOptionalUser(req);

  if (!user) {
    return unauthorizedResponse();
  }

  return successResponse({ data: "protected" });
}
```

## Type Definitions

All auth-related types are exported from `src/lib/auth-types.ts`:

```typescript
import type {
  PublicUser,
  DbUser,
  LoginCredentials,
  SignupData,
  AuthProvider,
  AuthError,
  AuthResponse,
  AuthState
} from "@/lib/auth-types";
```

## Middleware Protection

Routes are automatically protected by `src/middleware.ts`:

- Protected: `/dashboard/*`, `/api/*` (except `/api/auth/*`)
- Public: `/`, `/login`, `/signup`, static files

Modify `src/middleware.ts` to adjust route protection.
