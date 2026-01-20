// Export all tables and types
export * from './users';
export * from './groups';
export * from './expenses';
export * from './settlements';

// Re-export commonly used types
import { users } from './users';
import { groups, groupMembers } from './groups';
import { expenses, expenseSplits } from './expenses';
import { settlements } from './settlements';

// Schema object for Drizzle migrations and queries
export const schema = {
  users,
  groups,
  groupMembers,
  expenses,
  expenseSplits,
  settlements,
};

// Type inference helpers
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
