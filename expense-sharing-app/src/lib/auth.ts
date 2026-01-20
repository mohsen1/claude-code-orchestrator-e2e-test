import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./db"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  adapter: {
    createUser: async (user) => {
      const dbUser = await prisma.user.create({
        data: { email: user.email!, name: user.name! }
      })
      return dbUser
    },
    getUser: async (id) => {
      return null // Implement if needed
    },
    getUserByEmail: async (email) => {
      return await prisma.user.findUnique({ where: { email } })
    },
    getUserByAccount: async (account) => {
      return null // Implement if needed
    },
    updateUser: async (user) => {
      return user // Implement if needed
    },
    deleteUser: async (userId) => {
      // Implement if needed
    },
    linkAccount: async (account) => {
      // Implement if needed
    },
    unlinkAccount: async (account) => {
      // Implement if needed
    },
    createSession: async (data) => {
      return await prisma.session.create({ data })
    },
    getSessionAndUser: async (sessionToken) => {
      return null // Implement if needed
    },
    updateSession: async (session) => {
      return session // Implement if needed
    },
    deleteSession: async (sessionToken) => {
      await prisma.session.delete({ where: { sessionToken } })
    },
  } as any,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
