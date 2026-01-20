import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { compare } from "bcryptjs"
import { getDb } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const db = getDb()
        const user = db
          .prepare("SELECT * FROM users WHERE email = ?")
          .get(credentials.email) as any

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }

      // Handle OAuth sign-in
      if (account && user) {
        const db = getDb()

        // Check if user exists
        const existingUser = db
          .prepare("SELECT * FROM users WHERE email = ?")
          .get(user.email) as any

        if (!existingUser) {
          // Create new user from OAuth
          const result = db
            .prepare(
              "INSERT INTO users (email, name, image) VALUES (?, ?, ?)"
            )
            .run(user.email, user.name, user.image)

          token.id = result.lastInsertRowid.toString()
        } else {
          token.id = existingUser.id
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  events: {
    async signIn({ user, account }) {
      // Handle first-time sign-in for OAuth users
      if (account?.provider !== "credentials" && user?.email) {
        const db = getDb()
        const existingUser = db
          .prepare("SELECT * FROM users WHERE email = ?")
          .get(user.email) as any

        if (!existingUser) {
          db.prepare(
            "INSERT INTO users (email, name, image) VALUES (?, ?, ?)"
          ).run(user.email, user.name, user.image)
        }
      }
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
