import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Users table - stores user account information
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp" }),
  image: text("image"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Accounts table - stores OAuth account information
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
});

/**
 * Sessions table - stores user session information
 */
export const sessions = sqliteTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

/**
 * Verification tokens table - stores email verification tokens
 */
export const verificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

/**
 * Groups table - stores expense sharing groups
 */
export const groups = sqliteTable("groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  currency: text("currency").notNull().default("USD"),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  archivedAt: integer("archived_at", { mode: "timestamp" }),
  inviteCode: text("invite_code").unique(),
});

/**
 * Group members table - stores group membership information
 */
export const groupMembers = sqliteTable("group_members", {
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
    .default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Expenses table - stores expense records
 */
export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  groupId: text("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  amount: integer("amount").notNull(), // Stored in cents
  currency: text("currency").notNull().default("USD"),
  paidBy: text("paid_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  category: text("category"),
  date: integer("date", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  attachmentUrl: text("attachment_url"),
  receiptUrl: text("receipt_url"),
});

/**
 * Settlements table - stores debt settlement records
 */
export const settlements = sqliteTable("settlements", {
  id: text("id").primaryKey(),
  groupId: text("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  fromUserId: text("from_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  toUserId: text("to_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // Stored in cents
  currency: text("currency").notNull().default("USD"),
  status: text("status", { enum: ["pending", "completed", "cancelled"] })
    .notNull()
    .default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

/**
 * Activity log table - tracks all activities for audit trail
 */
export const activityLog = sqliteTable("activity_log", {
  id: text("id").primaryKey(),
  groupId: text("group_id").references(() => groups.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  metadata: text("metadata"), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Type exports for TypeScript
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
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type Settlement = typeof settlements.$inferSelect;
export type NewSettlement = typeof settlements.$inferInsert;
export type ActivityLog = typeof activityLog.$inferSelect;
export type NewActivityLog = typeof activityLog.$inferInsert;
