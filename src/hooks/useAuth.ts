'use client'

import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Hook to access authentication state and methods
 * Use this in components that need authentication data but don't require authentication
 */
export function useAuth() {
  const context = useAuthContext()
  return context
}

/**
 * Hook that ensures user is authenticated
 * Redirects to login if not authenticated
 */
export function useRequireAuth() {
  const auth = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push('/login')
    }
  }, [auth.isLoading, auth.isAuthenticated, router])

  return {
    ...auth,
    // If loading or not authenticated, user is null
    user: auth.isLoading || !auth.isAuthenticated ? null : auth.user,
    // Allow components to check if they should render loading state
    mustAuth: true,
  }
}

/**
 * Hook that returns user ID if authenticated
 * Useful for API calls that require user identification
 */
export function useUserId() {
  const auth = useAuthContext()
  return auth.user?.id || null
}

/**
 * Hook that checks if user is authenticated
 * Returns boolean without redirecting
 */
export function useIsAuthenticated() {
  const auth = useAuthContext()
  return auth.isAuthenticated && !auth.isLoading
}

/**
 * Hook for login/logout functionality
 * Returns handlers that can be attached to buttons
 */
export function useAuthActions() {
  const auth = useAuthContext()

  const handleLogin = async (email: string, password: string) => {
    try {
      await auth.login(email, password)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }
    }
  }

  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      await auth.signup(name, email, password)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      }
    }
  }

  const handleLogout = async () => {
    try {
      await auth.logout()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      }
    }
  }

  return {
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    isLoading: auth.isLoading,
  }
}

/**
 * Hook that provides user profile data
 * Combines auth context with profile fetching
 */
export function useProfile() {
  const auth = useAuthContext()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    if (!auth.isAuthenticated) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/profile')
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
      const data = await response.json()
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [auth.isAuthenticated])

  const updateProfile = async (updates: Partial<Profile>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const data = await response.json()
      setProfile(data)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    profile,
    isLoading: isLoading || auth.isLoading,
    error,
    isAuthenticated: auth.isAuthenticated,
    refreshProfile: fetchProfile,
    updateProfile,
  }
}

interface Profile {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
  updatedAt: string
}
