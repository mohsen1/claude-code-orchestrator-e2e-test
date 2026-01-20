/**
 * Authentication type definitions
 * Extend and centralize auth-related types here
 */

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image: string | null;
      provider: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image: string | null;
    provider: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken` */
  interface JWT {
    id: string;
    email: string;
    name: string;
    image: string | null;
    provider: string;
  }
}

/**
 * User data from database
 */
export interface DbUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
  password: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Public user data (safe to expose)
 */
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Signup data
 */
export interface SignupData {
  email: string;
  password: string;
  name: string;
}

/**
 * Auth provider types
 */
export type AuthProvider = "google" | "credentials";

/**
 * Account data from database
 */
export interface Account {
  id: string;
  user_id: string;
  provider: string;
  provider_account_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Session data from database
 */
export interface SessionData {
  id: string;
  user_id: string;
  session_token: string;
  expires: string;
  created_at: string;
  updated_at: string;
}

/**
 * Authentication error types
 */
export enum AuthError {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",
  WEAK_PASSWORD = "WEAK_PASSWORD",
  INVALID_EMAIL = "INVALID_EMAIL",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
}

/**
 * API response types
 */
export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * OAuth profile data
 */
export interface OAuthProfile {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  provider: AuthProvider;
}

/**
 * Password requirements
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: false,
};

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Auth state for client components
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: PublicUser | null;
}

/**
 * Login options
 */
export interface LoginOptions {
  redirectTo?: string;
  callbackUrl?: string;
}
