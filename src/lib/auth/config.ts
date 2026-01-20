import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { db } from "@/lib/db"

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
          id: user.id.toString(),
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
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const existingUser = db
          .prepare("SELECT * FROM users WHERE email = ?")
          .get(user.email) as any

        if (!existingUser) {
          db.prepare(
            "INSERT INTO users (name, email, image, created_at) VALUES (?, ?, ?, datetime('now'))"
          ).run(user.name, user.email, user.image)
        }
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const dbUser = db
          .prepare("SELECT * FROM users WHERE email = ?")
          .get(user.email) as any

        if (dbUser) {
          token.id = dbUser.id.toString()
          token.email = dbUser.email
          token.name = dbUser.name
          token.picture = dbUser.image
        }
      }

      if (trigger === "update" && session) {
        token.name = session.name
        token.picture = session.image
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
