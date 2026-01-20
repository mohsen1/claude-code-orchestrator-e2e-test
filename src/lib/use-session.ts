"use client";

import { useSession as useNextAuthSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * Hook to access the current session
 * Provides convenient methods for authentication state
 */
export function useSession() {
  const { data: session, status, update } = useNextAuthSession();
  const router = useRouter();

  return {
    user: session?.user || null,
    session: session || null,
    isAuthenticated: !!session?.user,
    isLoading: status === "loading",
    status,

    /**
     * Sign out the current user and redirect to home
     */
    signOut: async () => {
      await nextAuthSignOut({ redirect: false });
      router.push("/");
    },

    /**
     * Sign out and redirect to a specific URL
     */
    signOutAndRedirect: async (url: string = "/") => {
      await nextAuthSignOut({ redirect: false });
      router.push(url);
    },

    /**
     * Update the session data
     */
    refresh: async () => {
      await update();
    },
  };
}

/**
 * Hook that requires authentication
 * Throws an error if user is not authenticated
 * Useful in components that should only render for authenticated users
 */
export function useRequireAuth() {
  const session = useSession();

  if (!session.isLoading && !session.isAuthenticated) {
    throw new Error("Authentication required");
  }

  return session;
}
