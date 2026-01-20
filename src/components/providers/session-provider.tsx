'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

/**
 * Session Provider Component
 *
 * Wraps the application with NextAuth session context.
 * This provides session data and authentication methods to all child components.
 *
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to be wrapped
 * @param {any} props.session - Session object (typically passed from page props)
 */
export function SessionProvider({ children, session }: {
  children: ReactNode
  session?: any
}) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  )
}

/**
 * Authenticated Route Wrapper Component
 *
 * Use this to wrap components that require authentication.
 * Shows a loading state while checking authentication,
 * or redirects if the user is not authenticated.
 *
 * @example
 * ```tsx
 * <AuthenticatedRoute>
 *   <DashboardContent />
 * </AuthenticatedRoute>
 * ```
 */
export function AuthenticatedRoute({
  children,
  fallback = null
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  // This component will be enhanced with useSession hook logic
  // For now, it's a simple wrapper that can be extended
  return <>{children}</>
}

/**
 * Protected Component Wrapper
 *
 * A higher-order component pattern to protect client-side components.
 * Use this for components that should only render when authenticated.
 *
 * @example
 * ```tsx
 * <ProtectedComponent>
 *   {user && <UserProfile user={user} />}
 * </ProtectedComponent>
 * ```
 */
export function ProtectedComponent({
  children,
  loading = <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
}: {
  children: ReactNode
  loading?: ReactNode
}) {
  // This will be enhanced with actual authentication logic
  // For now, render children directly
  return <>{children}</>
}
