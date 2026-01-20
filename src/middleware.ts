import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/api/auth',
]

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/groups',
  '/profile',
]

// API routes that require authentication
const protectedApiRoutes = [
  '/api/user',
  '/api/groups',
  '/api/expenses',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.url

  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route) || pathname === route
  )

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  const isProtectedApiRoute = protectedApiRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Check if it's an API route
  const isApiRoute = pathname.startsWith('/api')

  // If user is not authenticated and trying to access protected route
  if (!token && (isProtectedRoute || isProtectedApiRoute)) {
    if (isApiRoute) {
      // Return 401 for API routes
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    } else {
      // Redirect to login for page routes
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If user is authenticated and trying to access login/signup
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Add user info to headers for API routes
  if (token && isApiRoute) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', token.sub || '')
    requestHeaders.set('x-user-email', token.email || '')

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
