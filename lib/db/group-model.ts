import { getDatabase, Group, GroupMember, User, UserWithBalance } from './index';
import { UserModel } from './user-model';

export interface CreateGroupInput {
  name: string;
  description?: string;
  created_by: number;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
}

export interface GroupWithMembers extends Group {
  members: UserWithBalance[];
}

export class GroupModel {
  /**
   * Create a new group
   */
  static create(input: CreateGroupInput): Group {
    const db = getDatabase();

    const stmt = db.prepare(`
      INSERT INTO groups (name, description, created_by)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(input.name, input.description || null, input.created_by);
    const group = this.findById(result.lastInsertRowid as number)!;

    // Add creator as first member
    this.addMember(group.id, input.created_by);

    return group;
  }

  /**
   * Find group by ID
   */
  static findById(id: number): Group | null {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM groups WHERE id = ?');
    return stmt.get(id) as Group | null;
  }

  /**
   * Find group by ID with members
   */
  static findByIdWithMembers(id: number): GroupWithMembers | null {
    const group = this.findById(id);
    if (!group) {
      return null;
    }

    const members = this.getMembers(id);
    return {
      ...group,
      members
    };
  }

  /**
   * Get all groups for a user (groups they are a member of)
   */
  static findByUserId(userId: number): Group[] {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT g.* FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ?
      ORDER BY g.created_at DESC
    `);
    return stmt.all(userId) as Group[];
  }

  /**
   * Get all groups
   */
  static findAll(): Group[] {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM groups ORDER BY created_at DESC');
    return stmt.all() as Group[];
  }

  /**
   * Update group
   */
  static update(id: number, input: UpdateGroupInput): Group | null {
    const db = getDatabase();

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      values.push(input.name);
    }
    if (input.description !== undefined) {
      updates.push('description = ?');
      values.push(input.description);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE groups
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  }

  /**
   * Delete group
   */
  static delete(id: number): boolean {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM groups WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Add member to group
   */
  static addMember(groupId: number, userId: number): boolean {
    const db = getDatabase();

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO group_members (group_id, user_id)
      VALUES (?, ?)
    `);

    const result = stmt.run(groupId, userId);
    return result.changes > 0;
  }

  /**
   * Remove member from group
   */
  static removeMember(groupId: number, userId: number): boolean {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?');
    const result = stmt.run(groupId, userId);
    return result.changes > 0;
  }

  /**
   * Get all members of a group
   */
  static getMembers(groupId: number): UserWithBalance[] {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT u.* FROM users u
      INNER JOIN group_members gm ON u.id = gm.user_id
      WHERE gm.group_id = ?
      ORDER BY gm.joined_at ASC
    `);
    return stmt.all(groupId) as UserWithBalance[];
  }

  /**
   * Check if user is a member of a group
   */
  static isMember(groupId: number, userId: number): boolean {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM group_members
      WHERE group_id = ? AND user_id = ?
    `);
    const result = stmt.get(groupId, userId) as { count: number };
    return result.count > 0;
  }

  /**
   * Get groups where user is not a member (for invitations)
   */
  static findNonMemberGroups(userId: number): Group[] {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT g.* FROM groups g
      WHERE g.id NOT IN (
        SELECT gm.group_id FROM group_members gm
        WHERE gm.user_id = ?
      )
      ORDER BY g.created_at DESC
    `);
    return stmt.all(userId) as Group[];
  }

  /**
   * Get member count for a group
   */
  static getMemberCount(groupId: number): number {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM group_members
      WHERE group_id = ?
    `);
    const result = stmt.get(groupId) as { count: number };
    return result.count;
  }
}
