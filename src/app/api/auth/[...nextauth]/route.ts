import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import db from '@/lib/db';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      // Check if user exists, create if not
      const existingUser = db
        .prepare('SELECT id FROM users WHERE email = ?')
        .get(user.email);

      if (!existingUser && user.id) {
        // Create new user
        const userId = user.id;
        db.prepare(
          'INSERT INTO users (id, name, email, image) VALUES (?, ?, ?, ?)'
        ).run(userId, user.name || '', user.email, user.image || null);
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const user = db
          .prepare('SELECT id, name, email, image FROM users WHERE email = ?')
          .get(session.user.email) as any;

        if (user) {
          session.user.id = user.id;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
