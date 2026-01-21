/**
 * User domain type
 * Represents a user in the SplitSync system
 */
export interface User {
  id: string;
  name: string;
  email: string;
  oauth_provider: 'google' | 'credentials' | null;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * User creation input
 */
export interface CreateUserInput {
  name: string;
  email: string;
  oauth_provider: 'google' | 'credentials' | null;
}

/**
 * User update input
 */
export interface UpdateUserInput {
  name?: string;
  email?: string;
}
