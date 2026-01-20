import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'expense-sharing.db');
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
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS group_members (
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    paid_by INTEGER NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (paid_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS expense_splits (
    expense_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    PRIMARY KEY (expense_id, user_id),
    FOREIGN KEY (expense_id) REFERENCES expenses(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS settlements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    from_user INTEGER NOT NULL,
    to_user INTEGER NOT NULL,
    amount REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (from_user) REFERENCES users(id),
    FOREIGN KEY (to_user) REFERENCES users(id)
  );
`);

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

// Get all groups for a user
export function getUserGroups(userId: number): Group[] {
  const stmt = db.prepare(`
    SELECT DISTINCT g.*
    FROM groups g
    INNER JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = ?
    ORDER BY g.created_at DESC
  `);
  return stmt.all(userId) as Group[];
}

// Get group by ID
export function getGroupById(groupId: number): Group | undefined {
  const stmt = db.prepare('SELECT * FROM groups WHERE id = ?');
  return stmt.get(groupId) as Group | undefined;
}

// Create a new group
export function createGroup(name: string, createdBy: number): Group {
  const stmt = db.prepare(`
    INSERT INTO groups (name, created_by)
    VALUES (?, ?)
  `);
  const result = stmt.run(name, createdBy);

  // Add creator as first member
  addGroupMember(result.lastInsertRowid as number, createdBy);

  return getGroupById(result.lastInsertRowid as number) as Group;
}

// Update a group
export function updateGroup(groupId: number, name: string): Group | undefined {
  const stmt = db.prepare(`
    UPDATE groups
    SET name = ?
    WHERE id = ?
  `);
  stmt.run(name, groupId);
  return getGroupById(groupId);
}

// Delete a group
export function deleteGroup(groupId: number): boolean {
  const stmt = db.prepare('DELETE FROM groups WHERE id = ?');
  const result = stmt.run(groupId);
  return result.changes > 0;
}

// Get all members of a group
export function getGroupMembers(groupId: number): number[] {
  const stmt = db.prepare('SELECT user_id FROM group_members WHERE group_id = ?');
  const rows = stmt.all(groupId) as { user_id: number }[];
  return rows.map(row => row.user_id);
}

// Add a member to a group
export function addGroupMember(groupId: number, userId: number): boolean {
  try {
    const stmt = db.prepare(`
      INSERT INTO group_members (group_id, user_id)
      VALUES (?, ?)
    `);
    stmt.run(groupId, userId);
    return true;
  } catch (error) {
    // Unique constraint violation
    return false;
  }
}

// Remove a member from a group
export function removeGroupMember(groupId: number, userId: number): boolean {
  const stmt = db.prepare(`
    DELETE FROM group_members
    WHERE group_id = ? AND user_id = ?
  `);
  const result = stmt.run(groupId, userId);
  return result.changes > 0;
}

// Check if user is a member of a group
export function isGroupMember(groupId: number, userId: number): boolean {
  const stmt = db.prepare(`
    SELECT 1 FROM group_members
    WHERE group_id = ? AND user_id = ?
  `);
  const result = stmt.get(groupId, userId);
  return !!result;
}

// Get group with members info
export function getGroupWithMembers(groupId: number): { group: Group; members: number[] } | undefined {
  const group = getGroupById(groupId);
  if (!group) return undefined;

  const members = getGroupMembers(groupId);

  return {
    group,
    members
  };
}

export default db;
