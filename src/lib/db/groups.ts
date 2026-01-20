/**
 * Database operations for groups, members, and invitations
 * Uses better-sqlite3 with prepared statements for performance
 */

import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import {
  Group,
  GroupMember,
  GroupInvitation,
  CreateGroupDTO,
  UpdateGroupDTO,
  InviteMemberDTO,
  UpdateMemberRoleDTO,
  RespondToInvitationDTO,
  GroupWithMemberCount,
  GroupWithMembers,
  MemberStatus,
  InvitationStatus,
  GroupRole,
} from '../models/Group';

export class GroupDatabase {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.initSchema();
  }

  /**
   * Initialize database schema
   */
  private initSchema(): void {
    const schema = `
      -- Groups table
      CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_by TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        is_archived INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Group members table
      CREATE TABLE IF NOT EXISTS group_members (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        joined_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        status TEXT NOT NULL DEFAULT 'accepted',
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(group_id, user_id)
      );

      -- Group invitations table
      CREATE TABLE IF NOT EXISTS group_invitations (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        invited_by TEXT NOT NULL,
        invitee_email TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        expires_at INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
      CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_group_members_status ON group_members(status);
      CREATE INDEX IF NOT EXISTS idx_group_invitations_group_id ON group_invitations(group_id);
      CREATE INDEX IF NOT EXISTS idx_group_invitations_token ON group_invitations(token);
      CREATE INDEX IF NOT EXISTS idx_group_invitations_email ON group_invitations(invitee_email);
      CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);

      -- Trigger for updated_at
      CREATE TRIGGER IF NOT EXISTS update_groups_timestamp
      AFTER UPDATE ON groups
      BEGIN
        UPDATE groups SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
      END;
    `;

    this.db.exec(schema);
  }

  /**
   * Create a new group
   */
  createGroup(dto: CreateGroupDTO): Group {
    const id = randomUUID();
    const now = Math.floor(Date.now() / 1000);

    const stmt = this.db.prepare(`
      INSERT INTO groups (id, name, description, created_by, created_at, updated_at, is_archived)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `);

    stmt.run(id, dto.name, dto.description || null, dto.created_by, now, now);

    // Add creator as owner
    this.addMember({
      group_id: id,
      user_id: dto.created_by,
      role: 'owner',
      status: 'accepted',
    });

    return this.getGroupById(id)!;
  }

  /**
   * Get group by ID
   */
  getGroupById(id: string): Group | null {
    const stmt = this.db.prepare('SELECT * FROM groups WHERE id = ? AND is_archived = 0');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToGroup(row) : null;
  }

  /**
   * Get group with member count
   */
  getGroupWithMemberCount(id: string): GroupWithMemberCount | null {
    const stmt = this.db.prepare(`
      SELECT
        g.*,
        COUNT(DISTINCT gm.user_id) as member_count
      FROM groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.status = 'accepted'
      WHERE g.id = ? AND g.is_archived = 0
      GROUP BY g.id
    `);
    const row = stmt.get(id) as any;
    return row ? { ...this.mapRowToGroup(row), member_count: row.member_count } : null;
  }

  /**
   * Get groups by user (where user is a member)
   */
  getGroupsByUser(userId: string): GroupWithMemberCount[] {
    const stmt = this.db.prepare(`
      SELECT DISTINCT
        g.*,
        COUNT(DISTINCT gm.user_id) as member_count
      FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ? AND gm.status = 'accepted' AND g.is_archived = 0
      GROUP BY g.id
      ORDER BY g.updated_at DESC
    `);

    const rows = stmt.all(userId) as any[];
    return rows.map(row => ({
      ...this.mapRowToGroup(row),
      member_count: row.member_count,
    }));
  }

  /**
   * Get groups created by user
   */
  getGroupsCreatedByUser(userId: string): Group[] {
    const stmt = this.db.prepare(`
      SELECT * FROM groups
      WHERE created_by = ? AND is_archived = 0
      ORDER BY updated_at DESC
    `);
    const rows = stmt.all(userId) as any[];
    return rows.map(row => this.mapRowToGroup(row));
  }

  /**
   * Update group
   */
  updateGroup(id: string, dto: UpdateGroupDTO): Group | null {
    const updates: string[] = [];
    const values: any[] = [];

    if (dto.name !== undefined) {
      updates.push('name = ?');
      values.push(dto.name);
    }
    if (dto.description !== undefined) {
      updates.push('description = ?');
      values.push(dto.description);
    }
    if (dto.is_archived !== undefined) {
      updates.push('is_archived = ?');
      values.push(dto.is_archived ? 1 : 0);
    }

    if (updates.length === 0) return this.getGroupById(id);

    values.push(id);
    const stmt = this.db.prepare(`
      UPDATE groups
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.getGroupById(id);
  }

  /**
   * Delete group (soft delete by archiving)
   */
  deleteGroup(id: string): boolean {
    const stmt = this.db.prepare('UPDATE groups SET is_archived = 1 WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Add member to group
   */
  addMember(data: {
    group_id: string;
    user_id: string;
    role: GroupRole;
    status: MemberStatus;
  }): GroupMember {
    const id = randomUUID();
    const now = Math.floor(Date.now() / 1000);

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO group_members (id, group_id, user_id, role, joined_at, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, data.group_id, data.user_id, data.role, now, data.status);
    return this.getMemberById(id)!;
  }

  /**
   * Get member by ID
   */
  getMemberById(id: string): GroupMember | null {
    const stmt = this.db.prepare('SELECT * FROM group_members WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToMember(row) : null;
  }

  /**
   * Get members of a group
   */
  getGroupMembers(groupId: string): GroupMember[] {
    const stmt = this.db.prepare(`
      SELECT * FROM group_members
      WHERE group_id = ? AND status = 'accepted'
      ORDER BY role, joined_at
    `);
    const rows = stmt.all(groupId) as any[];
    return rows.map(row => this.mapRowToMember(row));
  }

  /**
   * Get group members with user details
   */
  getGroupMembersWithUsers(groupId: string): Array<GroupMember & { user_name?: string; user_email?: string; user_avatar?: string }> {
    const stmt = this.db.prepare(`
      SELECT
        gm.*,
        u.name as user_name,
        u.email as user_email,
        u.avatar_url as user_avatar
      FROM group_members gm
      INNER JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ? AND gm.status = 'accepted'
      ORDER BY gm.role, gm.joined_at
    `);
    return stmt.all(groupId) as any[];
  }

  /**
   * Update member role
   */
  updateMemberRole(groupId: string, userId: string, role: GroupRole): GroupMember | null {
    const stmt = this.db.prepare(`
      UPDATE group_members
      SET role = ?
      WHERE group_id = ? AND user_id = ?
    `);
    stmt.run(role, groupId, userId);
    return this.getMemberByGroupAndUser(groupId, userId);
  }

  /**
   * Get member by group and user
   */
  getMemberByGroupAndUser(groupId: string, userId: string): GroupMember | null {
    const stmt = this.db.prepare('SELECT * FROM group_members WHERE group_id = ? AND user_id = ?');
    const row = stmt.get(groupId, userId) as any;
    return row ? this.mapRowToMember(row) : null;
  }

  /**
   * Remove member from group
   */
  removeMember(groupId: string, userId: string): boolean {
    const stmt = this.db.prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?');
    const result = stmt.run(groupId, userId);
    return result.changes > 0;
  }

  /**
   * Create invitation
   */
  createInvitation(dto: InviteMemberDTO): GroupInvitation {
    const id = randomUUID();
    const token = randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = dto.expires_in_days || 7;
    const expiresAt = now + (expiresIn * 24 * 60 * 60);

    const stmt = this.db.prepare(`
      INSERT INTO group_invitations (id, group_id, invited_by, invitee_email, status, created_at, expires_at, token)
      VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)
    `);

    stmt.run(id, dto.group_id, dto.invited_by, dto.invitee_email.toLowerCase(), now, expiresAt, token);
    return this.getInvitationById(id)!;
  }

  /**
   * Get invitation by ID
   */
  getInvitationById(id: string): GroupInvitation | null {
    const stmt = this.db.prepare('SELECT * FROM group_invitations WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToInvitation(row) : null;
  }

  /**
   * Get invitation by token
   */
  getInvitationByToken(token: string): GroupInvitation | null {
    const stmt = this.db.prepare('SELECT * FROM group_invitations WHERE token = ?');
    const row = stmt.get(token) as any;
    return row ? this.mapRowToInvitation(row) : null;
  }

  /**
   * Get pending invitations for a group
   */
  getPendingInvitationsForGroup(groupId: string): GroupInvitation[] {
    const stmt = this.db.prepare(`
      SELECT * FROM group_invitations
      WHERE group_id = ? AND status = 'pending' AND expires_at > strftime('%s', 'now')
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(groupId) as any[];
    return rows.map(row => this.mapRowToInvitation(row));
  }

  /**
   * Get invitations for a user (by email)
   */
  getInvitationsForEmail(email: string): GroupInvitation[] {
    const stmt = this.db.prepare(`
      SELECT * FROM group_invitations
      WHERE invitee_email = ? AND status = 'pending' AND expires_at > strftime('%s', 'now')
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(email.toLowerCase()) as any[];
    return rows.map(row => this.mapRowToInvitation(row));
  }

  /**
   * Update invitation status
   */
  updateInvitationStatus(token: string, status: InvitationStatus): GroupInvitation | null {
    const stmt = this.db.prepare('UPDATE group_invitations SET status = ? WHERE token = ?');
    stmt.run(status, token);
    return this.getInvitationByToken(token);
  }

  /**
   * Expire old invitations
   */
  expireOldInvitations(): number {
    const stmt = this.db.prepare(`
      UPDATE group_invitations
      SET status = 'expired'
      WHERE status = 'pending' AND expires_at < strftime('%s', 'now')
    `);
    const result = stmt.run();
    return result.changes;
  }

  /**
   * Check if user is member of group
   */
  isUserMemberOfGroup(groupId: string, userId: string): boolean {
    const stmt = this.db.prepare(`
      SELECT 1 FROM group_members
      WHERE group_id = ? AND user_id = ? AND status = 'accepted'
    `);
    return !!stmt.get(groupId, userId);
  }

  /**
   * Check if user can manage group (owner or admin)
   */
  canUserManageGroup(groupId: string, userId: string): boolean {
    const stmt = this.db.prepare(`
      SELECT 1 FROM group_members
      WHERE group_id = ? AND user_id = ? AND status = 'accepted' AND role IN ('owner', 'admin')
    `);
    return !!stmt.get(groupId, userId);
  }

  /**
   * Get full group detail with members and invitations
   */
  getGroupDetail(groupId: string): GroupWithMembers | null {
    const group = this.getGroupById(groupId);
    if (!group) return null;

    const members = this.getGroupMembersWithUsers(groupId);

    return {
      ...group,
      members,
    };
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }

  // Helper mapping methods
  private mapRowToGroup(row: any): Group {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
      is_archived: row.is_archived === 1,
    };
  }

  private mapRowToMember(row: any): GroupMember {
    return {
      id: row.id,
      group_id: row.group_id,
      user_id: row.user_id,
      role: row.role as GroupRole,
      joined_at: row.joined_at,
      status: row.status as MemberStatus,
    };
  }

  private mapRowToInvitation(row: any): GroupInvitation {
    return {
      id: row.id,
      group_id: row.group_id,
      invited_by: row.invited_by,
      invitee_email: row.invitee_email,
      status: row.status as InvitationStatus,
      created_at: row.created_at,
      expires_at: row.expires_at,
      token: row.token,
    };
  }
}
