import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Authentication middleware for protected routes
 *
 * This middleware:
 * - Validates JWT tokens for protected routes
 * - Redirects unauthenticated users to login
 * - Allows public routes to pass through
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/api/auth',
    '/api/webhook', // For Stripe webhooks if needed later
  ]

  // Check if the current path is public or starts with a public route
  const isPublicRoute = publicRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Allow public routes to pass through
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // API routes that need authentication
  if (pathname.startsWith('/api/')) {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      })

      if (!token) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Add user info to request headers for API routes
      const response = NextResponse.next()
      response.headers.set('x-user-id', token.sub || '')
      response.headers.set('x-user-email', token.email || '')

      return response
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
  }

  // Protected page routes
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      // Redirect to login with callback URL
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', encodeURI(pathname))
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  } catch (error) {
    // If token validation fails, redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', encodeURI(pathname))
    return NextResponse.redirect(loginUrl)
  }
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
