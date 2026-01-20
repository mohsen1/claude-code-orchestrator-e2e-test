"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

/**
 * Custom hook to manage authentication state on the client side
 * Provides utilities to check authentication status and handle redirects
 *
 * @param options - Configuration options
 * @param options.redirectIfNotAuth - Whether to redirect to login if not authenticated (default: false)
 * @param options.redirectIfAuth - Whether to redirect to dashboard if authenticated (default: false)
 * @returns Session object with loading state and authentication helpers
 */
export function useAuth(options?: {
  redirectIfNotAuth?: boolean;
  redirectIfAuth?: boolean;
}) {
  const { data: session, status } = useSession({
    required: options?.redirectIfNotAuth || false,
  });

  useEffect(() => {
    if (options?.redirectIfAuth && status === "authenticated") {
      window.location.href = "/dashboard";
    }
  }, [status, options]);

  return {
    session,
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isUnauthenticated: status === "unauthenticated",
  };
}

/**
 * Simpler hook that just returns authentication status
 * Use this when you don't need the full session object
 */
export function useAuthStatus() {
  const { status } = useSession();
  return {
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isUnauthenticated: status === "unauthenticated",
  };
}
