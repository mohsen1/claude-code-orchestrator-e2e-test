import { cookies } from 'next/headers';
import { getUserBySession } from '@/lib/session';

export interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
}

/**
 * Get the current authenticated user on the server side
 * Use this in Server Components and Server Actions
 */
export async function getServerUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session-token')?.value;

  if (!sessionToken) {
    return null;
  }

  return getUserBySession(sessionToken);
}

/**
 * Require authentication on the server side
 * Throws an error if user is not authenticated
 */
export async function requireServerUser(): Promise<User> {
  const user = await getServerUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}
