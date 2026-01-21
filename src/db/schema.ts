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
  password: text("password"), // Hashed password for credentials auth
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Sessions table - for NextAuth session management
 */
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  sessionToken: text("sessionToken").notNull().unique(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

/**
 * Accounts table - for OAuth provider linking
 */
export const accounts = sqliteTable("accounts", {
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => ({
  compoundKey: {
    columns: [account.provider, account.providerAccountId],
  },
}));

/**
 * Verification tokens table - for email verification
 */
export const verificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
}, (vt) => ({
  compoundKey: {
    columns: [vt.identifier, vt.token],
  },
}));

/**
 * Groups table - stores expense sharing groups
 */
export const groups = sqliteTable("groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  currency: text("currency").notNull().default("USD"),
  createdBy: text("createdBy")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Group members table - many-to-many relationship between users and groups
 */
export const groupMembers = sqliteTable("group_members", {
  groupId: text("groupId")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // "admin" or "member"
  joinedAt: integer("joinedAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (member) => ({
  compoundKey: {
    columns: [member.groupId, member.userId],
  },
}));

/**
 * Expenses table - stores individual expenses
 */
export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  groupId: text("groupId")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  payerId: text("payerId")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  amount: integer("amount").notNull(), // Amount in cents (integer)
  description: text("description").notNull(),
  date: integer("date", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Expense splits table - stores how expenses are split among users
 */
export const expenseSplits = sqliteTable("expense_splits", {
  expenseId: text("expenseId")
    .notNull()
    .references(() => expenses.id, { onDelete: "cascade" }),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // Amount this person owes (in cents)
}, (split) => ({
  compoundKey: {
    columns: [split.expenseId, split.userId],
  },
}));

/**
 * Settlements table - records of payments between users
 */
export const settlements = sqliteTable("settlements", {
  id: text("id").primaryKey(),
  groupId: text("groupId")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  fromUserId: text("fromUserId")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  toUserId: text("toUserId")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  amount: integer("amount").notNull(), // Amount paid (in cents)
  notes: text("notes"),
  date: integer("date", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});
