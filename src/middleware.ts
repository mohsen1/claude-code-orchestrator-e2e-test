export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/groups/:path*",
    "/api/protected/:path*",
  ],
}
