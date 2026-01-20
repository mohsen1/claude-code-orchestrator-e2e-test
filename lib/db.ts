import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'data', 'expenses.db');
const db = new Database(dbPath);

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS group_members (
    group_id INTEGER REFERENCES groups(id),
    user_id INTEGER REFERENCES users(id),
    PRIMARY KEY (group_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER REFERENCES groups(id),
    paid_by INTEGER REFERENCES users(id),
    amount REAL NOT NULL,
    description TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS expense_splits (
    expense_id INTEGER REFERENCES expenses(id),
    user_id INTEGER REFERENCES users(id),
    amount REAL NOT NULL,
    PRIMARY KEY (expense_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS settlements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER REFERENCES groups(id),
    from_user INTEGER REFERENCES users(id),
    to_user INTEGER REFERENCES users(id),
    amount REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// User functions
export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
}

export function insertUser(email: string, password_hash: string, name: string): User {
  const stmt = db.prepare(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
  );
  const result = stmt.run(email, password_hash, name);
  return getUserById(result.lastInsertRowid as number)!;
}

export function getUserByEmail(email: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | undefined;
}

export function getUserById(id: number): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}

// Group functions
export interface Group {
  id: number;
  name: string;
  created_by: number;
  created_at: string;
}

export function insertGroup(name: string, created_by: number): Group {
  const stmt = db.prepare(
    'INSERT INTO groups (name, created_by) VALUES (?, ?)'
  );
  const result = stmt.run(name, created_by);
  return getGroupById(result.lastInsertRowid as number)!;
}

export function getGroupById(id: number): Group | undefined {
  const stmt = db.prepare('SELECT * FROM groups WHERE id = ?');
  return stmt.get(id) as Group | undefined;
}

export function getGroupsByUserId(user_id: number): Group[] {
  const stmt = db.prepare(`
    SELECT g.* FROM groups g
    INNER JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = ?
    ORDER BY g.created_at DESC
  `);
  return stmt.all(user_id) as Group[];
}

export function updateGroup(id: number, name: string): Group | undefined {
  const stmt = db.prepare('UPDATE groups SET name = ? WHERE id = ?');
  stmt.run(name, id);
  return getGroupById(id);
}

export function deleteGroup(id: number): void {
  db.prepare('DELETE FROM group_members WHERE group_id = ?').run(id);
  db.prepare('DELETE FROM expenses WHERE group_id = ?').run(id);
  db.prepare('DELETE FROM settlements WHERE group_id = ?').run(id);
  db.prepare('DELETE FROM groups WHERE id = ?').run(id);
}

// Group members functions
export interface GroupMember {
  group_id: number;
  user_id: number;
  user?: User;
}

export function addGroupMember(group_id: number, user_id: number): void {
  const stmt = db.prepare(
    'INSERT OR IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)'
  );
  stmt.run(group_id, user_id);
}

export function removeGroupMember(group_id: number, user_id: number): void {
  const stmt = db.prepare(
    'DELETE FROM group_members WHERE group_id = ? AND user_id = ?'
  );
  stmt.run(group_id, user_id);
}

export function getGroupMembers(group_id: number): GroupMember[] {
  const stmt = db.prepare(`
    SELECT gm.group_id, gm.user_id, u.id, u.email, u.name
    FROM group_members gm
    INNER JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = ?
  `);
  const rows = stmt.all(group_id) as any[];
  return rows.map(row => ({
    group_id: row.group_id,
    user_id: row.user_id,
    user: {
      id: row.id,
      email: row.email,
      name: row.name,
      password_hash: '',
      created_at: ''
    }
  }));
}

// Expense functions
export interface Expense {
  id: number;
  group_id: number;
  paid_by: number;
  amount: number;
  description: string | null;
  date: string;
  created_at: string;
}

export interface ExpenseSplit {
  expense_id: number;
  user_id: number;
  amount: number;
}

export interface ExpenseWithDetails extends Expense {
  payer?: User;
  splits?: (ExpenseSplit & { user?: User })[];
}

export function insertExpense(
  group_id: number,
  paid_by: number,
  amount: number,
  description: string | null,
  date: string
): Expense {
  const stmt = db.prepare(
    'INSERT INTO expenses (group_id, paid_by, amount, description, date) VALUES (?, ?, ?, ?, ?)'
  );
  const result = stmt.run(group_id, paid_by, amount, description, date);
  return getExpenseById(result.lastInsertRowid as number)!;
}

export function getExpenseById(id: number): Expense | undefined {
  const stmt = db.prepare('SELECT * FROM expenses WHERE id = ?');
  return stmt.get(id) as Expense | undefined;
}

export function getExpensesByGroup(group_id: number): ExpenseWithDetails[] {
  const stmt = db.prepare(`
    SELECT e.*,
           u.id as payer_id, u.email as payer_email, u.name as payer_name
    FROM expenses e
    INNER JOIN users u ON e.paid_by = u.id
    WHERE e.group_id = ?
    ORDER BY e.date DESC, e.created_at DESC
  `);
  const expenses = stmt.all(group_id) as any[];

  return expenses.map(exp => {
    const splitsStmt = db.prepare(`
      SELECT es.*, u.id, u.email, u.name
      FROM expense_splits es
      INNER JOIN users u ON es.user_id = u.id
      WHERE es.expense_id = ?
    `);
    const splits = splitsStmt.all(exp.id) as any[];

    return {
      id: exp.id,
      group_id: exp.group_id,
      paid_by: exp.paid_by,
      amount: exp.amount,
      description: exp.description,
      date: exp.date,
      created_at: exp.created_at,
      payer: {
        id: exp.payer_id,
        email: exp.payer_email,
        name: exp.payer_name,
        password_hash: '',
        created_at: ''
      },
      splits: splits.map(s => ({
        expense_id: s.expense_id,
        user_id: s.user_id,
        amount: s.amount,
        user: {
          id: s.id,
          email: s.email,
          name: s.name,
          password_hash: '',
          created_at: ''
        }
      }))
    };
  });
}

export function insertExpenseSplit(expense_id: number, user_id: number, amount: number): void {
  const stmt = db.prepare(
    'INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)'
  );
  stmt.run(expense_id, user_id, amount);
}

export function deleteExpense(expense_id: number): void {
  db.prepare('DELETE FROM expense_splits WHERE expense_id = ?').run(expense_id);
  db.prepare('DELETE FROM expenses WHERE id = ?').run(expense_id);
}

// Settlement functions
export interface Settlement {
  id: number;
  group_id: number;
  from_user: number;
  to_user: number;
  amount: number;
  created_at: string;
}

export function insertSettlement(
  group_id: number,
  from_user: number,
  to_user: number,
  amount: number
): Settlement {
  const stmt = db.prepare(
    'INSERT INTO settlements (group_id, from_user, to_user, amount) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(group_id, from_user, to_user, amount);
  const getStmt = db.prepare('SELECT * FROM settlements WHERE id = ?');
  return getStmt.get(result.lastInsertRowid) as Settlement;
}

export function getSettlementsByGroup(group_id: number): Settlement[] {
  const stmt = db.prepare(
    'SELECT * FROM settlements WHERE group_id = ? ORDER BY created_at DESC'
  );
  return stmt.all(group_id) as Settlement[];
}

export default db;
