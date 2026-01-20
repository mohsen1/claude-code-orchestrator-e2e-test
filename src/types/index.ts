// User Types
export * from './user';

// Group Types
export * from './group';

// Expense Types
export * from './expense';

// Settlement Types
export * from './settlement';

// Common Types and Utilities
export type { z } from 'zod';

// API Response Types
export interface ApiResponse<T = any> {
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
  totalPages: number;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
}

// Socket.io Event Types
export interface SocketEvents {
  // Client -> Server
  join_group: { groupId: string };
  leave_group: { groupId: string };

  // Server -> Client
  expense_added: { groupId: string; expense: any };
  expense_updated: { groupId: string; expense: any };
  expense_deleted: { groupId: string; expenseId: string };

  settlement_created: { groupId: string; settlement: any };
  settlement_updated: { groupId: string; settlement: any };

  member_added: { groupId: string; member: any };
  member_removed: { groupId: string; userId: string };
}
