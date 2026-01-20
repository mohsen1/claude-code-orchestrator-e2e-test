"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useSession } from "next-auth/react"
import { Session } from "next-auth"

interface AuthContextType {
  session: Session | null
  status: "loading" | "authenticated" | "unauthenticated"
  user: Session["user"] | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<Session["user"] | null>(null)

  useEffect(() => {
    if (session?.user) {
      setUser(session.user)
    } else {
      setUser(null)
    }
  }, [session])

  return (
    <AuthContext.Provider value={{ session, status, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
