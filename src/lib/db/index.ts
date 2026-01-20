import Database from 'better-sqlite3';
import { readdirSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  User,
  Group,
  GroupMember,
  Expense,
  ExpenseSplit,
  Settlement,
  Session,
  Balance,
  createSchema,
  dropSchema,
} from './schema';

// Database singleton
let db: Database.Database | null = null;

// Ensure data directory exists
function ensureDataDir(): string {
  const dataDir = join(process.cwd(), 'data');
  try {
    readdirSync(dataDir);
  } catch {
    mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
}

// Get database instance
export function getDb(): Database.Database {
  if (!db) {
    const dataDir = ensureDataDir();
    const dbPath = join(dataDir, 'expenses.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');

    // Initialize schema
    createSchema(db);
  }
  return db;
}

// Close database connection
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// Reset database (drop all tables and recreate)
export function resetDb(): void {
  const database = getDb();
  dropSchema(database);
  createSchema(database);
}

// ==================== User Queries ====================

export function createUser(user: Omit<User, 'created_at' | 'updated_at'>): User {
  const db = getDb();
  const now = Date.now();
  const stmt = db.prepare(`
    INSERT INTO users (id, email, name, password, google_id, avatar_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(user.id, user.email, user.name, user.password ?? null, user.google_id ?? null, user.avatar_url ?? null, now, now);
  return { ...user, created_at: now, updated_at: now };
}

export function getUserById(id: string): User | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}

export function getUserByEmail(email: string): User | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | undefined;
}

export function getUserByGoogleId(googleId: string): User | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE google_id = ?');
  return stmt.get(googleId) as User | undefined;
}

export function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): User | undefined {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.password !== undefined) { fields.push('password = ?'); values.push(updates.password); }
  if (updates.avatar_url !== undefined) { fields.push('avatar_url = ?'); values.push(updates.avatar_url); }

  if (fields.length === 0) return getUserById(id);

  fields.push('updated_at = ?');
  values.push(Date.now());
  values.push(id);

  const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  return getUserById(id);
}

export function deleteUser(id: string): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  stmt.run(id);
}

export function getAllUsers(): User[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
  return stmt.all() as User[];
}

// ==================== Group Queries ====================

export function createGroup(group: Omit<Group, 'created_at' | 'updated_at'>): Group {
  const db = getDb();
  const now = Date.now();
  const stmt = db.prepare(`
    INSERT INTO groups (id, name, description, currency, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(group.id, group.name, group.description ?? null, group.currency, group.created_by, now, now);

  // Add creator as owner
  addGroupMember(group.id, group.created_by, 'owner');

  return { ...group, created_at: now, updated_at: now };
}

export function getGroupById(id: string): Group | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM groups WHERE id = ?');
  return stmt.get(id) as Group | undefined;
}

export function updateGroup(id: string, updates: Partial<Omit<Group, 'id' | 'created_by' | 'created_at' | 'updated_at'>>): Group | undefined {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
  if (updates.currency !== undefined) { fields.push('currency = ?'); values.push(updates.currency); }

  if (fields.length === 0) return getGroupById(id);

  fields.push('updated_at = ?');
  values.push(Date.now());
  values.push(id);

  const stmt = db.prepare(`UPDATE groups SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  return getGroupById(id);
}

export function deleteGroup(id: string): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM groups WHERE id = ?');
  stmt.run(id);
}

export function getGroupsByUserId(userId: string): Group[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT g.* FROM groups g
    INNER JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = ?
    ORDER BY g.updated_at DESC
  `);
  return stmt.all(userId) as Group[];
}

// ==================== Group Member Queries ====================

export function addGroupMember(groupId: string, userId: string, role: GroupMember['role'] = 'member'): GroupMember {
  const db = getDb();
  const now = Date.now();
  const stmt = db.prepare(`
    INSERT INTO group_members (group_id, user_id, role, joined_at)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(groupId, userId, role, now);
  return { group_id: groupId, user_id: userId, role, joined_at: now };
}

export function removeGroupMember(groupId: string, userId: string): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?');
  stmt.run(groupId, userId);
}

export function updateGroupMemberRole(groupId: string, userId: string, role: GroupMember['role']): void {
  const db = getDb();
  const stmt = db.prepare('UPDATE group_members SET role = ? WHERE group_id = ? AND user_id = ?');
  stmt.run(role, groupId, userId);
}

export function getGroupMembers(groupId: string): (GroupMember & User)[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT gm.*, u.id, u.email, u.name, u.avatar_url
    FROM group_members gm
    INNER JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = ?
    ORDER BY gm.joined_at ASC
  `);
  return stmt.all(groupId) as any[];
}

export function isGroupMember(groupId: string, userId: string): boolean {
  const db = getDb();
  const stmt = db.prepare('SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?');
  return !!stmt.get(groupId, userId);
}

// ==================== Expense Queries ====================

export function createExpense(expense: Omit<Expense, 'created_at' | 'updated_at'>, splits: Omit<ExpenseSplit, 'expense_id'>[]): Expense {
  const db = getDb();
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO expenses (id, group_id, description, amount, currency, paid_by, category, expense_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    expense.id,
    expense.group_id,
    expense.description,
    expense.amount,
    expense.currency,
    expense.paid_by,
    expense.category ?? null,
    expense.expense_date,
    now,
    now
  );

  // Add splits
  const splitStmt = db.prepare(`
    INSERT INTO expense_splits (expense_id, user_id, amount, percentage)
    VALUES (?, ?, ?, ?)
  `);
  for (const split of splits) {
    splitStmt.run(expense.id, split.user_id, split.amount, split.percentage);
  }

  return { ...expense, created_at: now, updated_at: now };
}

export function getExpenseById(id: string): Expense | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM expenses WHERE id = ?');
  return stmt.get(id) as Expense | undefined;
}

export function updateExpense(id: string, updates: Partial<Omit<Expense, 'id' | 'group_id' | 'created_at' | 'updated_at'>>): Expense | undefined {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
  if (updates.amount !== undefined) { fields.push('amount = ?'); values.push(updates.amount); }
  if (updates.currency !== undefined) { fields.push('currency = ?'); values.push(updates.currency); }
  if (updates.paid_by !== undefined) { fields.push('paid_by = ?'); values.push(updates.paid_by); }
  if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
  if (updates.expense_date !== undefined) { fields.push('expense_date = ?'); values.push(updates.expense_date); }

  if (fields.length === 0) return getExpenseById(id);

  fields.push('updated_at = ?');
  values.push(Date.now());
  values.push(id);

  const stmt = db.prepare(`UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  return getExpenseById(id);
}

export function deleteExpense(id: string): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM expenses WHERE id = ?');
  stmt.run(id);
}

export function getExpensesByGroupId(groupId: string): Expense[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM expenses WHERE group_id = ? ORDER BY expense_date DESC');
  return stmt.all(groupId) as Expense[];
}

export function getExpensesByUserId(userId: string): Expense[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM expenses WHERE paid_by = ? ORDER BY expense_date DESC');
  return stmt.all(userId) as Expense[];
}

// ==================== Expense Split Queries ====================

export function getExpenseSplits(expenseId: string): (ExpenseSplit & User)[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT es.*, u.name, u.email, u.avatar_url
    FROM expense_splits es
    INNER JOIN users u ON es.user_id = u.id
    WHERE es.expense_id = ?
  `);
  return stmt.all(expenseId) as any[];
}

export function updateExpenseSplits(expenseId: string, splits: Omit<ExpenseSplit, 'expense_id'>[]): void {
  const db = getDb();

  // Delete existing splits
  const deleteStmt = db.prepare('DELETE FROM expense_splits WHERE expense_id = ?');
  deleteStmt.run(expenseId);

  // Insert new splits
  const insertStmt = db.prepare(`
    INSERT INTO expense_splits (expense_id, user_id, amount, percentage)
    VALUES (?, ?, ?, ?)
  `);
  for (const split of splits) {
    insertStmt.run(expenseId, split.user_id, split.amount, split.percentage);
  }
}

// ==================== Settlement Queries ====================

export function createSettlement(settlement: Omit<Settlement, 'created_at' | 'updated_at'>): Settlement {
  const db = getDb();
  const now = Date.now();
  const stmt = db.prepare(`
    INSERT INTO settlements (id, group_id, from_user_id, to_user_id, amount, currency, status, settled_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    settlement.id,
    settlement.group_id,
    settlement.from_user_id,
    settlement.to_user_id,
    settlement.amount,
    settlement.currency,
    settlement.status,
    settlement.settled_at ?? null,
    now,
    now
  );
  return { ...settlement, created_at: now, updated_at: now };
}

export function getSettlementById(id: string): Settlement | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM settlements WHERE id = ?');
  return stmt.get(id) as Settlement | undefined;
}

export function updateSettlement(id: string, updates: Partial<Omit<Settlement, 'id' | 'group_id' | 'created_at' | 'updated_at'>>): Settlement | undefined {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.amount !== undefined) { fields.push('amount = ?'); values.push(updates.amount); }
  if (updates.currency !== undefined) { fields.push('currency = ?'); values.push(updates.currency); }
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
  if (updates.settled_at !== undefined) { fields.push('settled_at = ?'); values.push(updates.settled_at); }

  if (fields.length === 0) return getSettlementById(id);

  fields.push('updated_at = ?');
  values.push(Date.now());
  values.push(id);

  const stmt = db.prepare(`UPDATE settlements SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  return getSettlementById(id);
}

export function markSettlementAsCompleted(id: string): Settlement | undefined {
  return updateSettlement(id, { status: 'completed', settled_at: Date.now() });
}

export function getSettlementsByGroupId(groupId: string): Settlement[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM settlements WHERE group_id = ? ORDER BY created_at DESC');
  return stmt.all(groupId) as Settlement[];
}

export function getPendingSettlementsByUserId(userId: string): Settlement[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM settlements
    WHERE status = 'pending' AND (from_user_id = ? OR to_user_id = ?)
    ORDER BY created_at DESC
  `);
  return stmt.all(userId, userId) as Settlement[];
}

export function deleteSettlement(id: string): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM settlements WHERE id = ?');
  stmt.run(id);
}

// ==================== Balance Queries ====================

export function calculateGroupBalances(groupId: string): Balance[] {
  const db = getDb();

  // Get all members
  const membersStmt = db.prepare('SELECT user_id FROM group_members WHERE group_id = ?');
  const members = membersStmt.all(groupId) as { user_id: string }[];

  const balances: Record<string, number> = {};
  for (const member of members) {
    balances[member.user_id] = 0;
  }

  // Calculate balances from expenses
  const expensesStmt = db.prepare(`
    SELECT es.user_id, es.amount
    FROM expense_splits es
    INNER JOIN expenses e ON es.expense_id = e.id
    WHERE e.group_id = ?
  `);
  const expenseSplits = expensesStmt.all(groupId) as { user_id: string; amount: number }[];

  for (const split of expenseSplits) {
    if (balances[split.user_id] !== undefined) {
      balances[split.user_id] -= split.amount;
    }
  }

  // Add what people paid
  const paymentsStmt = db.prepare(`
    SELECT paid_by, SUM(amount) as total_paid
    FROM expenses
    WHERE group_id = ?
    GROUP BY paid_by
  `);
  const payments = paymentsStmt.all(groupId) as { paid_by: string; total_paid: number }[];

  for (const payment of payments) {
    if (balances[payment.paid_by] !== undefined) {
      balances[payment.paid_by] += payment.total_paid;
    }
  }

  // Convert to array
  return Object.entries(balances).map(([user_id, balance]) => ({
    group_id: groupId,
    user_id,
    balance
  }));
}

export function getUserBalanceInGroup(groupId: string, userId: string): number {
  const balances = calculateGroupBalances(groupId);
  const userBalance = balances.find(b => b.user_id === userId);
  return userBalance?.balance ?? 0;
}

// ==================== Session Queries ====================

export function createSession(session: Omit<Session, 'created_at'>): Session {
  const db = getDb();
  const now = Date.now();
  const stmt = db.prepare(`
    INSERT INTO sessions (id, user_id, session_token, expires, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(session.id, session.user_id, session.session_token, session.expires, now);
  return { ...session, created_at: now };
}

export function getSessionByToken(token: string): (Session & User) | undefined {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT s.*, u.email, u.name, u.avatar_url
    FROM sessions s
    INNER JOIN users u ON s.user_id = u.id
    WHERE s.session_token = ? AND s.expires > ?
  `);
  return stmt.get(token, Date.now()) as any;
}

export function deleteSession(id: string): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM sessions WHERE id = ?');
  stmt.run(id);
}

export function deleteSessionsByUserId(userId: string): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM sessions WHERE user_id = ?');
  stmt.run(userId);
}

export function deleteExpiredSessions(): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM sessions WHERE expires <= ?');
  stmt.run(Date.now());
}

export function getSessionByUserId(userId: string): Session[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM sessions WHERE user_id = ? AND expires > ?');
  return stmt.all(userId, Date.now()) as Session[];
}

// ==================== Utility Functions ====================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function transaction<T>(fn: () => T): T {
  const db = getDb();
  return db.transaction(fn)();
}

// Export types
export type {
  User,
  Group,
  GroupMember,
  Expense,
  ExpenseSplit,
  Settlement,
  Session,
  Balance,
};
