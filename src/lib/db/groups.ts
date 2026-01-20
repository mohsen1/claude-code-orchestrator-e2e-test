import Database from 'better-sqlite3';
import { Group, GroupMember } from '@/types';

export class GroupsDB {
  constructor(private db: Database.Database) {
    this.initTables();
  }

  private initTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        currency TEXT DEFAULT 'USD',
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS group_members (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        balance REAL DEFAULT 0,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(group_id, user_id)
      );

      CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
      CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
      CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
    `);
  }

  // Group operations
  insertGroup(group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Group {
    const id = group.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO groups (id, name, description, currency, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      group.name,
      group.description || null,
      group.currency || 'USD',
      group.createdBy,
      now,
      now
    );

    // Add the creator as a member with admin role
    this.addMember({
      groupId: id,
      userId: group.createdBy,
      role: 'admin',
      balance: 0
    });

    return {
      id,
      name: group.name,
      description: group.description || null,
      currency: group.currency || 'USD',
      createdBy: group.createdBy,
      createdAt: now,
      updatedAt: now
    };
  }

  findGroupById(id: string): Group | null {
    const stmt = this.db.prepare('SELECT * FROM groups WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      currency: row.currency,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  findGroupsByUserId(userId: string): Group[] {
    const stmt = this.db.prepare(`
      SELECT g.* FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ?
      ORDER BY g.created_at DESC
    `);
    const rows = stmt.all(userId) as any[];

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      currency: row.currency,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  updateGroup(id: string, updates: Partial<Omit<Group, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>): Group | null {
    const existing = this.findGroupById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.currency !== undefined) {
      fields.push('currency = ?');
      values.push(updates.currency);
    }

    if (fields.length === 0) return existing;

    fields.push('updated_at = ?');
    const now = new Date().toISOString();
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE groups
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.findGroupById(id);
  }

  deleteGroup(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM groups WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Group member operations
  addMember(member: Omit<GroupMember, 'id' | 'joinedAt'> & { id?: string }): GroupMember {
    const id = member.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO group_members (id, group_id, user_id, role, balance, joined_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      member.groupId,
      member.userId,
      member.role || 'member',
      member.balance || 0,
      now
    );

    return {
      id,
      groupId: member.groupId,
      userId: member.userId,
      role: member.role || 'member',
      balance: member.balance || 0,
      joinedAt: now
    };
  }

  findMembersByGroupId(groupId: string): GroupMember[] {
    const stmt = this.db.prepare(`
      SELECT * FROM group_members
      WHERE group_id = ?
      ORDER BY joined_at ASC
    `);
    const rows = stmt.all(groupId) as any[];

    return rows.map(row => ({
      id: row.id,
      groupId: row.group_id,
      userId: row.user_id,
      role: row.role,
      balance: row.balance,
      joinedAt: row.joined_at
    }));
  }

  findMemberByGroupAndUser(groupId: string, userId: string): GroupMember | null {
    const stmt = this.db.prepare(`
      SELECT * FROM group_members
      WHERE group_id = ? AND user_id = ?
    `);
    const row = stmt.get(groupId, userId) as any;

    if (!row) return null;

    return {
      id: row.id,
      groupId: row.group_id,
      userId: row.user_id,
      role: row.role,
      balance: row.balance,
      joinedAt: row.joined_at
    };
  }

  updateMemberBalance(groupId: string, userId: string, balance: number): GroupMember | null {
    const stmt = this.db.prepare(`
      UPDATE group_members
      SET balance = ?
      WHERE group_id = ? AND user_id = ?
    `);

    stmt.run(balance, groupId, userId);

    return this.findMemberByGroupAndUser(groupId, userId);
  }

  updateMemberRole(groupId: string, userId: string, role: 'admin' | 'member'): GroupMember | null {
    const stmt = this.db.prepare(`
      UPDATE group_members
      SET role = ?
      WHERE group_id = ? AND user_id = ?
    `);

    stmt.run(role, groupId, userId);

    return this.findMemberByGroupAndUser(groupId, userId);
  }

  removeMember(groupId: string, userId: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM group_members
      WHERE group_id = ? AND user_id = ?
    `);
    const result = stmt.run(groupId, userId);
    return result.changes > 0;
  }

  isMember(groupId: string, userId: string): boolean {
    const stmt = this.db.prepare(`
      SELECT 1 FROM group_members
      WHERE group_id = ? AND user_id = ?
    `);
    const row = stmt.get(groupId, userId);
    return !!row;
  }

  isAdmin(groupId: string, userId: string): boolean {
    const stmt = this.db.prepare(`
      SELECT 1 FROM group_members
      WHERE group_id = ? AND user_id = ? AND role = 'admin'
    `);
    const row = stmt.get(groupId, userId);
    return !!row;
  }
}
