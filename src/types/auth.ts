import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
  }
}

export interface AuthUser {
  id: string
  name: string
  email: string
  image?: string | null
}

export interface AuthAccount {
  userId: string
  type: string
  provider: string
  providerAccountId: string
  refresh_token?: string | null
  access_token?: string | null
  expires_at?: number | null
  token_type?: string | null
  scope?: string | null
  id_token?: string | null
  session_state?: string | null
}

export interface AuthSession {
  user: AuthUser
  expires: string
}
