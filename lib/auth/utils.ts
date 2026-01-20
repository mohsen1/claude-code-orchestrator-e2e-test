import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export interface AuthUser {
  id: string
  email: string
  name: string
  image?: string
}

export async function getSession(): Promise<AuthUser | null> {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return null
    }
    return {
      id: session.user.id || "",
      email: session.user.email || "",
      name: session.user.name || "",
      image: session.user.image || undefined,
    }
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getSession()
  if (!user) {
    redirect("/login")
  }
  return user
}

export async function requireGuest(): Promise<void> {
  const user = await getSession()
  if (user) {
    redirect("/dashboard")
  }
}

export function isAuthenticated(user: AuthUser | null): user is AuthUser {
  return user !== null
}
