import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface CreateGroupMemberInput {
  group_id: string;
  user_id: string;
  role?: 'admin' | 'member';
}

export class GroupMemberModel {
  private db: Database.Database;

  constructor(database: Database.Database) {
    this.db = database;
    this.initializeTable();
  }

  private initializeTable(): void {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS group_members (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        joined_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CHECK(role IN ('admin', 'member'))
      )
    `;

    this.db.exec(createTableQuery);

    // Create indexes for better query performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_group_members_group_id
      ON group_members(group_id);

      CREATE INDEX IF NOT EXISTS idx_group_members_user_id
      ON group_members(user_id);

      CREATE INDEX IF NOT EXISTS idx_group_members_group_user
      ON group_members(group_id, user_id);
    `);
  }

  create(input: CreateGroupMemberInput): GroupMember {
    const id = uuidv4();
    const joined_at = new Date().toISOString();
    const role = input.role || 'member';

    const stmt = this.db.prepare(`
      INSERT INTO group_members (id, group_id, user_id, role, joined_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, input.group_id, input.user_id, role, joined_at);

    return {
      id,
      group_id: input.group_id,
      user_id: input.user_id,
      role,
      joined_at
    };
  }

  findById(id: string): GroupMember | null {
    const stmt = this.db.prepare(`
      SELECT * FROM group_members WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    return row || null;
  }

  findByGroup(groupId: string): GroupMember[] {
    const stmt = this.db.prepare(`
      SELECT * FROM group_members WHERE group_id = ? ORDER BY joined_at ASC
    `);

    return stmt.all(groupId) as GroupMember[];
  }

  findByUser(userId: string): GroupMember[] {
    const stmt = this.db.prepare(`
      SELECT * FROM group_members WHERE user_id = ? ORDER BY joined_at DESC
    `);

    return stmt.all(userId) as GroupMember[];
  }

  findByGroupAndUser(groupId: string, userId: string): GroupMember | null {
    const stmt = this.db.prepare(`
      SELECT * FROM group_members
      WHERE group_id = ? AND user_id = ?
    `);

    const row = stmt.get(groupId, userId) as any;
    return row || null;
  }

  updateRole(id: string, role: 'admin' | 'member'): GroupMember | null {
    const stmt = this.db.prepare(`
      UPDATE group_members
      SET role = ?
      WHERE id = ?
    `);

    const result = stmt.run(role, id);

    if (result.changes === 0) {
      return null;
    }

    return this.findById(id);
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM group_members WHERE id = ?
    `);

    const result = stmt.run(id);
    return result.changes > 0;
  }

  deleteByGroup(groupId: string): number {
    const stmt = this.db.prepare(`
      DELETE FROM group_members WHERE group_id = ?
    `);

    const result = stmt.run(groupId);
    return result.changes;
  }

  deleteByUser(userId: string): number {
    const stmt = this.db.prepare(`
      DELETE FROM group_members WHERE user_id = ?
    `);

    const result = stmt.run(userId);
    return result.changes;
  }

  isUserAdmin(groupId: string, userId: string): boolean {
    const member = this.findByGroupAndUser(groupId, userId);
    return member?.role === 'admin';
  }

  getMemberCount(groupId: string): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM group_members WHERE group_id = ?
    `);

    const result = stmt.get(groupId) as { count: number };
    return result.count;
  }

  getAll(): GroupMember[] {
    const stmt = this.db.prepare(`
      SELECT * FROM group_members ORDER BY joined_at DESC
    `);

    return stmt.all() as GroupMember[];
  }
}
