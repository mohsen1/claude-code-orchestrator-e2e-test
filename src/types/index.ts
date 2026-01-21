/**
 * Core domain types for SplitSync expense sharing application
 * All monetary values are stored as integers (cents) to avoid floating-point precision issues
 */

import { z } from 'zod';

// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

// ============================================================================
// GROUP TYPES
// ============================================================================

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  code: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  groupId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface GroupWithMembers extends Group {
  members: Array<GroupMember & { user: UserProfile }>;
  memberCount: number;
}

export interface InviteLink {
  code: string;
  groupId: string;
  createdBy: string;
  expiresAt: Date | null;
  maxUses: number | null;
  useCount: number;
  createdAt: Date;
}

// ============================================================================
// EXPENSE TYPES
// ============================================================================

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'entertainment'
  | 'shopping'
  | 'utilities'
  | 'health'
  | 'other';

export type SplitType = 'equal' | 'percentage' | 'exact';

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number; // in cents (integer)
  paidBy: string; // userId
  category: ExpenseCategory;
  splitType: SplitType;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseSplit {
  expenseId: string;
  userId: string;
  amount: number; // in cents (integer)
  percentage?: number | null; // for percentage-based splits
}

export interface ExpenseWithDetails extends Expense {
  paidByUser: UserProfile;
  splits: Array<ExpenseSplit & { user: UserProfile }>;
  group: Group;
}

export interface ExpenseCreateInput {
  groupId: string;
  description: string;
  amount: number; // in cents (integer)
  paidBy: string;
  category: ExpenseCategory;
  splitType: SplitType;
  date?: Date;
  splits: Array<{
    userId: string;
    amount?: number; // in cents (integer)
    percentage?: number;
  }>;
}

export interface ExpenseUpdateInput {
  description?: string;
  amount?: number; // in cents (integer)
  category?: ExpenseCategory;
  splitType?: SplitType;
  date?: Date;
  splits?: Array<{
    userId: string;
    amount?: number; // in cents (integer)
    percentage?: number;
  }>;
}

// ============================================================================
// SETTLEMENT TYPES
// ============================================================================

export interface Settlement {
  id: string;
  groupId: string;
  from: string; // userId (owes money)
  to: string; // userId (is owed)
  amount: number; // in cents (integer)
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt: Date | null;
}

export interface SettlementWithUsers extends Settlement {
  fromUser: UserProfile;
  toUser: UserProfile;
  group: Group;
}

export interface Debt {
  from: string; // userId
  to: string; // userId
  amount: number; // in cents (integer)
}

export interface Balance {
  userId: string;
  user: UserProfile;
  balance: number; // in cents (positive = owed money, negative = owes money)
}

export interface GroupBalances {
  groupId: string;
  balances: Balance[];
  totalExpenses: number; // in cents (integer)
  totalSettled: number; // in cents (integer)
  pendingSettlements: number; // in cents (integer)
}

// ============================================================================
// SUMMARY TYPES
// ============================================================================

export interface GroupSummary {
  group: Group;
  balances: Balance[];
  recentExpenses: ExpenseWithDetails[];
  pendingSettlements: SettlementWithUsers[];
  memberCount: number;
  totalExpenses: number;
}

export interface UserGroupSummary {
  group: Group;
  yourBalance: number; // in cents (integer)
  totalExpenses: number;
  pendingSettlements: number;
}

// ============================================================================
// REAL-TIME EVENT TYPES
// ============================================================================

export type SocketEventType =
  | 'expense.created'
  | 'expense.updated'
  | 'expense.deleted'
  | 'settlement.created'
  | 'settlement.completed'
  | 'settlement.cancelled'
  | 'group.member_added'
  | 'group.member_removed'
  | 'group.updated';

export interface SocketEvent<T = any> {
  type: SocketEventType;
  groupId: string;
  data: T;
  timestamp: Date;
}

export interface ExpenseCreatedEvent {
  expense: ExpenseWithDetails;
}

export interface ExpenseUpdatedEvent {
  expense: ExpenseWithDetails;
}

export interface ExpenseDeletedEvent {
  expenseId: string;
  groupId: string;
}

export interface SettlementCreatedEvent {
  settlement: SettlementWithUsers;
}

export interface SettlementCompletedEvent {
  settlement: SettlementWithUsers;
}

export interface SettlementCancelledEvent {
  settlementId: string;
  groupId: string;
}

export interface MemberAddedEvent {
  groupId: string;
  member: UserProfile;
}

export interface MemberRemovedEvent {
  groupId: string;
  userId: string;
}

export interface GroupUpdatedEvent {
  group: Group;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

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
  hasMore: boolean;
}

// ============================================================================
// FORM INPUT TYPES
// ============================================================================

export interface CreateGroupInput {
  name: string;
  description?: string;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
}

export interface CreateExpenseFormData {
  description: string;
  amount: string; // will be converted to cents (integer)
  paidBy: string;
  category: ExpenseCategory;
  splitType: SplitType;
  date?: Date;
  splits: Array<{
    userId: string;
    amount?: string;
    percentage?: number;
  }>;
}

export interface CreateSettlementInput {
  groupId: string;
  from: string;
  to: string;
  amount: number; // in cents (integer)
}

// ============================================================================
// VALIDATION SCHEMAS (Zod)
// ============================================================================

export const UserRoleEnum = z.enum(['admin', 'user']);

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  image: z.string().nullable().optional(),
});

export const CreateGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100),
  description: z.string().max(500).optional(),
});

export const UpdateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const ExpenseCategoryEnum = z.enum([
  'food',
  'transport',
  'accommodation',
  'entertainment',
  'shopping',
  'utilities',
  'health',
  'other',
]);

export const SplitTypeEnum = z.enum(['equal', 'percentage', 'exact']);

export const CreateExpenseSchema = z
  .object({
    groupId: z.string().min(1, 'Group ID is required'),
    description: z.string().min(1, 'Description is required').max(500),
    amount: z.number().int().positive('Amount must be positive'),
    paidBy: z.string().min(1, 'Payer is required'),
    category: ExpenseCategoryEnum,
    splitType: SplitTypeEnum,
    date: z.date().optional(),
    splits: z
      .array(
        z.object({
          userId: z.string().min(1),
          amount: z.number().int().min(0).optional(),
          percentage: z.number().min(0).max(100).optional(),
        })
      )
      .min(1, 'At least one split is required'),
  })
  .superRefine((data, ctx) => {
    if (data.splitType !== 'exact') {
      return;
    }

    // For exact splits, all split amounts must be provided
    data.splits.forEach((split, index) => {
      if (split.amount == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Amount is required for exact splits',
          path: ['splits', index, 'amount'],
        });
      }
    });

    const hasMissingAmounts = data.splits.some(
      (split) => split.amount == null
    );
    if (hasMissingAmounts) {
      return;
    }

    const totalSplitAmount = data.splits.reduce(
      (sum, split) => sum + (split.amount as number),
      0
    );

    if (totalSplitAmount !== data.amount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'For exact split type, the sum of split amounts must equal the total amount',
        path: ['splits'],
      });
    }
  });

export const UpdateExpenseSchema = z
  .object({
    description: z.string().min(1).max(500).optional(),
    amount: z.number().int().positive().optional(),
    category: ExpenseCategoryEnum.optional(),
    splitType: SplitTypeEnum.optional(),
    date: z.date().optional(),
    splits: z
      .array(
        z.object({
          userId: z.string().min(1),
          amount: z.number().int().min(0).optional(),
          percentage: z.number().min(0).max(100).optional(),
        })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.splitType !== 'exact') {
      return;
    }

    // Only validate when both amount and splits are provided in the update
    if (data.amount == null || !data.splits) {
      return;
    }

    data.splits.forEach((split, index) => {
      if (split.amount == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Amount is required for exact splits',
          path: ['splits', index, 'amount'],
        });
      }
    });

    const hasMissingAmounts = data.splits.some(
      (split) => split.amount == null
    );
    if (hasMissingAmounts) {
      return;
    }

    const totalSplitAmount = data.splits.reduce(
      (sum, split) => sum + (split.amount as number),
      0
    );

    if (totalSplitAmount !== data.amount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'For exact split type, the sum of split amounts must equal the total amount',
        path: ['splits'],
      });
    }
  });

export const CreateSettlementSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  from: z.string().min(1, 'From user ID is required'),
  to: z.string().min(1, 'To user ID is required'),
  amount: z.number().int().positive('Amount must be positive'),
}).refine((data) => data.from !== data.to, {
  message: 'From and To users must be different',
  path: ['to'],
});

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  User,
  UserProfile,
  Group,
  GroupMember,
  GroupWithMembers,
  InviteLink,
  Expense,
  ExpenseSplit,
  ExpenseWithDetails,
  ExpenseCreateInput,
  ExpenseUpdateInput,
  Settlement,
  SettlementWithUsers,
  Debt,
  Balance,
  GroupBalances,
  GroupSummary,
  UserGroupSummary,
  SocketEvent,
  ExpenseCreatedEvent,
  ExpenseUpdatedEvent,
  ExpenseDeletedEvent,
  SettlementCreatedEvent,
  SettlementCompletedEvent,
  SettlementCancelledEvent,
  MemberAddedEvent,
  MemberRemovedEvent,
  GroupUpdatedEvent,
  ApiResponse,
  PaginatedResponse,
  CreateGroupInput,
  UpdateGroupInput,
  CreateExpenseFormData,
  CreateSettlementInput,
};
