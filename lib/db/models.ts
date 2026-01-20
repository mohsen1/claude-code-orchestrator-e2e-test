import Database from 'better-sqlite3';
import path from 'path';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * User representation in the system
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Group of users sharing expenses
 */
export interface Group {
  id: string;
  name: string;
  description?: string;
  currency: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Group membership relationship
 */
export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

/**
 * Types of expense splits
 */
export type SplitType = 'equal' | 'exact' | 'percentage';

/**
 * How an expense is split among participants
 */
export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  percentage?: number;
}

/**
 * Expense categories
 */
export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'entertainment'
  | 'utilities'
  | 'shopping'
  | 'health'
  | 'other';

/**
 * Expense record
 */
export interface Expense {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  paid_by: string;
  split_type: SplitType;
  date: string;
  created_at: string;
  updated_at: string;
  receipt_url?: string;
  notes?: string;
}

/**
 * Balance between two users in a group
 */
export interface Balance {
  id: string;
  group_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  currency: string;
  last_updated: string;
}

/**
 * Settlement transaction
 */
export interface Settlement {
  id: string;
  group_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled';
  method?: string;
  notes?: string;
  created_at: string;
  completed_at?: string;
}

/**
 * Invitation to join a group
 */
export interface GroupInvite {
  id: string;
  group_id: string;
  email: string;
  invited_by: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  expires_at: string;
}

/**
 * Activity log for group events
 */
export interface ActivityLog {
  id: string;
  group_id: string;
  user_id: string;
  action: string;
  entity_type: 'expense' | 'settlement' | 'member' | 'group';
  entity_id?: string;
  details: string;
  created_at: string;
}

/**
 * Complete expense with splits and payer info
 */
export interface ExpenseWithDetails extends Expense {
  splits: ExpenseSplit[];
  payer: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  group: {
    id: string;
    name: string;
  };
}

/**
 * Complete group with members and balances
 */
export interface GroupWithDetails extends Group {
  members: Array<{
    user: User;
    role: 'owner' | 'admin' | 'member';
    joined_at: string;
  }>;
  balances: Balance[];
  total_expenses: number;
}

/**
 * User's balance summary across all groups
 */
export interface UserBalanceSummary {
  group_id: string;
  group_name: string;
  total_owed: number;
  total_owing: number;
  net_balance: number;
  currency: string;
}

/**
 * Settlement suggestion for minimizing transactions
 */
export interface SettlementSuggestion {
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;
  to_user_name: string;
  amount: number;
  currency: string;
}

// ============================================================================
// DATABASE SCHEMA INITIALIZATION
// ============================================================================

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'expenses.db');

let db: Database.Database | null = null;

/**
 * Get or create database instance
 */
export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    require('fs').mkdirSync(dataDir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

/**
 * Initialize database schema
 */
export function initializeSchema(): void {
  const db = getDb();

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      avatar_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Groups table
  db.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      currency TEXT NOT NULL DEFAULT 'USD',
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Group members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS group_members (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('owner', 'admin', 'member')),
      joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(group_id, user_id)
    );
  `);

  // Expenses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      category TEXT NOT NULL DEFAULT 'other' CHECK(category IN ('food', 'transport', 'accommodation', 'entertainment', 'utilities', 'shopping', 'health', 'other')),
      paid_by TEXT NOT NULL,
      split_type TEXT NOT NULL DEFAULT 'equal' CHECK(split_type IN ('equal', 'exact', 'percentage')),
      date TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      receipt_url TEXT,
      notes TEXT,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (paid_by) REFERENCES users(id)
    );
  `);

  // Expense splits table
  db.exec(`
    CREATE TABLE IF NOT EXISTS expense_splits (
      id TEXT PRIMARY KEY,
      expense_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      percentage REAL,
      FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(expense_id, user_id)
    );
  `);

  // Balances table
  db.exec(`
    CREATE TABLE IF NOT EXISTS balances (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'USD',
      last_updated TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(group_id, from_user_id, to_user_id),
      CHECK(from_user_id != to_user_id)
    );
  `);

  // Settlements table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settlements (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'cancelled')),
      method TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
      CHECK(from_user_id != to_user_id)
    );
  `);

  // Group invitations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS group_invites (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      email TEXT NOT NULL,
      invited_by TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('admin', 'member')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined', 'expired')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Activity log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT CHECK(entity_type IN ('expense', 'settlement', 'member', 'group')),
      entity_id TEXT,
      details TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
    CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
    CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id ON expense_splits(expense_id);
    CREATE INDEX IF NOT EXISTS idx_expense_splits_user_id ON expense_splits(user_id);
    CREATE INDEX IF NOT EXISTS idx_balances_group_id ON balances(group_id);
    CREATE INDEX IF NOT EXISTS idx_balances_from_user ON balances(from_user_id);
    CREATE INDEX IF NOT EXISTS idx_balances_to_user ON balances(to_user_id);
    CREATE INDEX IF NOT EXISTS idx_settlements_group_id ON settlements(group_id);
    CREATE INDEX IF NOT EXISTS idx_settlements_from_user ON settlements(from_user_id);
    CREATE INDEX IF NOT EXISTS idx_settlements_to_user ON settlements(to_user_id);
    CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements(status);
    CREATE INDEX IF NOT EXISTS idx_group_invites_group_id ON group_invites(group_id);
    CREATE INDEX IF NOT EXISTS idx_group_invites_email ON group_invites(email);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_group_id ON activity_logs(group_id);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
  `);
}

/**
 * Close database connection
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate amount (positive number)
 */
export function isValidAmount(amount: number): boolean {
  return typeof amount === 'number' && amount > 0 && Number.isFinite(amount);
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Calculate split amounts for an expense
 */
export function calculateSplits(
  totalAmount: number,
  splitType: SplitType,
  participants: Array<{ userId: string; amount?: number; percentage?: number }>
): Array<{ userId: string; amount: number; percentage?: number }> {
  const splits: Array<{ userId: string; amount: number; percentage?: number }> = [];

  switch (splitType) {
    case 'equal':
      const equalShare = totalAmount / participants.length;
      for (const participant of participants) {
        splits.push({
          userId: participant.userId,
          amount: Math.round(equalShare * 100) / 100, // Round to 2 decimal places
        });
      }
      break;

    case 'exact':
      for (const participant of participants) {
        if (participant.amount === undefined) {
          throw new Error(`Exact amount required for user ${participant.userId}`);
        }
        splits.push({
          userId: participant.userId,
          amount: participant.amount,
        });
      }
      break;

    case 'percentage':
      for (const participant of participants) {
        if (participant.percentage === undefined) {
          throw new Error(`Percentage required for user ${participant.userId}`);
        }
        const amount = (totalAmount * participant.percentage) / 100;
        splits.push({
          userId: participant.userId,
          amount: Math.round(amount * 100) / 100,
          percentage: participant.percentage,
        });
      }
      break;
  }

  return splits;
}
