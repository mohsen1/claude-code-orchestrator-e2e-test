# Quick Start Guide

## 1. Install Dependencies
```bash
npm install
```

## 2. Configure Environment

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth (generate secret with: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Google OAuth (get from https://console.cloud.google.com/)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 3. Initialize Database
```bash
npx prisma generate
npx prisma db push
```

## 4. Start Development Server
```bash
npm run dev
```

Open http://localhost:3000

## What's Included

✅ **Google OAuth** - Sign in with Google
✅ **Email/Password** - Traditional authentication
✅ **Protected Routes** - Middleware for route protection
✅ **Registration** - User signup with validation
✅ **Session Management** - JWT-based sessions
✅ **Database Schema** - Prisma with SQLite
✅ **TypeScript** - Full type safety
✅ **Tailwind CSS** - Pre-configured styling

## File Structure

```
├── src/
│   ├── lib/
│   │   ├── auth.ts              # NextAuth configuration
│   │   ├── auth-helpers.ts      # Password hashing utilities
│   │   ├── client-utils.ts      # React hooks
│   │   └── prisma.ts            # Prisma client
│   ├── app/
│   │   ├── api/auth/
│   │   │   ├── [...nextauth]/   # NextAuth API
│   │   │   └── register/        # Registration endpoint
│   │   ├── login/               # Login page
│   │   ├── register/            # Register page
│   │   └── dashboard/           # Protected dashboard
│   ├── middleware.ts            # Route protection
│   └── types/
│       └── next-auth.d.ts       # TypeScript types
```

## Protected Routes

These routes require authentication:
- `/dashboard/*`
- `/groups/*`
- `/api/protected/*`

## Next Steps

1. Set up Google OAuth credentials
2. Create group management features
3. Implement expense tracking
4. Add real-time updates with Socket.io
5. Build settlements and balance calculations
