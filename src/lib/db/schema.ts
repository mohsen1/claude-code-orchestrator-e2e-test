export const schema = {
  // Users table for authentication and profile
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password TEXT,
      google_id TEXT UNIQUE,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,

  // Sessions table for NextAuth
  sessions: `
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires DATETIME NOT NULL,
      session_token TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `,

  // Accounts table for NextAuth (OAuth providers)
  accounts: `
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(provider, provider_account_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `,

  // Verification tokens for email confirmation
  verification_tokens: `
    CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL,
      expires DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (identifier, token)
    );
  `,

  // Expense groups (houses, trips, etc.)
  groups: `
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      currency TEXT DEFAULT 'USD',
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );
  `,

  // Group members
  group_members: `
    CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT DEFAULT 'member',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(group_id, user_id),
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `,

  // Expenses
  expenses: `
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      paid_by INTEGER NOT NULL,
      expense_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      category TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (paid_by) REFERENCES users(id)
    );
  `,

  // Expense splits (how expenses are divided among members)
  expense_splits: `
    CREATE TABLE IF NOT EXISTS expense_splits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expense_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      percentage REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(expense_id, user_id),
      FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `,

  // Payments/settlements between users
  payments: `
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (from_user_id) REFERENCES users(id),
      FOREIGN KEY (to_user_id) REFERENCES users(id)
    );
  `,

  // Group invitations
  invitations: `
    CREATE TABLE IF NOT EXISTS invitations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      invited_by INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      token TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      accepted_at DATETIME,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (invited_by) REFERENCES users(id)
    );
  `,

  // Balance snapshots for historical tracking
  balances: `
    CREATE TABLE IF NOT EXISTS balances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      balance REAL DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(group_id, user_id),
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `,

  // Activity log for group events
  activity_log: `
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `,
};

// Indexes for better query performance
export const indexes = {
  users_email: `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
  users_google_id: `CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);`,

  sessions_user_id: `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);`,
  sessions_expires: `CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires);`,

  accounts_user_id: `CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);`,
  accounts_provider: `CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider, provider_account_id);`,

  groups_created_by: `CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);`,

  group_members_group_id: `CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);`,
  group_members_user_id: `CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);`,

  expenses_group_id: `CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);`,
  expenses_paid_by: `CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);`,
  expenses_date: `CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);`,

  expense_splits_expense_id: `CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id ON expense_splits(expense_id);`,
  expense_splits_user_id: `CREATE INDEX IF NOT EXISTS idx_expense_splits_user_id ON expense_splits(user_id);`,

  payments_group_id: `CREATE INDEX IF NOT EXISTS idx_payments_group_id ON payments(group_id);`,
  payments_from_user: `CREATE INDEX IF NOT EXISTS idx_payments_from_user ON payments(from_user_id);`,
  payments_to_user: `CREATE INDEX IF NOT EXISTS idx_payments_to_user ON payments(to_user_id);`,
  payments_status: `CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);`,

  invitations_group_id: `CREATE INDEX IF NOT EXISTS idx_invitations_group_id ON invitations(group_id);`,
  invitations_token: `CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);`,
  invitations_email: `CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);`,

  balances_group_id: `CREATE INDEX IF NOT EXISTS idx_balances_group_id ON balances(group_id);`,
  balances_user_id: `CREATE INDEX IF NOT EXISTS idx_balances_user_id ON balances(user_id);`,

  activity_log_group_id: `CREATE INDEX IF NOT EXISTS idx_activity_log_group_id ON activity_log(group_id);`,
  activity_log_created_at: `CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);`,
};

// Triggers for automatic timestamp updates
export const triggers = {
  users_updated_at: `
    CREATE TRIGGER IF NOT EXISTS update_users_timestamp
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
      UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `,

  groups_updated_at: `
    CREATE TRIGGER IF NOT EXISTS update_groups_timestamp
    AFTER UPDATE ON groups
    FOR EACH ROW
    BEGIN
      UPDATE groups SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `,

  expenses_updated_at: `
    CREATE TRIGGER IF NOT EXISTS update_expenses_timestamp
    AFTER UPDATE ON expenses
    FOR EACH ROW
    BEGIN
      UPDATE expenses SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `,

  balances_last_updated: `
    CREATE TRIGGER IF NOT EXISTS update_balances_timestamp
    AFTER UPDATE ON balances
    FOR EACH ROW
    BEGIN
      UPDATE balances SET last_updated = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `,
};
