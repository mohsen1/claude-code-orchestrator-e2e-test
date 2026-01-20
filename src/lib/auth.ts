import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  debug: process.env.NODE_ENV === "development",
})

export { handlers, auth, signIn, signOut }

// Helper function to get the current session server-side
export async function getSession() {
  return await auth()
}

// Helper function to require authentication - redirects to login if not authenticated
export async function requireAuth() {
  const session = await auth()
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session
}
