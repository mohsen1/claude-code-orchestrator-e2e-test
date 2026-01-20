/**
 * User type definition
 */
export interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
  provider: 'email' | 'google';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Session type definition
 */
export interface Session {
  id: string;
  userId: string;
  sessionToken: string;
  expires: Date;
  createdAt: Date;
}

/**
 * Authentication response type
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Omit<User, 'password'>;
  sessionToken?: string;
}

/**
 * Registration input type
 */
export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

/**
 * Login input type
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Change password input type
 */
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

/**
 * Reset password input type
 */
export interface ResetPasswordInput {
  email: string;
  token: string;
  newPassword: string;
}
