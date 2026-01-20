export { auth as middleware } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/groups/:path*",
    "/api/:path((?!auth|health).*)",
  ],
}
