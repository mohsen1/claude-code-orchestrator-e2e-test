/**
 * Drizzle ORM Schema Base
 * This file will be extended by the database expert (EM)
 * with the complete database schema for SplitSync
 */

import { sqliteTable, text, integer, unique, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Users table
 * Stores authentication and profile information
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Accounts table
 * Stores OAuth provider information (NextAuth.js)
 */
export const accounts = sqliteTable("accounts", {
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (table) => ({
  pk: primaryKey({ columns: [table.provider, table.providerAccountId] })
}));

/**
 * Sessions table
 * Stores user sessions (NextAuth.js)
 */
export const sessions = sqliteTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

/**
 * Groups table
 * Stores expense sharing groups
 */
export const groups = sqliteTable("groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Group Members table
 * Junction table for users and groups (many-to-many)
 */
export const groupMembers = sqliteTable(
  "group_members",
  {
    id: text("id").primaryKey(),
    groupId: text("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["admin", "member"] })
      .notNull()
      .default("member"),
    joinedAt: integer("joined_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    uniqueGroupUser: unique("unique_group_user").on(table.groupId, table.userId),
  })
);

/**
 * Expenses table
 * Stores individual expenses
 * Amount is stored in cents (integer) to avoid floating point issues
 */
export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  groupId: text("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  amount: integer("amount").notNull().check(sql`amount > 0`), // Amount in cents
  paidBy: text("paid_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  expenseDate: integer("expense_date", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Expense Splits table
 * Stores how each expense is split among group members
 * For MVP, all splits are equal (will be extended in future)
 */
export const expenseSplits = sqliteTable(
  "expense_splits",
  {
    id: text("id").primaryKey(),
    expenseId: text("expense_id")
      .notNull()
      .references(() => expenses.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull().$defaultFn(() => 0), // Amount in cents (>= 0)
  },
  (table) => ({
    uniqueExpenseUser: unique("unique_expense_user_split").on(table.expenseId, table.userId),
  })
);

/**
 * Settlements table
 * Stores completed settlements between users
 */
export const settlements = sqliteTable("settlements", {
  id: text("id").primaryKey(),
  groupId: text("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  fromUserId: text("from_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  toUserId: text("to_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  amount: integer("amount").notNull().$defaultFn(() => 0), // Amount in cents (>= 0)
  settledAt: integer("settled_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
}, (table) => ({
  checkDifferentUsers: sql`from_user_id != to_user_id`,
}));

/**
 * Verification Tokens table
 * Stores email verification tokens (NextAuth.js)
 */
export const verificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.identifier, table.token] })
}));

// Type exports for use in other files
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type GroupMember = typeof groupMembers.$inferSelect;
export type NewGroupMember = typeof groupMembers.$inferInsert;
export type ExpenseSplit = typeof expenseSplits.$inferSelect;
export type NewExpenseSplit = typeof expenseSplits.$inferInsert;
export type Settlement = typeof settlements.$inferSelect;
export type NewSettlement = typeof settlements.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
