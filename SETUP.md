# Google OAuth Setup Instructions

## 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to: **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted
6. Choose **Web application** and add:
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
7. Copy the **Client ID** and **Client Secret**

## 2. Configure Environment Variables

Update `.env.local` with your credentials:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-secret-string-here
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
```

To generate a secure NEXTAUTH_SECRET, run:
```bash
openssl rand -base64 32
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the login page.

## Features Implemented

- ✅ Google OAuth authentication via NextAuth.js
- ✅ JWT session management
- ✅ Beautiful login page with shadcn/ui components
- ✅ TypeScript type safety for NextAuth
- ✅ Dark mode support
- ✅ Server-side authentication helpers

## Project Structure

```
src/
├── app/
│   ├── api/auth/
│   │   ├── [...nextauth]/route.ts    # NextAuth API handler
│   │   └── options.ts                 # NextAuth configuration
│   ├── login/
│   │   └── page.tsx                   # Login page component
│   ├── layout.tsx                     # Root layout with providers
│   ├── page.tsx                       # Home (redirects to login)
│   └── globals.css                    # Global styles
├── components/
│   ├── providers/
│   │   └── session-provider.tsx       # Session provider wrapper
│   └── ui/                            # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── form.tsx
│       └── label.tsx
├── lib/
│   ├── auth.ts                        # Auth helper functions
│   └── utils.ts                       # Utility functions
└── types/
    └── next-auth.d.ts                 # NextAuth type definitions
```
