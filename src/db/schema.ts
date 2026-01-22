import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp' }),
  image: text('image'),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// Accounts table (NextAuth)
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// Sessions table (NextAuth)
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  sessionToken: text('sessionToken').notNull().unique(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// Verification tokens table
export const verificationTokens = sqliteTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().primaryKey(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

// Groups table
export const groups = sqliteTable('groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  currency: text('currency').notNull().default('USD'),
  createdBy: text('createdBy')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('active'), // active, archived, deleted
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  archivedAt: integer('archivedAt', { mode: 'timestamp' }),
  deletedAt: integer('deletedAt', { mode: 'timestamp' }),
});

// Group members table
export const groupMembers = sqliteTable('group_members', {
  id: text('id').primaryKey(),
  groupId: text('groupId')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('member'), // admin, member
  joinedAt: integer('joinedAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  invitedBy: text('invitedBy').references(() => users.id),
  leftAt: integer('leftAt', { mode: 'timestamp' }),
});

// Invite links table
export const inviteLinks = sqliteTable('invite_links', {
  id: text('id').primaryKey(),
  groupId: text('groupId')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  createdBy: text('createdBy')
    .notNull()
    .references(() => users.id),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  maxUses: integer('maxUses'), // null means unlimited
  useCount: integer('useCount').notNull().default(0),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// Expenses table
export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  groupId: text('groupId')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  amount: integer('amount').notNull(), // stored in cents
  currency: text('currency').notNull().default('USD'),
  paidBy: text('paidBy')
    .notNull()
    .references(() => users.id),
  category: text('category').notNull().default('other'),
  date: integer('date', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  splitType: text('splitType').notNull().default('equal'), // equal, exact, percentage, custom
  receiptUrl: text('receiptUrl'),
  notes: text('notes'),
  createdBy: text('createdBy')
    .notNull()
    .references(() => users.id),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// Expense splits table
export const expenseSplits = sqliteTable('expense_splits', {
  id: text('id').primaryKey(),
  expenseId: text('expenseId')
    .notNull()
    .references(() => expenses.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => users.id),
  amount: integer('amount').notNull(), // cents - the amount this user owes
  percentage: integer('percentage'), // for percentage-based splits
  paid: integer('paid', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// Settlements table
export const settlements = sqliteTable('settlements', {
  id: text('id').primaryKey(),
  groupId: text('groupId')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  fromUserId: text('fromUserId')
    .notNull()
    .references(() => users.id),
  toUserId: text('toUserId')
    .notNull()
    .references(() => users.id),
  amount: integer('amount').notNull(), // cents
  currency: text('currency').notNull().default('USD'),
  status: text('status').notNull().default('pending'), // pending, completed, cancelled
  completedAt: integer('completedAt', { mode: 'timestamp' }),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// Group activity log table
export const groupActivity = sqliteTable('group_activity', {
  id: text('id').primaryKey(),
  groupId: text('groupId')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // group_created, member_joined, expense_added, etc.
  userId: text('userId').references(() => users.id),
  data: text('data'), // JSON string with additional data
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// Notifications table
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // expense_added, settlement_created, member_joined, etc.
  title: text('title').notNull(),
  message: text('message').notNull(),
  groupId: text('groupId').references(() => groups.id),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// Type exports for use in the app
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
export type GroupMember = typeof groupMembers.$inferSelect;
export type NewGroupMember = typeof groupMembers.$inferInsert;
export type InviteLink = typeof inviteLinks.$inferSelect;
export type NewInviteLink = typeof inviteLinks.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type ExpenseSplit = typeof expenseSplits.$inferSelect;
export type NewExpenseSplit = typeof expenseSplits.$inferInsert;
export type Settlement = typeof settlements.$inferSelect;
export type NewSettlement = typeof settlements.$inferInsert;
export type GroupActivity = typeof groupActivity.$inferSelect;
export type NewGroupActivity = typeof groupActivity.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
