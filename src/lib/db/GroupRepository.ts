import Database from 'better-sqlite3';
import { Group, GroupMember } from './schema';

export class GroupRepository {
  constructor(private db: Database.Database) {}

  // Create a new group
  createGroup(group: Omit<Group, 'id' | 'created_at'>): Group {
    const id = this.generateId();
    const created_at = Date.now();

    const stmt = this.db.prepare(`
      INSERT INTO groups (id, name, description, currency, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, group.name, group.description || null, group.currency, group.created_by, created_at);

    return { ...group, id, created_at };
  }

  // Get group by ID
  getGroupById(id: string): Group | undefined {
    const stmt = this.db.prepare('SELECT * FROM groups WHERE id = ?');
    return stmt.get(id) as Group | undefined;
  }

  // Get all groups for a user
  getGroupsByUserId(userId: string): Group[] {
    const stmt = this.db.prepare(`
      SELECT DISTINCT g.* FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ?
      ORDER BY g.created_at DESC
    `);
    return stmt.all(userId) as Group[];
  }

  // Update group
  updateGroup(id: string, updates: Partial<Omit<Group, 'id' | 'created_at' | 'created_by'>>): Group | undefined {
    const existing = this.getGroupById(id);
    if (!existing) return undefined;

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

    values.push(id);
    const stmt = this.db.prepare(`UPDATE groups SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getGroupById(id);
  }

  // Delete group
  deleteGroup(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM groups WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Add member to group
  addMember(member: Omit<GroupMember, 'id' | 'joined_at'>): GroupMember {
    // Check if already a member
    const existing = this.getMember(member.group_id, member.user_id);
    if (existing) return existing;

    const id = this.generateId();
    const joined_at = Date.now();

    const stmt = this.db.prepare(`
      INSERT INTO group_members (id, group_id, user_id, role, joined_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, member.group_id, member.user_id, member.role, joined_at);

    return { ...member, id, joined_at };
  }

  // Get member by group and user ID
  getMember(groupId: string, userId: string): GroupMember | undefined {
    const stmt = this.db.prepare('SELECT * FROM group_members WHERE group_id = ? AND user_id = ?');
    return stmt.get(groupId, userId) as GroupMember | undefined;
  }

  // Get all members of a group
  getGroupMembers(groupId: string): GroupMember[] {
    const stmt = this.db.prepare('SELECT * FROM group_members WHERE group_id = ? ORDER BY joined_at ASC');
    return stmt.all(groupId) as GroupMember[];
  }

  // Get group members with user details
  getGroupMembersWithUsers(groupId: string): Array<GroupMember & { user_name: string; user_email: string; user_avatar?: string }> {
    const stmt = this.db.prepare(`
      SELECT gm.*, u.name as user_name, u.email as user_email, u.avatar as user_avatar
      FROM group_members gm
      INNER JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
      ORDER BY gm.joined_at ASC
    `);
    return stmt.all(groupId) as Array<GroupMember & { user_name: string; user_email: string; user_avatar?: string }>;
  }

  // Update member role
  updateMemberRole(groupId: string, userId: string, role: 'admin' | 'member'): GroupMember | undefined {
    const stmt = this.db.prepare('UPDATE group_members SET role = ? WHERE group_id = ? AND user_id = ?');
    stmt.run(role, groupId, userId);
    return this.getMember(groupId, userId);
  }

  // Remove member from group
  removeMember(groupId: string, userId: string): boolean {
    const stmt = this.db.prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?');
    const result = stmt.run(groupId, userId);
    return result.changes > 0;
  }

  // Check if user is member of group
  isGroupMember(groupId: string, userId: string): boolean {
    const stmt = this.db.prepare('SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?');
    return !!stmt.get(groupId, userId);
  }

  // Check if user is admin of group
  isGroupAdmin(groupId: string, userId: string): boolean {
    const stmt = this.db.prepare('SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ? AND role = ?');
    return !!stmt.get(groupId, userId, 'admin');
  }

  // Get all groups where user is admin
  getAdminGroups(userId: string): Group[] {
    const stmt = this.db.prepare(`
      SELECT DISTINCT g.* FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ? AND gm.role = ?
      ORDER BY g.created_at DESC
    `);
    return stmt.all(userId, 'admin') as Group[];
  }

  // Get group count for user
  getGroupCount(userId: string): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM group_members WHERE user_id = ?');
    const result = stmt.get(userId) as { count: number };
    return result.count;
  }

  // Get member count for group
  getMemberCount(groupId: string): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM group_members WHERE group_id = ?');
    const result = stmt.get(groupId) as { count: number };
    return result.count;
  }

  // Search groups
  searchGroups(userId: string, query: string): Group[] {
    const stmt = this.db.prepare(`
      SELECT DISTINCT g.* FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ?
      AND (g.name LIKE ? OR g.description LIKE ?)
      ORDER BY g.created_at DESC
    `);
    const searchTerm = `%${query}%`;
    return stmt.all(userId, searchTerm, searchTerm) as Group[];
  }

  // Get groups with member count
   getGroupsWithMemberCount(userId: string): Array<Group & { member_count: number }> {
    const stmt = this.db.prepare(`
      SELECT g.*, COUNT(gm.id) as member_count
      FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ?
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `);
    return stmt.all(userId) as Array<Group & { member_count: number }>;
  }

  // Transfer group ownership
  transferOwnership(groupId: string, newOwnerId: string): boolean {
    // Update group creator
    const groupStmt = this.db.prepare('UPDATE groups SET created_by = ? WHERE id = ?');
    groupStmt.run(newOwnerId, groupId);

    // Ensure new owner is admin
    const memberStmt = this.db.prepare('UPDATE group_members SET role = ? WHERE group_id = ? AND user_id = ?');
    memberStmt.run('admin', groupId, newOwnerId);

    return true;
  }

  // Helper: Generate unique ID
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
