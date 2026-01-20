import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcrypt";
import { authConfig } from "./auth.config";
import { getUserByEmail } from "./auth-utils";
import { db } from "./db";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image: string | null;
      provider: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image: string | null;
    provider: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    image: string | null;
    provider: string;
  }
}

const credentialsConfig = Credentials({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      return null;
    }

    const user = await getUserByEmail(credentials.email as string);

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await compare(
      credentials.password as string,
      user.password
    );

    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      provider: "credentials",
    };
  },
});

const config = {
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    credentialsConfig,
  ],
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);

// Helper function to get session on server side
export async function getSession() {
  return await auth();
}

// Helper function to get current user
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

// Helper function to require authentication
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}
