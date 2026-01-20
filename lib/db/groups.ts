import Database from 'better-sqlite3';

export interface Group {
  id: string;
  name: string;
  description?: string;
  currency: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  joined_at: string;
}

export interface GroupWithMembers extends Group {
  members: Array<{
    id: string;
    email: string;
    name: string;
    image?: string;
  }>;
}

export interface CreateGroupInput {
  name: string;
  description?: string;
  currency?: string;
  created_by: string;
}

/**
 * Database error wrapper
 */
function handleDatabaseError(operation: string, error: unknown): never {
  if (error instanceof Error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error(`Duplicate entry for ${operation}`);
    }
    throw new Error(`Database error during ${operation}: ${error.message}`);
  }
  throw new Error(`Unknown error during ${operation}`);
}

/**
 * Get group by ID
 */
export function getGroupById(db: Database.Database, groupId: string): Group | null {
  try {
    const stmt = db.prepare(`
      SELECT * FROM groups
      WHERE id = ?
      LIMIT 1
    `);

    const group = stmt.get(groupId) as Group | undefined;
    return group || null;
  } catch (error) {
    handleDatabaseError('getGroupById', error);
  }
}

/**
 * Get group by ID with members
 */
export function getGroupWithMembers(db: Database.Database, groupId: string): GroupWithMembers | null {
  try {
    const group = getGroupById(db, groupId);
    if (!group) {
      return null;
    }

    const membersStmt = db.prepare(`
      SELECT u.id, u.email, u.name, u.image
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
      ORDER BY gm.joined_at ASC
    `);

    const members = membersStmt.all(groupId) as Array<{
      id: string;
      email: string;
      name: string;
      image?: string;
    }>;

    return {
      ...group,
      members,
    };
  } catch (error) {
    handleDatabaseError('getGroupWithMembers', error);
  }
}

/**
 * Get groups where user is a member
 */
export function getGroupsByUserId(db: Database.Database, userId: string): Group[] {
  try {
    const stmt = db.prepare(`
      SELECT g.* FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ?
      ORDER BY g.created_at DESC
    `);

    return stmt.all(userId) as Group[];
  } catch (error) {
    handleDatabaseError('getGroupsByUserId', error);
  }
}

/**
 * Create a new group
 */
export function createGroup(db: Database.Database, input: CreateGroupInput): Group {
  try {
    const id = crypto.randomUUID();
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

    // Automatically add creator as a member
    addMemberToGroup(db, id, input.created_by);

    return {
      id,
      name: input.name,
      description: input.description,
      currency: input.currency || 'USD',
      created_by: input.created_by,
      created_at: now,
      updated_at: now,
    };
  } catch (error) {
    handleDatabaseError('createGroup', error);
  }
}

/**
 * Update group information
 */
export function updateGroup(db: Database.Database, groupId: string, updates: Partial<Omit<Group, 'id' | 'created_by' | 'created_at' | 'updated_at'>>): Group | null {
  try {
    const existingGroup = getGroupById(db, groupId);
    if (!existingGroup) {
      return null;
    }

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

    if (fields.length === 0) {
      return existingGroup;
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(groupId);

    const stmt = db.prepare(`
      UPDATE groups
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return getGroupById(db, groupId);
  } catch (error) {
    handleDatabaseError('updateGroup', error);
  }
}

/**
 * Add member to group
 */
export function addMemberToGroup(db: Database.Database, groupId: string, userId: string): boolean {
  try {
    // Check if user is already a member
    const checkStmt = db.prepare(`
      SELECT 1 FROM group_members
      WHERE group_id = ? AND user_id = ?
      LIMIT 1
    `);

    const existing = checkStmt.get(groupId, userId);
    if (existing) {
      return false; // Already a member
    }

    const stmt = db.prepare(`
      INSERT INTO group_members (group_id, user_id, joined_at)
      VALUES (?, ?, ?)
    `);

    stmt.run(groupId, userId, new Date().toISOString());
    return true;
  } catch (error) {
    handleDatabaseError('addMemberToGroup', error);
  }
}

/**
 * Remove member from group
 */
export function removeMemberFromGroup(db: Database.Database, groupId: string, userId: string): boolean {
  try {
    const stmt = db.prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?');
    const result = stmt.run(groupId, userId);
    return result.changes > 0;
  } catch (error) {
    handleDatabaseError('removeMemberFromGroup', error);
  }
}

/**
 * Get members of a group
 */
export function getGroupMembers(db: Database.Database, groupId: string): Array<{
  id: string;
  email: string;
  name: string;
  image?: string;
  joined_at: string;
}> {
  try {
    const stmt = db.prepare(`
      SELECT u.id, u.email, u.name, u.image, gm.joined_at
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
      ORDER BY gm.joined_at ASC
    `);

    return stmt.all(groupId) as Array<{
      id: string;
      email: string;
      name: string;
      image?: string;
      joined_at: string;
    }>;
  } catch (error) {
    handleDatabaseError('getGroupMembers', error);
  }
}

/**
 * Delete group by ID
 */
export function deleteGroup(db: Database.Database, groupId: string): boolean {
  try {
    const stmt = db.prepare('DELETE FROM groups WHERE id = ?');
    const result = stmt.run(groupId);
    return result.changes > 0;
  } catch (error) {
    handleDatabaseError('deleteGroup', error);
  }
}

/**
 * Check if user is member of group
 */
export function isGroupMember(db: Database.Database, groupId: string, userId: string): boolean {
  try {
    const stmt = db.prepare(`
      SELECT 1 FROM group_members
      WHERE group_id = ? AND user_id = ?
      LIMIT 1
    `);

    const result = stmt.get(groupId, userId);
    return !!result;
  } catch (error) {
    handleDatabaseError('isGroupMember', error);
  }
}
