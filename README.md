# Expense Sharing App

A modern expense-sharing application built with Next.js 14, featuring Google OAuth authentication, group expense management, and balance tracking.

## Features

- **Google OAuth Login** - Secure authentication with NextAuth.js
- **Group Management** - Create and manage expense-sharing groups
- **Expense Tracking** - Add expenses and split them equally among group members
- **Balance View** - Track who owes whom in each group
- **Modern UI** - Built with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth.js v5 with Google OAuth
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (class-variance-authority, clsx, tailwind-merge)
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ installed
- Google Cloud project with OAuth credentials

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Database
DATABASE_URL="file:./dev.db"
```

To generate a NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy your Client ID and Client Secret to `.env`

### 4. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
.
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/            # Auth-related pages
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Prisma schema
└── public/               # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio to view database

## Database Schema

The app uses the following main models:
- **User** - User accounts
- **Group** - Expense-sharing groups
- **GroupMember** - Group memberships
- **Expense** - Group expenses
- **ExpenseSplit** - Individual expense splits

## Building for Production

```bash
npm run build
npm run start
```

## License

MIT
