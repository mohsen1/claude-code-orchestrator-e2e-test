import { getDb, initializeDatabase, closeDb } from './init';
import { migrateUp, getMigrationStatus } from './migrate';

// Re-export database functions
export { getDb, initializeDatabase, closeDb, migrateUp, getMigrationStatus };

// Types for database entities
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  password_hash?: string;
  created_at: number;
  updated_at: number;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  currency: string;
  created_by: string;
  created_at: number;
  updated_at: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: number;
}

export interface Expense {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  currency: string;
  paid_by: string;
  category?: string;
  expense_date: number;
  created_at: number;
  updated_at: number;
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  percentage?: number;
}

export interface Balance {
  id: string;
  group_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  updated_at: number;
}

export interface Settlement {
  id: string;
  group_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  settled_at: number;
  created_at: number;
}

export interface GroupWithMembers extends Group {
  members: (GroupMember & { user: User })[];
}

export interface ExpenseWithSplits extends Expense {
  splits: (ExpenseSplit & { user: User })[];
  paid_by_user: User;
}

/**
 * User operations
 */
export const userOps = {
  create: (user: Omit<User, 'created_at' | 'updated_at'>) => {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO users (id, email, name, image, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(user.id, user.email, user.name, user.image || null, user.password_hash || null);
  },

  findById: (id: string) => {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  },

  findByEmail: (email: string) => {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | undefined;
  },

  update: (id: string, updates: Partial<Omit<User, 'id' | 'created_at'>>) => {
    const db = getDb();
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) return;

    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const stmt = db.prepare(`UPDATE users SET ${setClause}, updated_at = strftime('%s', 'now') WHERE id = ?`);
    return stmt.run(...values, id);
  },

  delete: (id: string) => {
    const db = getDb();
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    return stmt.run(id);
  },
};

/**
 * Group operations
 */
export const groupOps = {
  create: (group: Omit<Group, 'created_at' | 'updated_at'>) => {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO groups (id, name, description, currency, created_by)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(group.id, group.name, group.description || null, group.currency, group.created_by);
  },

  findById: (id: string): Group | undefined => {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM groups WHERE id = ?');
    return stmt.get(id) as Group | undefined;
  },

  findByCreator: (creatorId: string): Group[] => {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM groups WHERE created_by = ? ORDER BY created_at DESC');
    return stmt.all(creatorId) as Group[];
  },

  update: (id: string, updates: Partial<Omit<Group, 'id' | 'created_at' | 'created_by'>>) => {
    const db = getDb();
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) return;

    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const stmt = db.prepare(`UPDATE groups SET ${setClause}, updated_at = strftime('%s', 'now') WHERE id = ?`);
    return stmt.run(...values, id);
  },

  delete: (id: string) => {
    const db = getDb();
    const stmt = db.prepare('DELETE FROM groups WHERE id = ?');
    return stmt.run(id);
  },

  getMembers: (groupId: string): (GroupMember & { user: User })[] => {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT gm.*, u.id as user_id, u.email, u.name, u.image, u.password_hash, u.created_at, u.updated_at
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
      ORDER BY gm.joined_at
    `);
    return stmt.all(groupId) as (GroupMember & { user: User })[];
  },

  addMember: (member: Omit<GroupMember, 'joined_at'>) => {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO group_members (id, group_id, user_id)
      VALUES (?, ?, ?)
    `);
    return stmt.run(member.id, member.group_id, member.user_id);
  },

  removeMember: (groupId: string, userId: string) => {
    const db = getDb();
    const stmt = db.prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?');
    return stmt.run(groupId, userId);
  },

  isMember: (groupId: string, userId: string): boolean => {
    const db = getDb();
    const stmt = db.prepare('SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?');
    return !!stmt.get(groupId, userId);
  },
};

/**
 * Expense operations
 */
export const expenseOps = {
  create: (expense: Omit<Expense, 'created_at' | 'updated_at'>) => {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO expenses (id, group_id, description, amount, currency, paid_by, category, expense_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      expense.id,
      expense.group_id,
      expense.description,
      expense.amount,
      expense.currency,
      expense.paid_by,
      expense.category || null,
      expense.expense_date
    );
  },

  findById: (id: string): Expense | undefined => {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM expenses WHERE id = ?');
    return stmt.get(id) as Expense | undefined;
  },

  findByGroup: (groupId: string): Expense[] => {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM expenses WHERE group_id = ? ORDER BY expense_date DESC');
    return stmt.all(groupId) as Expense[];
  },

  update: (id: string, updates: Partial<Omit<Expense, 'id' | 'created_at'>>) => {
    const db = getDb();
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) return;

    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const stmt = db.prepare(`UPDATE expenses SET ${setClause}, updated_at = strftime('%s', 'now') WHERE id = ?`);
    return stmt.run(...values, id);
  },

  delete: (id: string) => {
    const db = getDb();
    const stmt = db.prepare('DELETE FROM expenses WHERE id = ?');
    return stmt.run(id);
  },

  createSplit: (split: Omit<ExpenseSplit, 'id'>) => {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO expense_splits (id, expense_id, user_id, amount, percentage)
      VALUES (?, ?, ?, ?, ?)
    `);
    const id = `${split.expense_id}-${split.user_id}`;
    return stmt.run(id, split.expense_id, split.user_id, split.amount, split.percentage || null);
  },

  getSplits: (expenseId: string): (ExpenseSplit & { user: User })[] => {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT es.*, u.id as user_id, u.email, u.name, u.image
      FROM expense_splits es
      JOIN users u ON es.user_id = u.id
      WHERE es.expense_id = ?
    `);
    return stmt.all(expenseId) as (ExpenseSplit & { user: User })[];
  },

  deleteSplits: (expenseId: string) => {
    const db = getDb();
    const stmt = db.prepare('DELETE FROM expense_splits WHERE expense_id = ?');
    return stmt.run(expenseId);
  },
};

/**
 * Balance operations
 */
export const balanceOps = {
  upsert: (balance: Omit<Balance, 'id' | 'updated_at'>) => {
    const db = getDb();
    const id = `${balance.group_id}-${balance.from_user_id}-${balance.to_user_id}`;

    const stmt = db.prepare(`
      INSERT INTO balances (id, group_id, from_user_id, to_user_id, amount)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(group_id, from_user_id, to_user_id)
      DO UPDATE SET amount = excluded.amount, updated_at = strftime('%s', 'now')
    `);
    return stmt.run(id, balance.group_id, balance.from_user_id, balance.to_user_id, balance.amount);
  },

  findByGroup: (groupId: string): Balance[] => {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM balances WHERE group_id = ? AND amount != 0');
    return stmt.all(groupId) as Balance[];
  },

  findByUsers: (groupId: string, fromUserId: string, toUserId: string): Balance | undefined => {
    const db = getDb();
    const stmt = db.prepare(
      'SELECT * FROM balances WHERE group_id = ? AND from_user_id = ? AND to_user_id = ?'
    );
    return stmt.get(groupId, fromUserId, toUserId) as Balance | undefined;
  },

  delete: (groupId: string, fromUserId: string, toUserId: string) => {
    const db = getDb();
    const stmt = db.prepare(
      'DELETE FROM balances WHERE group_id = ? AND from_user_id = ? AND to_user_id = ?'
    );
    return stmt.run(groupId, fromUserId, toUserId);
  },
};

/**
 * Settlement operations
 */
export const settlementOps = {
  create: (settlement: Omit<Settlement, 'created_at'>) => {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO settlements (id, group_id, from_user_id, to_user_id, amount, settled_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      settlement.id,
      settlement.group_id,
      settlement.from_user_id,
      settlement.to_user_id,
      settlement.amount,
      settlement.settled_at
    );
  },

  findById: (id: string): Settlement | undefined => {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM settlements WHERE id = ?');
    return stmt.get(id) as Settlement | undefined;
  },

  findByGroup: (groupId: string, limit = 50): Settlement[] => {
    const db = getDb();
    const stmt = db.prepare(
      'SELECT * FROM settlements WHERE group_id = ? ORDER BY settled_at DESC LIMIT ?'
    );
    return stmt.all(groupId, limit) as Settlement[];
  },

  findByUser: (userId: string): Settlement[] => {
    const db = getDb();
    const stmt = db.prepare(
      'SELECT * FROM settlements WHERE from_user_id = ? OR to_user_id = ? ORDER BY settled_at DESC'
    );
    return stmt.all(userId, userId) as Settlement[];
  },
};

/**
 * Initialize database on import (if not already initialized)
 */
let initialized = false;
export function ensureInitialized(): void {
  if (!initialized) {
    try {
      initializeDatabase();
      migrateUp(getDb());
      initialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }
}
