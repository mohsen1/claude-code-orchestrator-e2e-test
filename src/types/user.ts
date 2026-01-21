/**
 * User-related types and interfaces
 */

import { UUID } from './api';

/**
 * User entity representation
 */
export interface User {
  id: UUID;
  name: string;
  email: string;
  image?: string | null;
  createdAt: Date;
}

/**
 * User creation payload
 */
export interface CreateUserInput {
  name: string;
  email: string;
  password?: string;
  image?: string;
}

/**
 * User update payload
 */
export interface UpdateUserInput {
  name?: string;
  email?: string;
  image?: string;
}

/**
 * User profile with calculated balances
 */
export interface UserProfile extends User {
  totalOwed: number; // In cents (positive means others owe them)
  totalOwing: number; // In cents (positive means they owe others)
  netBalance: number; // In cents (positive = net receiver, negative = net payer)
}
