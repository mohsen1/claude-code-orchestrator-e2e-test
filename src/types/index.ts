// Export all type modules
export * from './auth';
export * from './expense';
export * from './group';
export * from './settlement';

// Common utility types
export type { CurrencyCode, Money } from './expense';
export type { GroupRole, GroupStatus } from './group';
export type { SettlementStatus } from './settlement';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export class ValidationError extends Error {
  public readonly code: string;
  public readonly details: Record<string, unknown>;

  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
    this.details = details;
  }
}

export class NotFoundError extends Error {
  public readonly code: string;
  public readonly resource: string;

  constructor(resource: string, id?: string | number) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(message);
    this.name = 'NotFoundError';
    this.code = 'NOT_FOUND';
    this.resource = resource;
  }
}

export class AuthenticationError extends Error {
  public readonly code: string;

  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
    this.code = 'AUTHENTICATION_ERROR';
  }
}

export class AuthorizationError extends Error {
  public readonly code: string;
  public readonly resource: string;
  public readonly action: string;

  constructor(resource: string, action: string) {
    super(`Not authorized to ${action} on ${resource}`);
    this.name = 'AuthorizationError';
    this.code = 'AUTHORIZATION_ERROR';
    this.resource = resource;
    this.action = action;
  }
}

// Form state types
export type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export interface FormState<T = unknown> {
  status: FormStatus;
  data?: T;
  error?: string;
}

// Socket event types
export interface SocketEvent<T = unknown> {
  event: string;
  data: T;
  timestamp: Date;
}

// Real-time update types
export interface RealtimeUpdate {
  type: 'expense' | 'settlement' | 'group' | 'member';
  action: 'create' | 'update' | 'delete';
  groupId: string;
  data: unknown;
  timestamp: Date;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'expense_added' | 'settlement_created' | 'member_joined' | 'member_left' | 'group_updated';
  title: string;
  message: string;
  groupId?: string;
  read: boolean;
  createdAt: Date;
}
