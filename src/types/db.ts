import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Users Table
 * Stores user authentication and profile information
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  image: text("image"),
  hashedPassword: text("hashed_password"), // Nullable for OAuth users
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Groups Table
 * Stores expense sharing groups
 */
export const groups = sqliteTable("groups", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull(),
  currency: text("currency").notNull().default("USD"), // ISO 4217 currency code
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Group Members Table
 * Junction table for Users <-> Groups relationship
 */
export const groupMembers = sqliteTable(
  "group_members",
  {
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
    pk: uniqueIndex("group_members_pk").on(table.groupId, table.userId),
  })
);

/**
 * Expenses Table
 * Stores expense records
 * IMPORTANT: Amount is stored in cents/lowest currency unit (integer) to avoid floating point errors
 */
export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(), // UUID
  groupId: text("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  payerId: text("payer_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  amount: integer("amount").notNull(), // Stored in cents (e.g., $10.50 = 1050)
  description: text("description").notNull(),
  date: integer("date", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Expense Splits Table
 * Stores how expenses are split among group members
 * Ensures that sum of splits equals the expense amount
 */
export const expenseSplits = sqliteTable("expense_splits", {
  id: text("id").primaryKey(), // UUID
  expenseId: text("expense_id")
    .notNull()
    .references(() => expenses.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // Stored in cents
});

/**
 * Settlements Table
 * Records payments between users to settle debts
 */
export const settlements = sqliteTable("settlements", {
  id: text("id").primaryKey(), // UUID
  groupId: text("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  fromUserId: text("from_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  toUserId: text("to_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  amount: integer("amount").notNull(), // Stored in cents (must be positive)
  settledAt: integer("settled_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Type Exports
 * Export inferred types from database schema
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

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

/**
 * Relationship Types
 * Useful pre-joined types for API responses
 */
export type GroupWithMembers = Group & {
  members: (GroupMember & { user: User })[];
};

export type ExpenseWithSplits = Expense & {
  splits: (ExpenseSplit & { user: User })[];
  payer: User;
};

export type UserBalance = {
  userId: string;
  user: User;
  balance: number; // In cents, positive = owed money, negative = owes money
};
