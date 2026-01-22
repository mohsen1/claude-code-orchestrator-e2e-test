import { Session } from 'next-auth';

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionToken {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

// NextAuth types
export interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

// Auth DTOs
export interface LoginInput {
  email: string;
  password: string;
  callbackUrl?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Omit<User, 'password'>;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// OAuth types
export type OAuthProvider = 'google' | 'github' | 'discord';

export interface OAuthProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified?: boolean | null;
}

export interface OAuthAccount {
  provider: OAuthProvider;
  providerAccountId: string;
}

// Permission types
export type Permission =
  | 'create_group'
  | 'edit_group'
  | 'delete_group'
  | 'invite_members'
  | 'remove_members'
  | 'create_expense'
  | 'edit_expense'
  | 'delete_expense'
  | 'create_settlement'
  | 'mark_settlement_paid';

export interface RolePermissions {
  [key: string]: Permission[];
}

export const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    'create_group',
    'edit_group',
    'delete_group',
    'invite_members',
    'remove_members',
    'create_expense',
    'edit_expense',
    'delete_expense',
    'create_settlement',
    'mark_settlement_paid',
  ],
  member: [
    'create_expense',
    'edit_expense',
    'delete_expense',
    'create_settlement',
    'mark_settlement_paid',
  ],
};
