import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    email: string
    name: string
    image?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
  }
}

export interface User {
  id: string
  email: string
  name: string
  image?: string | null
  emailVerified?: Date | null
  createdAt: Date
}

export interface Group {
  id: string
  name: string
  createdBy: string
  createdAt: Date
}

export interface GroupMember {
  id: string
  groupId: string
  userId: string
  joinedAt: Date
}

export interface Expense {
  id: string
  groupId: string
  description: string
  amount: number
  paidBy: string
  date: Date
}

export interface Balance {
  userId: string
  amount: number
}

export interface GroupWithMembers extends Group {
  members: (GroupMember & { user: User })[]
  expenses: Expense[]
}
