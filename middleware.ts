import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/api/auth/login', '/api/auth/signup'];

  // API routes that don't require authentication
  const publicApiRoutes = ['/api/auth/login', '/api/auth/signup'];

  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route));

  // If accessing protected route without token, redirect to login
  if (!isPublicRoute && !token) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If token exists, verify it
  if (token && !isPublicApiRoute) {
    const payload = await verifyToken(token);

    if (!payload) {
      // Invalid token - clear it and redirect to login
      const response = pathname.startsWith('/api')
        ? NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        : NextResponse.redirect(new URL('/login', request.url));

      response.cookies.delete('auth-token');
      return response;
    }

    // Add user info to headers for API routes
    if (pathname.startsWith('/api')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId.toString());
      requestHeaders.set('x-user-email', payload.email);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  // If accessing login/signup while authenticated, redirect to dashboard
  if ((pathname === '/login' || pathname === '/signup') && token) {
    const payload = await verifyToken(token);
    if (payload) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
