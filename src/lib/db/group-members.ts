import Database from 'better-sqlite3';
import { generateId } from '../utils';

export type MemberRole = 'admin' | 'member';

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
}

export interface MemberWithUser extends GroupMember {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export class GroupMembersDB {
  constructor(private db: Database.Database) {
    this.initTable();
  }

  private initTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS group_members (
        id TEXT PRIMARY KEY,
        groupId TEXT NOT NULL,
        userId TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        joinedAt TEXT NOT NULL,
        FOREIGN KEY (groupId) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(groupId, userId)
      )
    `);

    // Create indexes for faster lookups
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_group_members_groupId
      ON group_members(groupId)
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_group_members_userId
      ON group_members(userId)
    `);
  }

  addMember(data: Omit<GroupMember, 'id' | 'joinedAt'>): GroupMember {
    const member: GroupMember = {
      id: generateId(),
      ...data,
      joinedAt: new Date().toISOString(),
    };

    const stmt = this.db.prepare(`
      INSERT INTO group_members (id, groupId, userId, role, joinedAt)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(member.id, member.groupId, member.userId, member.role, member.joinedAt);

    return member;
  }

  findByGroupId(groupId: string): MemberWithUser[] {
    const stmt = this.db.prepare(`
      SELECT
        gm.*,
        u.id as "userId",
        u.name as "userName",
        u.email as "userEmail",
        u.image as "userImage"
      FROM group_members gm
      INNER JOIN users u ON gm.userId = u.id
      WHERE gm.groupId = ?
      ORDER BY gm.joinedAt ASC
    `);

    const rows = stmt.all(groupId) as any[];
    return rows.map(row => ({
      id: row.id,
      groupId: row.groupId,
      userId: row.userId,
      role: row.role,
      joinedAt: row.joinedAt,
      user: {
        id: row.userId,
        name: row.userName,
        email: row.userEmail,
        image: row.userImage,
      },
    }));
  }

  findByGroupAndUser(groupId: string, userId: string): GroupMember | null {
    const stmt = this.db.prepare(`
      SELECT * FROM group_members
      WHERE groupId = ? AND userId = ?
    `);

    const row = stmt.get(groupId, userId) as any;
    return row ? this.mapRowToMember(row) : null;
  }

  findByUserId(userId: string): GroupMember[] {
    const stmt = this.db.prepare(`
      SELECT * FROM group_members
      WHERE userId = ?
      ORDER BY joinedAt DESC
    `);

    const rows = stmt.all(userId) as any[];
    return rows.map(row => this.mapRowToMember(row));
  }

  updateRole(groupId: string, userId: string, role: MemberRole): GroupMember | null {
    const existing = this.findByGroupAndUser(groupId, userId);
    if (!existing) return null;

    const stmt = this.db.prepare(`
      UPDATE group_members
      SET role = ?
      WHERE groupId = ? AND userId = ?
    `);

    stmt.run(role, groupId, userId);

    return {
      ...existing,
      role,
    };
  }

  removeMember(groupId: string, userId: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM group_members
      WHERE groupId = ? AND userId = ?
    `);

    const result = stmt.run(groupId, userId);
    return result.changes > 0;
  }

  isMember(groupId: string, userId: string): boolean {
    const member = this.findByGroupAndUser(groupId, userId);
    return member !== null;
  }

  isAdmin(groupId: string, userId: string): boolean {
    const member = this.findByGroupAndUser(groupId, userId);
    return member?.role === 'admin';
  }

  getMemberCount(groupId: string): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM group_members
      WHERE groupId = ?
    `);

    const result = stmt.get(groupId) as { count: number };
    return result.count;
  }

  private mapRowToMember(row: any): GroupMember {
    return {
      id: row.id,
      groupId: row.groupId,
      userId: row.userId,
      role: row.role,
      joinedAt: row.joinedAt,
    };
  }
}
