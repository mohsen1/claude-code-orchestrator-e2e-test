import Database from 'better-sqlite3';
import { Group, CreateGroupInput, UpdateGroupInput } from './types';
import { UserModel } from './User';

export class GroupModel {
  constructor(private db: Database.Database) {
    this.initializeTable();
    this.initializeMembersTable();
  }

  private initializeTable(): void {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by)
    `;

    this.db.exec(createTableQuery);
    this.db.exec(createIndexQuery);
  }

  private initializeMembersTable(): void {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS group_members (
        group_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (group_id, user_id),
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id)
    `;

    this.db.exec(createTableQuery);
    this.db.exec(createIndexQuery);
  }

  create(input: CreateGroupInput): Group {
    const id = this.generateId();

    const stmt = this.db.prepare(`
      INSERT INTO groups (id, name, description, created_by)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(id, input.name, input.description || null, input.created_by);

    // Automatically add the creator as a member
    this.addMember(id, input.created_by);

    return this.findById(id)!;
  }

  findById(id: string): Group | null {
    const stmt = this.db.prepare('SELECT * FROM groups WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToGroup(row) : null;
  }

  findByCreator(userId: string, limit: number = 100, offset: number = 0): Group[] {
    const stmt = this.db.prepare(`
      SELECT * FROM groups
      WHERE created_by = ?
      LIMIT ? OFFSET ?
    `);
    const rows = stmt.all(userId, limit, offset) as any[];
    return rows.map(row => this.mapRowToGroup(row));
  }

  findAll(limit: number = 100, offset: number = 0): Group[] {
    const stmt = this.db.prepare('SELECT * FROM groups LIMIT ? OFFSET ?');
    const rows = stmt.all(limit, offset) as any[];
    return rows.map(row => this.mapRowToGroup(row));
  }

  update(id: string, input: UpdateGroupInput): Group | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      values.push(input.name);
    }
    if (input.description !== undefined) {
      updates.push('description = ?');
      values.push(input.description);
    }

    if (updates.length === 0) return existing;

    values.push(id);
    const stmt = this.db.prepare(`
      UPDATE groups
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM groups WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Member management
  addMember(groupId: string, userId: string): boolean {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO group_members (group_id, user_id)
        VALUES (?, ?)
      `);
      stmt.run(groupId, userId);
      return true;
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        return false; // Already a member
      }
      throw error;
    }
  }

  removeMember(groupId: string, userId: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM group_members
      WHERE group_id = ? AND user_id = ?
    `);
    const result = stmt.run(groupId, userId);
    return result.changes > 0;
  }

  getMembers(groupId: string): string[] {
    const stmt = this.db.prepare(`
      SELECT user_id FROM group_members
      WHERE group_id = ?
      ORDER BY joined_at ASC
    `);
    const rows = stmt.all(groupId) as any[];
    return rows.map(row => row.user_id);
  }

  isMember(groupId: string, userId: string): boolean {
    const stmt = this.db.prepare(`
      SELECT 1 FROM group_members
      WHERE group_id = ? AND user_id = ?
      LIMIT 1
    `);
    const result = stmt.get(groupId, userId);
    return !!result;
  }

  getUserGroups(userId: string, limit: number = 100, offset: number = 0): Group[] {
    const stmt = this.db.prepare(`
      SELECT g.* FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ?
      ORDER BY g.created_at DESC
      LIMIT ? OFFSET ?
    `);
    const rows = stmt.all(userId, limit, offset) as any[];
    return rows.map(row => this.mapRowToGroup(row));
  }

  getMemberCount(groupId: string): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM group_members
      WHERE group_id = ?
    `);
    const result = stmt.get(groupId) as any;
    return result.count;
  }

  private mapRowToGroup(row: any): Group {
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      created_by: row.created_by,
      created_at: new Date(row.created_at)
    };
  }

  private generateId(): string {
    return `grp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
