import Database from 'better-sqlite3';
import { Group, GroupMember, User } from '../schema';

/**
 * Group member with user details
 */
export interface GroupMemberWithUser extends GroupMember {
  user: User;
}

/**
 * Group with members count
 */
export interface GroupWithMemberCount extends Group {
  member_count: number;
}

/**
 * Group model operations
 */
export class GroupModel {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * Find group by ID
   */
  findById(id: string): Group | null {
    const row = this.db
      .prepare('SELECT * FROM groups WHERE id = ?')
      .get(id) as Group | undefined;

    return row || null;
  }

  /**
   * Create a new group
   */
  create(group: Omit<Group, 'created_at' | 'updated_at'>): Group {
    const now = Date.now();
    const newGroup: Group = {
      ...group,
      created_at: now,
      updated_at: now,
    };

    this.db
      .prepare(
        `
        INSERT INTO groups (id, name, description, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `
      )
      .run(
        newGroup.id,
        newGroup.name,
        newGroup.description,
        newGroup.created_by,
        newGroup.created_at,
        newGroup.updated_at
      );

    // Automatically add creator as a member
    this.addMember(newGroup.id, newGroup.created_by);

    return newGroup;
  }

  /**
   * Update group
   */
  update(id: string, updates: Partial<Omit<Group, 'id' | 'created_by' | 'created_at' | 'updated_at'>>): Group | null {
    const existing = this.findById(id);

    if (!existing) {
      return null;
    }

    const updatedGroup: Group = {
      ...existing,
      ...updates,
      updated_at: Date.now(),
    };

    this.db
      .prepare(
        `
        UPDATE groups
        SET name = ?, description = ?, updated_at = ?
        WHERE id = ?
      `
      )
      .run(updatedGroup.name, updatedGroup.description, updatedGroup.updated_at, updatedGroup.id);

    return updatedGroup;
  }

  /**
   * Delete group
   */
  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM groups WHERE id = ?').run(id);
    return result.changes > 0;
  }

  /**
   * Get groups created by user
   */
  getByCreatedBy(userId: string): Group[] {
    return this.db
      .prepare('SELECT * FROM groups WHERE created_by = ? ORDER BY created_at DESC')
      .all(userId) as Group[];
  }

  /**
   * Get groups where user is a member
   */
  getByMemberId(userId: string): GroupWithMemberCount[] {
    return this.db
      .prepare(
        `
        SELECT g.*, COUNT(DISTINCT gm.user_id) as member_count
        FROM groups g
        INNER JOIN group_members gm ON g.id = gm.group_id
        WHERE gm.user_id = ?
        GROUP BY g.id
        ORDER BY g.updated_at DESC
      `
      )
      .all(userId) as GroupWithMemberCount[];
  }

  /**
   * Get all groups
   */
  getAll(): Group[] {
    return this.db.prepare('SELECT * FROM groups ORDER BY created_at DESC').all() as Group[];
  }

  /**
   * Add member to group
   */
  addMember(groupId: string, userId: string): GroupMember {
    const member: GroupMember = {
      id: `${groupId}-${userId}-${Date.now()}`,
      group_id: groupId,
      user_id: userId,
      joined_at: Date.now(),
    };

    this.db
      .prepare(
        `
        INSERT OR IGNORE INTO group_members (id, group_id, user_id, joined_at)
        VALUES (?, ?, ?, ?)
      `
      )
      .run(member.id, member.group_id, member.user_id, member.joined_at);

    return member;
  }

  /**
   * Remove member from group
   */
  removeMember(groupId: string, userId: string): boolean {
    const result = this.db
      .prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?')
      .run(groupId, userId);
    return result.changes > 0;
  }

  /**
   * Get group members with user details
   */
  getMembers(groupId: string): GroupMemberWithUser[] {
    const rows = this.db
      .prepare(
        `
        SELECT gm.*, u.id as user_id, u.email, u.name, u.image, u.created_at as user_created_at, u.updated_at as user_updated_at
        FROM group_members gm
        INNER JOIN users u ON gm.user_id = u.id
        WHERE gm.group_id = ?
        ORDER BY gm.joined_at ASC
      `
      )
      .all(groupId) as any[];

    return rows.map(row => ({
      id: row.id,
      group_id: row.group_id,
      user_id: row.user_id,
      joined_at: row.joined_at,
      user: {
        id: row.user_id,
        email: row.email,
        name: row.name,
        image: row.image,
        created_at: row.user_created_at,
        updated_at: row.user_updated_at,
      },
    }));
  }

  /**
   * Check if user is a member of group
   */
  isMember(groupId: string, userId: string): boolean {
    const row = this.db
      .prepare('SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?')
      .get(groupId, userId);
    return !!row;
  }

  /**
   * Get member count for group
   */
  getMemberCount(groupId: string): number {
    const row = this.db
      .prepare('SELECT COUNT(*) as count FROM group_members WHERE group_id = ?')
      .get(groupId) as { count: number };
    return row.count;
  }

  /**
   * Add multiple members to group
   */
  addMembers(groupId: string, userIds: string[]): GroupMember[] {
    const members: GroupMember[] = [];

    this.db.transaction(() => {
      for (const userId of userIds) {
        members.push(this.addMember(groupId, userId));
      }
    })();

    return members;
  }
}

/**
 * Create group model instance
 */
export function createGroupModel(db: Database.Database): GroupModel {
  return new GroupModel(db);
}
