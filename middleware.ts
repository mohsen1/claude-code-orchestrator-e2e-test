import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protected routes that require authentication
        const protectedPaths = ["/dashboard", "/groups"]
        const isProtectedPath = protectedPaths.some((path) =>
          req.nextUrl.pathname.startsWith(path)
        )

        // Allow access to public routes
        const publicPaths = ["/login", "/signup", "/api/auth"]
        const isPublicPath = publicPaths.some((path) =>
          req.nextUrl.pathname.startsWith(path)
        )

        if (isPublicPath) {
          return true
        }

        if (isProtectedPath) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
