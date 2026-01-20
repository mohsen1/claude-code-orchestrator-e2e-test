import db from '@/lib/db';
import { Group, CreateGroupInput, UpdateGroupInput, GroupWithMembers } from '@/lib/types/group';

export class GroupService {
  /**
   * Generate a unique ID for groups
   */
  private generateId(): string {
    return `grp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique ID for group members
   */
  private generateMemberId(): string {
    return `gmem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a new group
   */
  createGroup(input: CreateGroupInput): Group {
    const id = this.generateId();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO groups (id, name, description, currency, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.name,
      input.description || null,
      input.currency || 'USD',
      input.created_by,
      now,
      now
    );

    // Add the creator as an admin member
    this.addMember(id, input.created_by, 'admin');

    return this.getGroupById(id)!;
  }

  /**
   * Get all groups for a user
   */
  getUserGroups(userId: string): GroupWithMembers[] {
    const stmt = db.prepare(`
      SELECT DISTINCT g.*,
        COUNT(gm.user_id) as member_count
      FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ?
      GROUP BY g.id
      ORDER BY g.updated_at DESC
    `);

    const groups = stmt.all(userId) as any[];

    return groups.map(group => ({
      ...group,
      members: this.getGroupMembers(group.id),
      member_count: group.member_count
    }));
  }

  /**
   * Get a single group by ID
   */
  getGroupById(id: string): Group | null {
    const stmt = db.prepare('SELECT * FROM groups WHERE id = ?');
    return stmt.get(id) as Group | null;
  }

  /**
   * Get group with members and detailed information
   */
  getGroupWithMembers(id: string): GroupWithMembers | null {
    const group = this.getGroupById(id);
    if (!group) return null;

    const members = this.getGroupMembers(id);
    const memberCount = members.length;

    return {
      ...group,
      members,
      member_count: memberCount
    };
  }

  /**
   * Update a group
   */
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
      values.push(input.description || null);
    }
    if (input.currency !== undefined) {
      updates.push('currency = ?');
      values.push(input.currency);
    }

    if (updates.length === 0) return existing;

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = db.prepare(`
      UPDATE groups
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.getGroupById(id);
  }

  /**
   * Delete a group
   */
  deleteGroup(id: string): boolean {
    const stmt = db.prepare('DELETE FROM groups WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Add a member to a group
   */
  addMember(groupId: string, userId: string, role: 'admin' | 'member' = 'member'): GroupMember | null {
    // Check if user is already a member
    const existingStmt = db.prepare(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?'
    );
    const existing = existingStmt.get(groupId, userId);

    if (existing) {
      return existing as GroupMember;
    }

    const id = this.generateMemberId();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO group_members (id, group_id, user_id, role, joined_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, groupId, userId, role, now);

    // Update group's updated_at timestamp
    db.prepare('UPDATE groups SET updated_at = ? WHERE id = ?').run(now, groupId);

    return this.getMemberById(id);
  }

  /**
   * Remove a member from a group
   */
  removeMember(groupId: string, userId: string): boolean {
    const now = new Date().toISOString();

    const stmt = db.prepare(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?'
    );
    const result = stmt.run(groupId, userId);

    if (result.changes > 0) {
      // Update group's updated_at timestamp
      db.prepare('UPDATE groups SET updated_at = ? WHERE id = ?').run(now, groupId);
    }

    return result.changes > 0;
  }

  /**
   * Get all members of a group
   */
  getGroupMembers(groupId: string): Array<{
    id: string;
    user_id: string;
    role: string;
    joined_at: string;
  }> {
    const stmt = db.prepare(`
      SELECT id, user_id, role, joined_at
      FROM group_members
      WHERE group_id = ?
      ORDER BY joined_at ASC
    `);

    return stmt.all(groupId) as any[];
  }

  /**
   * Get a member by ID
   */
  getMemberById(memberId: string): GroupMember | null {
    const stmt = db.prepare('SELECT * FROM group_members WHERE id = ?');
    return stmt.get(memberId) as GroupMember | null;
  }

  /**
   * Check if a user is a member of a group
   */
  isGroupMember(groupId: string, userId: string): boolean {
    const stmt = db.prepare(
      'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?'
    );
    return !!stmt.get(groupId, userId);
  }

  /**
   * Check if a user is an admin of a group
   */
  isGroupAdmin(groupId: string, userId: string): boolean {
    const stmt = db.prepare(
      'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ? AND role = ?'
    );
    return !!stmt.get(groupId, userId, 'admin');
  }

  /**
   * Get groups where user is the creator
   */
  getCreatedGroups(userId: string): Group[] {
    const stmt = db.prepare(`
      SELECT * FROM groups
      WHERE created_by = ?
      ORDER BY updated_at DESC
    `);

    return stmt.all(userId) as Group[];
  }
}

// Export a singleton instance
export const groupService = new GroupService();
