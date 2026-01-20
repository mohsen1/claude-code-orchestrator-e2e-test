import db from './index';
import { randomUUID } from 'crypto';

export interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface GroupWithMembers extends Group {
  members: Array<{
    id: string;
    user_id: string;
    role: string;
    email: string;
    name: string;
  }>;
  member_count: number;
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

export interface InviteMemberInput {
  group_id: string;
  user_id: string;
  role?: 'admin' | 'member';
}

/**
 * Create a new group
 */
export function createGroup(input: CreateGroupInput): Group {
  const id = randomUUID();

  const stmt = db.prepare(`
    INSERT INTO groups (id, name, description, created_by)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(id, input.name, input.description || null, input.created_by);

  // Automatically add the creator as an admin member
  addMember({
    group_id: id,
    user_id: input.created_by,
    role: 'admin'
  });

  return getGroupById(id)!;
}

/**
 * Get a group by ID
 */
export function getGroupById(id: string): Group | null {
  const stmt = db.prepare(`
    SELECT * FROM groups WHERE id = ?
  `);

  return stmt.get(id) as Group | null;
}

/**
 * Get a group with its members
 */
export function getGroupWithMembers(id: string): GroupWithMembers | null {
  const group = getGroupById(id);
  if (!group) return null;

  const membersStmt = db.prepare(`
    SELECT
      gm.id,
      gm.group_id,
      gm.user_id,
      gm.role,
      u.email,
      u.name
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = ?
    ORDER BY gm.joined_at ASC
  `);

  const members = membersStmt.all(id);

  return {
    ...group,
    members,
    member_count: members.length
  };
}

/**
 * Get all groups for a user (groups they are a member of)
 */
export function getGroupsByUserId(userId: string): GroupWithMembers[] {
  const stmt = db.prepare(`
    SELECT
      g.id,
      g.name,
      g.description,
      g.created_by,
      g.created_at,
      COUNT(gm.user_id) as member_count
    FROM groups g
    JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = ?
    GROUP BY g.id
    ORDER BY g.created_at DESC
  `);

  const groups = stmt.all(userId) as any[];

  // Get members for each group
  return groups.map(group => {
    const membersStmt = db.prepare(`
      SELECT
        gm.id,
        gm.group_id,
        gm.user_id,
        gm.role,
        u.email,
        u.name
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
      ORDER BY gm.joined_at ASC
    `);

    const members = membersStmt.all(group.id);

    return {
      ...group,
      members,
      member_count: group.member_count
    };
  });
}

/**
 * Update a group
 */
export function updateGroup(id: string, input: UpdateGroupInput): Group | null {
  const group = getGroupById(id);
  if (!group) return null;

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

  if (updates.length === 0) return group;

  values.push(id);

  const stmt = db.prepare(`
    UPDATE groups
    SET ${updates.join(', ')}
    WHERE id = ?
  `);

  stmt.run(...values);

  return getGroupById(id);
}

/**
 * Delete a group
 */
export function deleteGroup(id: string): boolean {
  const stmt = db.prepare(`
    DELETE FROM groups WHERE id = ?
  `);

  const result = stmt.run(id);

  return result.changes > 0;
}

/**
 * Add a member to a group
 */
export function addMember(input: InviteMemberInput): GroupMember {
  const id = randomUUID();

  const stmt = db.prepare(`
    INSERT INTO group_members (id, group_id, user_id, role)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(id, input.group_id, input.user_id, input.role || 'member');

  const selectStmt = db.prepare(`
    SELECT * FROM group_members WHERE id = ?
  `);

  return selectStmt.get(id) as GroupMember;
}

/**
 * Remove a member from a group
 */
export function removeMember(groupId: string, userId: string): boolean {
  const stmt = db.prepare(`
    DELETE FROM group_members
    WHERE group_id = ? AND user_id = ?
  `);

  const result = stmt.run(groupId, userId);

  return result.changes > 0;
}

/**
 * Update member role
 */
export function updateMemberRole(groupId: string, userId: string, role: 'admin' | 'member'): boolean {
  const stmt = db.prepare(`
    UPDATE group_members
    SET role = ?
    WHERE group_id = ? AND user_id = ?
  `);

  const result = stmt.run(role, groupId, userId);

  return result.changes > 0;
}

/**
 * Check if a user is a member of a group
 */
export function isGroupMember(groupId: string, userId: string): boolean {
  const stmt = db.prepare(`
    SELECT 1 FROM group_members
    WHERE group_id = ? AND user_id = ?
    LIMIT 1
  `);

  return stmt.get(groupId, userId) !== undefined;
}

/**
 * Check if a user is an admin of a group
 */
export function isGroupAdmin(groupId: string, userId: string): boolean {
  const stmt = db.prepare(`
    SELECT 1 FROM group_members
    WHERE group_id = ? AND user_id = ? AND role = 'admin'
    LIMIT 1
  `);

  return stmt.get(groupId, userId) !== undefined;
}

/**
 * Get all members of a group
 */
export function getGroupMembers(groupId: string): Array<{
  id: string;
  user_id: string;
  role: string;
  email: string;
  name: string;
  joined_at: string;
}> {
  const stmt = db.prepare(`
    SELECT
      gm.id,
      gm.user_id,
      gm.role,
      gm.joined_at,
      u.email,
      u.name
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = ?
    ORDER BY gm.joined_at ASC
  `);

  return stmt.all(groupId);
}
