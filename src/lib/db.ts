import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_URL || path.join(dataDir, 'expenses.db');

// Initialize database connection
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
function initializeSchema() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sessions table for NextAuth
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires TEXT NOT NULL,
      session_token TEXT NOT NULL UNIQUE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Accounts table for NextAuth
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(provider, provider_account_id)
    )
  `);

  // Verification tokens for NextAuth
  db.exec(`
    CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL,
      expires TEXT NOT NULL,
      UNIQUE(identifier, token)
    )
  `);

  // Groups table
  db.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Group members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS group_members (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(group_id, user_id)
    )
  `);

  // Expenses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      paid_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Expense splits table
  db.exec(`
    CREATE TABLE IF NOT EXISTS expense_splits (
      id TEXT PRIMARY KEY,
      expense_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(expense_id, user_id)
    )
  `);

  // Balances table
  db.exec(`
    CREATE TABLE IF NOT EXISTS balances (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      owes_user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (owes_user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(group_id, user_id, owes_user_id)
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
    CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
    CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
    CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);
    CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id ON expense_splits(expense_id);
    CREATE INDEX IF NOT EXISTS idx_balances_group_id ON balances(group_id);
  `);
}

// Initialize schema on import
initializeSchema();

// Database helper functions
export const dbHelpers = {
  // User operations
  getUser: (id: string) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  getUserByEmail: (email: string) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  createUser: (user: { id: string; name: string; email: string; image?: string }) => {
    const stmt = db.prepare(
      'INSERT INTO users (id, name, email, image) VALUES (@id, @name, @email, @image)'
    );
    return stmt.run(user);
  },

  // Session operations
  getSession: (sessionToken: string) => {
    const stmt = db.prepare('SELECT * FROM sessions WHERE session_token = ?');
    return stmt.get(sessionToken);
  },

  createSession: (session: {
    id: string;
    user_id: string;
    expires: string;
    session_token: string;
  }) => {
    const stmt = db.prepare(
      'INSERT INTO sessions (id, user_id, expires, session_token) VALUES (@id, @user_id, @expires, @session_token)'
    );
    return stmt.run(session);
  },

  deleteSession: (sessionToken: string) => {
    const stmt = db.prepare('DELETE FROM sessions WHERE session_token = ?');
    return stmt.run(sessionToken);
  },

  // Account operations
  getAccount: (providerAccountId: string, provider: string) => {
    const stmt = db.prepare(
      'SELECT * FROM accounts WHERE provider_account_id = ? AND provider = ?'
    );
    return stmt.get(providerAccountId, provider);
  },

  createAccount: (account: {
    id: string;
    user_id: string;
    provider: string;
    provider_account_id: string;
    refresh_token?: string;
    access_token?: string;
    expires_at?: number;
    token_type?: string;
    scope?: string;
    id_token?: string;
    session_state?: string;
  }) => {
    const stmt = db.prepare(
      'INSERT INTO accounts (id, user_id, provider, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) VALUES (@id, @user_id, @provider, @provider_account_id, @refresh_token, @access_token, @expires_at, @token_type, @scope, @id_token, @session_state)'
    );
    return stmt.run(account);
  },

  // Group operations
  createGroup: (group: {
    id: string;
    name: string;
    description?: string;
    created_by: string;
  }) => {
    const stmt = db.prepare(
      'INSERT INTO groups (id, name, description, created_by) VALUES (@id, @name, @description, @created_by)'
    );
    return stmt.run(group);
  },

  getGroup: (id: string) => {
    const stmt = db.prepare('SELECT * FROM groups WHERE id = ?');
    return stmt.get(id);
  },

  getUserGroups: (userId: string) => {
    const stmt = db.prepare(`
      SELECT g.*, gm.joined_at
      FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ?
      ORDER BY g.created_at DESC
    `);
    return stmt.all(userId);
  },

  addGroupMember: (member: { id: string; group_id: string; user_id: string }) => {
    const stmt = db.prepare(
      'INSERT INTO group_members (id, group_id, user_id) VALUES (@id, @group_id, @user_id)'
    );
    return stmt.run(member);
  },

  getGroupMembers: (groupId: string) => {
    const stmt = db.prepare(`
      SELECT u.*, gm.joined_at
      FROM users u
      INNER JOIN group_members gm ON u.id = gm.user_id
      WHERE gm.group_id = ?
      ORDER BY gm.joined_at ASC
    `);
    return stmt.all(groupId);
  },

  // Expense operations
  createExpense: (expense: {
    id: string;
    group_id: string;
    description: string;
    amount: number;
    paid_by: string;
  }) => {
    const stmt = db.prepare(
      'INSERT INTO expenses (id, group_id, description, amount, paid_by) VALUES (@id, @group_id, @description, @amount, @paid_by)'
    );
    return stmt.run(expense);
  },

  getGroupExpenses: (groupId: string) => {
    const stmt = db.prepare(`
      SELECT e.*, u.name as payer_name, u.email as payer_email
      FROM expenses e
      INNER JOIN users u ON e.paid_by = u.id
      WHERE e.group_id = ?
      ORDER BY e.created_at DESC
    `);
    return stmt.all(groupId);
  },

  createExpenseSplit: (split: { id: string; expense_id: string; user_id: string; amount: number }) => {
    const stmt = db.prepare(
      'INSERT INTO expense_splits (id, expense_id, user_id, amount) VALUES (@id, @expense_id, @user_id, @amount)'
    );
    return stmt.run(split);
  },

  getExpenseSplits: (expenseId: string) => {
    const stmt = db.prepare(`
      SELECT es.*, u.name, u.email
      FROM expense_splits es
      INNER JOIN users u ON es.user_id = u.id
      WHERE es.expense_id = ?
    `);
    return stmt.all(expenseId);
  },

  // Balance operations
  upsertBalance: (balance: {
    id: string;
    group_id: string;
    user_id: string;
    owes_user_id: string;
    amount: number;
  }) => {
    const stmt = db.prepare(`
      INSERT INTO balances (id, group_id, user_id, owes_user_id, amount)
      VALUES (@id, @group_id, @user_id, @owes_user_id, @amount)
      ON CONFLICT(group_id, user_id, owes_user_id)
      DO UPDATE SET amount = @amount, updated_at = CURRENT_TIMESTAMP
    `);
    return stmt.run(balance);
  },

  getUserBalances: (groupId: string, userId: string) => {
    const stmt = db.prepare(`
      SELECT
        b.*,
        owes_user.name as owes_user_name,
        owed_to_user.name as owed_to_user_name
      FROM balances b
      INNER JOIN users owes_user ON b.user_id = owes_user.id
      INNER JOIN users owed_to_user ON b.owes_user_id = owed_to_user.id
      WHERE b.group_id = ? AND (b.user_id = ? OR b.owes_user_id = ?)
    `);
    return stmt.all(groupId, userId, userId);
  },
};

export default db;
