/**
 * Utility functions for authentication
 */

/**
 * Signs out the current user and redirects to the home page
 * Use this in client-side components
 */
export async function signOut() {
  const { signOut: nextAuthSignOut } = await import("next-auth/react");
  await nextAuthSignOut({ callbackUrl: "/" });
}

/**
 * Initiates sign in with Google
 * Use this in client-side components
 */
export async function signIn() {
  const { signIn: nextAuthSignIn } = await import("next-auth/react");
  await nextAuthSignIn("google", { callbackUrl: "/dashboard" });
}

/**
 * Checks if the current route is public
 * Public routes don't require authentication
 */
export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    "/",
    "/login",
    "/api/auth",
    "/api/webhook",
  ];

  return publicRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Validates that a user is authenticated on the server side
 * Throws an error if not authenticated
 * Use this in Server Actions and Route Handlers
 */
export async function requireAuth() {
  const { getCurrentUser } = await import("./session");
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
