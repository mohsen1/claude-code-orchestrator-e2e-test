import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { BetterSQLite3Adapter } from '@auth/better-sqlite3-adapter';
import db from './db';

// Create the adapter instance
const adapter = BetterSQLite3Adapter(db, {
  // Optional: Customize table names if needed
  usersTable: 'users',
  accountsTable: 'accounts',
  sessionsTable: 'sessions',
  verificationTokensTable: 'verification_tokens',
});

export const authOptions: NextAuthOptions = {
  // Configure the adapter
  adapter,

  // Configure providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],

  // Session configuration
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // JWT configuration (fallback if session strategy is jwt)
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Pages
  pages: {
    signIn: '/login',
    error: '/login',
  },

  // Callbacks
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },

    async session({ session, user }) {
      // Add user id to session
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after login
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  // Events
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', user.email);
      if (isNewUser) {
        console.log('New user created:', user.email);
      }
    },
    async signOut({ session, token }) {
      console.log('User signed out');
    },
  },

  // Debug mode (disable in production)
  debug: process.env.NODE_ENV === 'development',
};

export default authOptions;
