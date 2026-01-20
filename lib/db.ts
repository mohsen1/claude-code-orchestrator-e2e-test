import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'splitwise.db');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection with connection pooling
const db = new Database(dbPath, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
});

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
const schema = fs.readFileSync(path.join(process.cwd(), 'lib', 'schema.sql'), 'utf-8');
schema.split(';').forEach((statement) => {
  const trimmed = statement.trim();
  if (trimmed) {
    db.exec(trimmed);
  }
});

// Type definitions
export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
}

export interface Group {
  id: number;
  name: string;
  created_by: number;
  created_at: string;
}

export interface GroupMember {
  group_id: number;
  user_id: number;
}

export interface Expense {
  id: number;
  group_id: number;
  paid_by: number;
  amount: number;
  description: string | null;
  created_at: string;
}

export interface ExpenseSplit {
  expense_id: number;
  user_id: number;
  amount: number;
}

export interface Settlement {
  id: number;
  group_id: number;
  from_user: number;
  to_user: number;
  amount: number;
  created_at: string;
}

// ============ USER QUERIES ============

export const userQueries = {
  // Create a new user
  create: db.prepare<User, Omit<User, 'id' | 'created_at'>>(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
  ),

  // Find user by email
  findByEmail: db.prepare<Pick<User, 'email' | 'password_hash' | 'id' | 'name' | 'created_at'>, string>(
    'SELECT id, email, password_hash, name, created_at FROM users WHERE email = ?'
  ),

  // Find user by ID
  findById: db.prepare<User, number>(
    'SELECT id, email, password_hash, name, created_at FROM users WHERE id = ?'
  ),

  // Update user
  update: db.prepare<User, Omit<User, 'id' | 'created_at'> & { id: number }>(
    'UPDATE users SET email = ?, password_hash = ?, name = ? WHERE id = ?'
  ),

  // Delete user
  delete: db.prepare<unknown, number>(
    'DELETE FROM users WHERE id = ?'
  ),
};

// ============ GROUP QUERIES ============

export const groupQueries = {
  // Create a new group
  create: db.prepare<Group, Omit<Group, 'id' | 'created_at'>>(
    'INSERT INTO groups (name, created_by) VALUES (?, ?)'
  ),

  // Find group by ID
  findById: db.prepare<Group, number>(
    'SELECT id, name, created_by, created_at FROM groups WHERE id = ?'
  ),

  // Find all groups for a user (where they are a member)
  findByUserId: db.prepare<Group, number>(
    `SELECT DISTINCT g.id, g.name, g.created_by, g.created_at
     FROM groups g
     INNER JOIN group_members gm ON g.id = gm.group_id
     WHERE gm.user_id = ?
     ORDER BY g.created_at DESC`
  ),

  // Find groups created by a user
  findByCreatedBy: db.prepare<Group, number>(
    'SELECT id, name, created_by, created_at FROM groups WHERE created_by = ? ORDER BY created_at DESC'
  ),

  // Update group
  update: db.prepare<Group, Omit<Group, 'created_at'> & { id: number }>(
    'UPDATE groups SET name = ? WHERE id = ?'
  ),

  // Delete group
  delete: db.prepare<unknown, number>(
    'DELETE FROM groups WHERE id = ?'
  ),
};

// ============ GROUP MEMBER QUERIES ============

export const groupMemberQueries = {
  // Add member to group
  add: db.prepare<GroupMember, GroupMember>(
    'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)'
  ),

  // Remove member from group
  remove: db.prepare<unknown, { group_id: number; user_id: number }>(
    'DELETE FROM group_members WHERE group_id = ? AND user_id = ?'
  ),

  // Get all members of a group
  findByGroupId: db.prepare<GroupMember, number>(
    'SELECT group_id, user_id FROM group_members WHERE group_id = ?'
  ),

  // Check if user is a member of a group
  isMember: db.prepare<GroupMember, { group_id: number; user_id: number }>(
    'SELECT group_id, user_id FROM group_members WHERE group_id = ? AND user_id = ?'
  ),

  // Remove all members from a group
  removeAllByGroupId: db.prepare<unknown, number>(
    'DELETE FROM group_members WHERE group_id = ?'
  ),

  // Find all groups a user is a member of
  findGroupsByUserId: db.prepare<GroupMember, number>(
    'SELECT group_id, user_id FROM group_members WHERE user_id = ?'
  ),
};

// ============ EXPENSE QUERIES ============

export const expenseQueries = {
  // Create an expense
  create: db.prepare<Expense, Omit<Expense, 'id' | 'created_at'>>(
    'INSERT INTO expenses (group_id, paid_by, amount, description) VALUES (?, ?, ?, ?)'
  ),

  // Find expense by ID
  findById: db.prepare<Expense, number>(
    'SELECT id, group_id, paid_by, amount, description, created_at FROM expenses WHERE id = ?'
  ),

  // Find all expenses for a group
  findByGroupId: db.prepare<Expense, number>(
    'SELECT id, group_id, paid_by, amount, description, created_at FROM expenses WHERE group_id = ? ORDER BY created_at DESC'
  ),

  // Update expense
  update: db.prepare<Expense, Omit<Expense, 'created_at'> & { id: number }>(
    'UPDATE expenses SET group_id = ?, paid_by = ?, amount = ?, description = ? WHERE id = ?'
  ),

  // Delete expense
  delete: db.prepare<unknown, number>(
    'DELETE FROM expenses WHERE id = ?'
  ),

  // Delete all expenses for a group
  deleteByGroupId: db.prepare<unknown, number>(
    'DELETE FROM expenses WHERE group_id = ?'
  ),
};

// ============ EXPENSE SPLIT QUERIES ============

export const expenseSplitQueries = {
  // Create a split
  create: db.prepare<ExpenseSplit, ExpenseSplit>(
    'INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)'
  ),

  // Create multiple splits
  createMany: db.transaction((splits: Omit<ExpenseSplit, 'expense_id'> & { expense_id: number }[]) => {
    const stmt = db.prepare('INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)');
    for (const split of splits) {
      stmt.run(split.expense_id, split.user_id, split.amount);
    }
  }),

  // Find all splits for an expense
  findByExpenseId: db.prepare<ExpenseSplit, number>(
    'SELECT expense_id, user_id, amount FROM expense_splits WHERE expense_id = ?'
  ),

  // Find all splits for a user in a group
  findByUserAndGroup: db.prepare<ExpenseSplit, { user_id: number; group_id: number }>(
    `SELECT es.expense_id, es.user_id, es.amount
     FROM expense_splits es
     INNER JOIN expenses e ON es.expense_id = e.id
     WHERE es.user_id = ? AND e.group_id = ?`
  ),

  // Delete splits for an expense
  deleteByExpenseId: db.prepare<unknown, number>(
    'DELETE FROM expense_splits WHERE expense_id = ?'
  ),

  // Update a split
  update: db.prepare<ExpenseSplit, ExpenseSplit>(
    'INSERT OR REPLACE INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)'
  ),

  // Delete all splits for a group
  deleteByGroupId: db.prepare<unknown, number>(
    `DELETE FROM expense_splits
     WHERE expense_id IN (
       SELECT id FROM expenses WHERE group_id = ?
     )`
  ),
};

// ============ SETTLEMENT QUERIES ============

export const settlementQueries = {
  // Create a settlement
  create: db.prepare<Settlement, Omit<Settlement, 'id' | 'created_at'>>(
    'INSERT INTO settlements (group_id, from_user, to_user, amount) VALUES (?, ?, ?, ?)'
  ),

  // Find settlement by ID
  findById: db.prepare<Settlement, number>(
    'SELECT id, group_id, from_user, to_user, amount, created_at FROM settlements WHERE id = ?'
  ),

  // Find all settlements for a group
  findByGroupId: db.prepare<Settlement, number>(
    'SELECT id, group_id, from_user, to_user, amount, created_at FROM settlements WHERE group_id = ? ORDER BY created_at DESC'
  ),

  // Find settlements between two users in a group
  findBetweenUsers: db.prepare<Settlement, { group_id: number; from_user: number; to_user: number }>(
    `SELECT id, group_id, from_user, to_user, amount, created_at
     FROM settlements
     WHERE group_id = ? AND from_user = ? AND to_user = ?`
  ),

  // Find all settlements for a user (as debtor or creditor)
  findByUserId: db.prepare<Settlement, number>(
    `SELECT id, group_id, from_user, to_user, amount, created_at
     FROM settlements
     WHERE from_user = ? OR to_user = ?
     ORDER BY created_at DESC`
  ),

  // Delete settlement
  delete: db.prepare<unknown, number>(
    'DELETE FROM settlements WHERE id = ?'
  ),

  // Delete all settlements for a group
  deleteByGroupId: db.prepare<unknown, number>(
    'DELETE FROM settlements WHERE group_id = ?'
  ),

  // Get total amount paid by from_user to to_user in a group
  getTotalPaid: db.prepare<{ total: number }, { group_id: number; from_user: number; to_user: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total
     FROM settlements
     WHERE group_id = ? AND from_user = ? AND to_user = ?`
  ),
};

// ============ HELPER FUNCTIONS ============

/**
 * Get a group with all its members
 */
export function getGroupWithMembers(groupId: number): Group & { members: User[] } | null {
  const group = groupQueries.findById.get(groupId);
  if (!group) return null;

  const membersStmt = db.prepare<User, number>(
    `SELECT u.id, u.email, u.name, u.created_at
     FROM users u
     INNER JOIN group_members gm ON u.id = gm.user_id
     WHERE gm.group_id = ?`
  );
  const members = membersStmt.all(groupId);

  return { ...group, members };
}

/**
 * Get an expense with all its splits and payer details
 */
export function getExpenseWithSplits(expenseId: number): Expense & { splits: Array<ExpenseSplit & { user: User }>; payer: User } | null {
  const expense = expenseQueries.findById.get(expenseId);
  if (!expense) return null;

  const payer = userQueries.findById.get(expense.paid_by);
  if (!payer) return null;

  const splits = expenseSplitQueries.findByExpenseId.all(expenseId);
  const splitsWithUsers = splits.map((split) => {
    const user = userQueries.findById.get(split.user_id);
    return { ...split, user: user! };
  });

  return { ...expense, splits: splitsWithUsers, payer };
}

/**
 * Get all expenses for a group with splits and payer details
 */
export function getGroupExpensesWithDetails(groupId: number): Array<Expense & { splits: Array<ExpenseSplit & { user: User }>; payer: User }> {
  const expenses = expenseQueries.findByGroupId.all(groupId);
  return expenses.map((expense) => {
    const payer = userQueries.findById.get(expense.paid_by);
    const splits = expenseSplitQueries.findByExpenseId.all(expense.id);
    const splitsWithUsers = splits.map((split) => {
      const user = userQueries.findById.get(split.user_id);
      return { ...split, user: user! };
    });
    return { ...expense, splits: splitsWithUsers, payer: payer! };
  });
}

/**
 * Calculate balances for a user in a group
 */
export function getUserBalanceInGroup(userId: number, groupId: number): number {
  // Amount paid by user (they're owed this)
  const paidStmt = db.prepare<{ total: number }, { user_id: number; group_id: number }>(
    `SELECT COALESCE(SUM(e.amount), 0) as total
     FROM expenses e
     WHERE e.paid_by = ? AND e.group_id = ?`
  );
  const paid = paidStmt.get({ user_id: userId, group_id: groupId })?.total || 0;

  // Amount user owes (from splits)
  const owesStmt = db.prepare<{ total: number }, { user_id: number; group_id: number }>(
    `SELECT COALESCE(SUM(es.amount), 0) as total
     FROM expense_splits es
     INNER JOIN expenses e ON es.expense_id = e.id
     WHERE es.user_id = ? AND e.group_id = ?`
  );
  const owes = owesStmt.get({ user_id: userId, group_id: groupId })?.total || 0;

  // Amount settled (paid to others)
  const settledPaidStmt = db.prepare<{ total: number }, { user_id: number; group_id: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total
     FROM settlements
     WHERE from_user = ? AND group_id = ?`
  );
  const settledPaid = settledPaidStmt.get({ user_id: userId, group_id: groupId })?.total || 0;

  // Amount settled (received from others)
  const settledReceivedStmt = db.prepare<{ total: number }, { user_id: number; group_id: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total
     FROM settlements
     WHERE to_user = ? AND group_id = ?`
  );
  const settledReceived = settledReceivedStmt.get({ user_id: userId, group_id: groupId })?.total || 0;

  // Positive = they're owed money, Negative = they owe money
  return paid - owes - settledPaid + settledReceived;
}

/**
 * Get all balances for a group (who owes whom)
 */
export function getGroupBalances(groupId: number): Array<{
  user: User;
  balance: number;
}> {
  const members = groupMemberQueries.findByGroupId.all(groupId);
  return members.map((member) => {
    const user = userQueries.findById.get(member.user_id);
    const balance = getUserBalanceInGroup(member.user_id, groupId);
    return { user: user!, balance };
  });
}

/**
 * Create a group with members in a transaction
 */
export function createGroupWithMembers(name: string, createdBy: number, memberIds: number[]): Group {
  return db.transaction(() => {
    const group = groupQueries.create.run({ name, created_by: createdBy });
    const groupId = group.lastInsertRowid as number;

    // Add creator as a member
    groupMemberQueries.add.run({ group_id: groupId, user_id: createdBy });

    // Add other members
    const addStmt = db.prepare('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)');
    for (const userId of memberIds) {
      if (userId !== createdBy) {
        addStmt.run(groupId, userId);
      }
    }

    return groupQueries.findById.get(groupId)!;
  })();
}

/**
 * Create an expense with splits in a transaction
 */
export function createExpenseWithSplits(
  groupId: number,
  paidBy: number,
  amount: number,
  description: string | null,
  splits: Array<{ user_id: number; amount: number }>
): Expense {
  return db.transaction(() => {
    const expense = expenseQueries.create.run({
      group_id: groupId,
      paid_by: paidBy,
      amount,
      description,
    });
    const expenseId = expense.lastInsertRowid as number;

    const addSplitStmt = db.prepare('INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)');
    for (const split of splits) {
      addSplitStmt.run(expenseId, split.user_id, split.amount);
    }

    return expenseQueries.findById.get(expenseId)!;
  })();
}

/**
 * Delete a group and all related data
 */
export function deleteGroupCascade(groupId: number): void {
  return db.transaction(() => {
    groupMemberQueries.removeAllByGroupId.run(groupId);
    expenseQueries.deleteByGroupId.run(groupId);
    settlementQueries.deleteByGroupId.run(groupId);
    groupQueries.delete.run(groupId);
  })();
}

/**
 * Close database connection (for cleanup)
 */
export function closeDatabase(): void {
  db.close();
}

// Export the database instance for raw queries if needed
export { db };
