/**
 * Common type definitions used throughout the application
 */

/**
 * Database entity ID type (used for all database entities)
 */
export type EntityId = string;

/**
 * ISO timestamp string
 */
export type ISODateTime = string;

/**
 * Money value stored as integer cents (smallest currency unit)
 * All monetary values use integers to avoid floating-point arithmetic issues
 */
export type MoneyCents = number;

/**
 * User roles within a group
 */
export enum GroupRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

/**
 * Group member status
 */
export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  REMOVED = 'REMOVED',
}

/**
 * Expense categories for better organization
 */
export enum ExpenseCategory {
  FOOD = 'FOOD',
  TRANSPORT = 'TRANSPORT',
  ACCOMMODATION = 'ACCOMMODATION',
  ENTERTAINMENT = 'ENTERTAINMENT',
  SHOPPING = 'SHOPPING',
  UTILITIES = 'UTILITIES',
  OTHER = 'OTHER',
}

/**
 * Settlement status
 */
export enum SettlementStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * API response wrapper for consistent error handling
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * User session data
 */
export interface SessionUser {
  id: EntityId;
  name: string;
  email: string;
  image?: string;
}

/**
 * Audit trail entry for tracking changes
 */
export interface AuditTrail {
  id: EntityId;
  entityType: string;
  entityId: EntityId;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  userId: EntityId;
  changes?: Record<string, { from: unknown; to: unknown }>;
  createdAt: ISODateTime;
}
