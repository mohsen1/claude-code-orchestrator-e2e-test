import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Middleware to protect routes
 * Redirects unauthenticated users to login page
 */
export default withAuth(
  function middleware(req) {
    // Additional middleware logic can be added here
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect all routes except public ones
        const { pathname } = req.nextUrl;

        // Public routes that don't require authentication
        const publicRoutes = [
          "/",
          "/login",
          "/api/auth",
          "/api/webhook", // For webhooks if needed
        ];

        const isPublicRoute = publicRoutes.some((route) =>
          pathname.startsWith(route)
        );

        return isPublicRoute || !!token;
      },
    },
  }
);

/**
 * Matcher configuration
 * Defines which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
