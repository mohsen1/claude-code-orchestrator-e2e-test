import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * NextAuth API route handler
 * Handles all authentication requests:
 * - /api/auth/signin - Sign in page
 * - /api/auth/signout - Sign out
 * - /api/auth/callback - OAuth callbacks
 * - /api/auth/session - Get session
 * - /api/auth/csrf - CSRF token
 * - /api/auth/providers - List providers
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
