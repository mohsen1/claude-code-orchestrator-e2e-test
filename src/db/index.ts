/**
 * Database module entry point
 * Exports all models, schemas, and migration utilities
 */

// Schema
export * from './schema';

// Migration utilities
export { getDatabase, closeDatabase, resetDatabase, migrateUp, migrateDown } from './migrate';

// Models
export { createUserModel, UserModel } from './models/users';
export { createGroupModel, GroupModel } from './models/groups';
export { createExpenseModel, ExpenseModel } from './models/expenses';

// Re-export commonly used types
export type { User, Group, GroupMember, Expense, ExpenseSplit } from './schema';
export type { GroupMemberWithUser, GroupWithMemberCount } from './models/groups';
export type { ExpenseWithSplits, ExpenseSplitWithUser, UserBalance } from './models/expenses';
