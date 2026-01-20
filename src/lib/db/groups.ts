import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

export interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: number;
  updated_at: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  status: 'active' | 'pending' | 'removed';
  joined_at: number;
  updated_at: number;
}

export interface GroupInvitation {
  id: string;
  group_id: string;
  email: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: number;
  expires_at: number;
  updated_at: number;
}

export interface CreateGroupInput {
  name: string;
  description?: string;
  created_by: string;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
}

export class GroupsDatabase {
  constructor(private db: Database.Database) {
    this.initializeTables();
  }

  private initializeTables() {
    // Groups table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_by TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_groups_created_at ON groups(created_at)`);

    // Group members table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS group_members (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        status TEXT NOT NULL DEFAULT 'active',
        joined_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(group_id, user_id)
      )
    `);

    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_group_members_status ON group_members(status)`);

    // Group invitations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS group_invitations (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        email TEXT NOT NULL,
        invited_by TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(group_id, email, status)
      )
    `);

    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_group_invitations_group_id ON group_invitations(group_id)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_group_invitations_email ON group_invitations(email)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_group_invitations_status ON group_invitations(status)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_group_invitations_expires_at ON group_invitations(expires_at)`);
  }

  // Group CRUD operations
  createGroup(input: CreateGroupInput): Group {
    const now = Date.now();
    const group: Group = {
      id: randomUUID(),
      name: input.name,
      description: input.description,
      created_by: input.created_by,
      created_at: now,
      updated_at: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO groups (id, name, description, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(group.id, group.name, group.description, group.created_by, group.created_at, group.updated_at);

    // Automatically add the creator as an admin member
    this.addMember(group.id, group.created_by, 'admin');

    return group;
  }

  getGroupById(id: string): Group | null {
    const stmt = this.db.prepare('SELECT * FROM groups WHERE id = ?');
    return stmt.get(id) as Group | null;
  }

  getGroupsByUserId(userId: string): Group[] {
    const stmt = this.db.prepare(`
      SELECT g.* FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ? AND gm.status = 'active'
      ORDER BY g.updated_at DESC
    `);
    return stmt.all(userId) as Group[];
  }

  updateGroup(id: string, input: UpdateGroupInput): Group | null {
    const existing = this.getGroupById(id);
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

    updates.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE groups SET ${updates.join(', ')} WHERE id = ?
    `);
    stmt.run(...values);

    return this.getGroupById(id);
  }

  deleteGroup(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM groups WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Member management operations
  addMember(groupId: string, userId: string, role: 'admin' | 'member' = 'member'): GroupMember {
    const now = Date.now();
    const member: GroupMember = {
      id: randomUUID(),
      group_id: groupId,
      user_id: userId,
      role,
      status: 'active',
      joined_at: now,
      updated_at: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO group_members (id, group_id, user_id, role, status, joined_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(member.id, member.group_id, member.user_id, member.role, member.status, member.joined_at, member.updated_at);

    return member;
  }

  getGroupMembers(groupId: string): GroupMember[] {
    const stmt = this.db.prepare(`
      SELECT * FROM group_members
      WHERE group_id = ? AND status = 'active'
      ORDER BY joined_at ASC
    `);
    return stmt.all(groupId) as GroupMember[];
  }

  getMemberById(memberId: string): GroupMember | null {
    const stmt = this.db.prepare('SELECT * FROM group_members WHERE id = ?');
    return stmt.get(memberId) as GroupMember | null;
  }

  getGroupMember(groupId: string, userId: string): GroupMember | null {
    const stmt = this.db.prepare(`
      SELECT * FROM group_members
      WHERE group_id = ? AND user_id = ? AND status = 'active'
    `);
    return stmt.get(groupId, userId) as GroupMember | null;
  }

  updateMemberRole(memberId: string, role: 'admin' | 'member'): GroupMember | null {
    const now = Date.now();
    const stmt = this.db.prepare(`
      UPDATE group_members
      SET role = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(role, now, memberId);
    return this.getMemberById(memberId);
  }

  removeMember(groupId: string, userId: string): boolean {
    const now = Date.now();
    const stmt = this.db.prepare(`
      UPDATE group_members
      SET status = 'removed', updated_at = ?
      WHERE group_id = ? AND user_id = ?
    `);
    const result = stmt.run(now, groupId, userId);
    return result.changes > 0;
  }

  isUserMemberOfGroup(groupId: string, userId: string): boolean {
    const member = this.getGroupMember(groupId, userId);
    return member !== null;
  }

  isUserGroupAdmin(groupId: string, userId: string): boolean {
    const member = this.getGroupMember(groupId, userId);
    return member !== null && member.role === 'admin';
  }

  // Invitation operations
  createInvitation(groupId: string, email: string, invitedBy: string, expiresInHours: number = 48): GroupInvitation {
    const now = Date.now();
    const expiresAt = now + (expiresInHours * 60 * 60 * 1000);

    // Check if there's already a pending invitation
    const existing = this.getPendingInvitation(groupId, email);
    if (existing) {
      // Update the existing invitation
      return this.updateInvitation(existing.id, { expires_at: expiresAt });
    }

    const invitation: GroupInvitation = {
      id: randomUUID(),
      group_id: groupId,
      email: email.toLowerCase(),
      invited_by: invitedBy,
      status: 'pending',
      created_at: now,
      expires_at: expiresAt,
      updated_at: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO group_invitations (id, group_id, email, invited_by, status, created_at, expires_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      invitation.id,
      invitation.group_id,
      invitation.email,
      invitation.invited_by,
      invitation.status,
      invitation.created_at,
      invitation.expires_at,
      invitation.updated_at
    );

    return invitation;
  }

  getInvitationById(id: string): GroupInvitation | null {
    const stmt = this.db.prepare('SELECT * FROM group_invitations WHERE id = ?');
    return stmt.get(id) as GroupInvitation | null;
  }

  getPendingInvitation(groupId: string, email: string): GroupInvitation | null {
    const stmt = this.db.prepare(`
      SELECT * FROM group_invitations
      WHERE group_id = ? AND email = ? AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 1
    `);
    return stmt.get(groupId, email.toLowerCase()) as GroupInvitation | null;
  }

  getInvitationsByGroupId(groupId: string): GroupInvitation[] {
    const stmt = this.db.prepare(`
      SELECT * FROM group_invitations
      WHERE group_id = ? AND status = 'pending'
      ORDER BY created_at DESC
    `);
    return stmt.all(groupId) as GroupInvitation[];
  }

  getInvitationsByEmail(email: string): GroupInvitation[] {
    const stmt = this.db.prepare(`
      SELECT * FROM group_invitations
      WHERE email = ? AND status = 'pending'
      ORDER BY created_at DESC
    `);
    return stmt.all(email.toLowerCase()) as GroupInvitation[];
  }

  updateInvitation(id: string, updates: Partial<Pick<GroupInvitation, 'status' | 'expires_at'>>): GroupInvitation | null {
    const existing = this.getInvitationById(id);
    if (!existing) return null;

    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.status !== undefined) {
      setClauses.push('status = ?');
      values.push(updates.status);
    }
    if (updates.expires_at !== undefined) {
      setClauses.push('expires_at = ?');
      values.push(updates.expires_at);
    }

    if (setClauses.length === 0) return existing;

    setClauses.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE group_invitations
      SET ${setClauses.join(', ')}
      WHERE id = ?
    `);
    stmt.run(...values);

    return this.getInvitationById(id);
  }

  acceptInvitation(invitationId: string, userId: string): GroupMember | null {
    const invitation = this.getInvitationById(invitationId);
    if (!invitation || invitation.status !== 'pending') {
      return null;
    }

    // Check if invitation has expired
    if (Date.now() > invitation.expires_at) {
      this.updateInvitation(invitationId, { status: 'expired' });
      return null;
    }

    // Add user as a member
    const member = this.addMember(invitation.group_id, userId, 'member');

    // Update invitation status
    this.updateInvitation(invitationId, { status: 'accepted' });

    return member;
  }

  declineInvitation(invitationId: string): boolean {
    const invitation = this.getInvitationById(invitationId);
    if (!invitation || invitation.status !== 'pending') {
      return false;
    }

    this.updateInvitation(invitationId, { status: 'declined' });
    return true;
  }

  // Cleanup expired invitations
  cleanupExpiredInvitations(): number {
    const now = Date.now();
    const stmt = this.db.prepare(`
      UPDATE group_invitations
      SET status = 'expired', updated_at = ?
      WHERE status = 'pending' AND expires_at < ?
    `);
    const result = stmt.run(now, now);
    return result.changes;
  }

  // Get group statistics
  getGroupStats(groupId: string): { memberCount: number; pendingInvitations: number } {
    const memberStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM group_members
      WHERE group_id = ? AND status = 'active'
    `);
    const memberResult = memberStmt.get(groupId) as { count: number };

    const inviteStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM group_invitations
      WHERE group_id = ? AND status = 'pending'
    `);
    const inviteResult = inviteStmt.get(groupId) as { count: number };

    return {
      memberCount: memberResult.count,
      pendingInvitations: inviteResult.count,
    };
  }
}
