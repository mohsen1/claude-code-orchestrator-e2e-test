/**
 * Drizzle ORM Schema Definitions for SplitSync
 * All tables are defined with SQLite-specific types
 */

import {
  sqliteTable,
  text,
  integer,
  index,
  unique,
  type SQL,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// =============================================================================
// User & Authentication Tables
// =============================================================================

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    image: text('image'),
    emailVerified: integer('email_verified', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
  })
);

export const accounts = sqliteTable(
  'accounts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    expiresAt: integer('expires_at'),
    tokenType: text('token_type'),
    scope: text('scope'),
    idToken: text('id_token'),
    sessionState: text('session_state'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    providerIdx: index('accounts_provider_idx').on(table.provider),
    userProviderUnique: unique('accounts_user_provider_unique').on(
      table.userId,
      table.provider
    ),
  })
);

export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    sessionToken: text('session_token').notNull().unique(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires: integer('expires', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    tokenIdx: index('sessions_token_idx').on(table.sessionToken),
    userIdx: index('sessions_user_idx').on(table.userId),
  })
);

export const verificationTokens = sqliteTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull().primaryKey(),
    expires: integer('expires', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    compositeUnique: unique('verification_tokens_identifier_token').on(
      table.identifier,
      table.token
    ),
  })
);

// =============================================================================
// Group Tables
// =============================================================================

export const groups = sqliteTable(
  'groups',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    inviteCode: text('invite_code').notNull().unique(),
    inviteExpiresAt: integer('invite_expires_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    archivedAt: integer('archived_at', { mode: 'timestamp' }),
  },
  (table) => ({
    createdByIdx: index('groups_created_by_idx').on(table.createdBy),
    inviteCodeIdx: index('groups_invite_code_idx').on(table.inviteCode),
    archivedAtIdx: index('groups_archived_at_idx').on(table.archivedAt),
  })
);

export const groupMembers = sqliteTable(
  'group_members',
  {
    id: text('id').primaryKey(),
    groupId: text('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['admin', 'member'] })
      .notNull()
      .default('member'),
    balance: integer('balance').notNull().default(0), // Stored in cents
    joinedAt: integer('joined_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    groupIdx: index('group_members_group_idx').on(table.groupId),
    userIdx: index('group_members_user_idx').on(table.userId),
    groupUserUnique: unique('group_members_group_user_unique').on(
      table.groupId,
      table.userId
    ),
  })
);

// =============================================================================
// Expense Tables
// =============================================================================

export const expenses = sqliteTable(
  'expenses',
  {
    id: text('id').primaryKey(),
    groupId: text('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    amount: integer('amount').notNull(), // Amount in cents
    paidBy: text('paid_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    category: text('category', {
      enum: ['food', 'transport', 'accommodation', 'entertainment', 'shopping', 'utilities', 'healthcare', 'education', 'other'],
    }),
    date: integer('date', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    attachmentUrl: text('attachment_url'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  },
  (table) => ({
    groupIdx: index('expenses_group_idx').on(table.groupId),
    paidByIdx: index('expenses_paid_by_idx').on(table.paidBy),
    dateIdx: index('expenses_date_idx').on(table.date),
    deletedAtIdx: index('expenses_deleted_at_idx').on(table.deletedAt),
    categoryIdx: index('expenses_category_idx').on(table.category),
  })
);

export const expenseSplits = sqliteTable(
  'expense_splits',
  {
    id: text('id').primaryKey(),
    expenseId: text('expense_id')
      .notNull()
      .references(() => expenses.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(), // Amount in cents
    paid: integer('paid', { mode: 'boolean' }).notNull().default(false),
    paidAt: integer('paid_at', { mode: 'timestamp' }),
  },
  (table) => ({
    expenseIdx: index('expense_splits_expense_idx').on(table.expenseId),
    userIdx: index('expense_splits_user_idx').on(table.userId),
    expenseUserUnique: unique('expense_splits_expense_user_unique').on(
      table.expenseId,
      table.userId
    ),
  })
);

// =============================================================================
// Settlement Tables
// =============================================================================

export const settlements = sqliteTable(
  'settlements',
  {
    id: text('id').primaryKey(),
    groupId: text('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    from: text('from')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    to: text('to')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    amount: integer('amount').notNull(), // Amount in cents
    status: text('status', { enum: ['pending', 'completed', 'cancelled'] })
      .notNull()
      .default('pending'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
  },
  (table) => ({
    groupIdx: index('settlements_group_idx').on(table.groupId),
    fromIdx: index('settlements_from_idx').on(table.from),
    toIdx: index('settlements_to_idx').on(table.to),
    statusIdx: index('settlements_status_idx').on(table.status),
    fromToUnique: unique('settlements_from_to_unique').on(
      table.from,
      table.to,
      table.groupId,
      table.status
    ),
  })
);

// =============================================================================
// Audit Log Tables
// =============================================================================

export const auditLogs = sqliteTable(
  'audit_logs',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    groupId: text('group_id').references(() => groups.id, { onDelete: 'cascade' }),
    action: text('action').notNull(), // 'expense_created', 'expense_deleted', 'settlement_created', etc.
    entityType: text('entity_type').notNull(), // 'expense', 'settlement', 'group', etc.
    entityId: text('entity_id').notNull(),
    changes: text('changes'), // JSON string of changes
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    userIdx: index('audit_logs_user_idx').on(table.userId),
    groupIdx: index('audit_logs_group_idx').on(table.groupId),
    entityIdx: index('audit_logs_entity_idx').on(table.entityType, table.entityId),
    actionIdx: index('audit_logs_action_idx').on(table.action),
    createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
  })
);

// =============================================================================
// Type Exports for TypeScript
// =============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;

export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;

export type GroupMember = typeof groupMembers.$inferSelect;
export type NewGroupMember = typeof groupMembers.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

export type ExpenseSplit = typeof expenseSplits.$inferSelect;
export type NewExpenseSplit = typeof expenseSplits.$inferInsert;

export type Settlement = typeof settlements.$inferSelect;
export type NewSettlement = typeof settlements.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
