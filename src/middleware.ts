import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserBySession, extendSession } from '@/lib/session';

/**
 * Routes that don't require authentication
 */
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/password',
];

/**
 * Routes that require authentication
 */
const protectedRoutes = [
  '/dashboard',
  '/groups',
  '/group',
  '/create-group',
  '/api/groups',
  '/api/expenses',
  '/api/settlements',
];

/**
 * API routes that require authentication
 */
const protectedApiRoutes = [
  '/api/groups',
  '/api/expenses',
  '/api/settlements',
  '/api/user',
];

/**
 * Middleware to validate sessions and protect routes
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('session-token')?.value;

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some((route) => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + '/');
  });

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some((route) => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + '/');
  });

  const isProtectedApiRoute = protectedApiRoutes.some((route) => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + '/');
  });

  // Allow public routes to pass through
  if (isPublicRoute) {
    // If user is authenticated and trying to access login/register, redirect to dashboard
    if (sessionToken && (pathname === '/login' || pathname === '/register')) {
      const user = getUserBySession(sessionToken);
      if (user) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (isProtectedRoute || isProtectedApiRoute) {
    if (!sessionToken) {
      // No session token - redirect to login for pages, return 401 for API
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, message: 'Authentication required' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Validate session
    const user = getUserBySession(sessionToken);

    if (!user) {
      // Invalid or expired session
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, message: 'Invalid or expired session' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Extend session expiry on valid requests
    extendSession(sessionToken);

    // Add user info to headers for API routes
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.id);
      requestHeaders.set('x-user-email', user.email);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  // Handle static files and other assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
