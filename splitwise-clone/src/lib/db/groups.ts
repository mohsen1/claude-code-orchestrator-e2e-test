import { getDb, generateId } from './index';
import { Group, GroupMember } from './schema';

export interface CreateGroupInput {
  name: string;
  description?: string;
  created_by: string;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
}

export interface GroupWithMembers extends Group {
  members: Array<GroupMember & { user_name: string; user_email: string }>;
  member_count: number;
}

export interface GroupDetail extends Group {
  members: Array<GroupMember & { user_name: string; user_email: string }>;
}

export function createGroup(input: CreateGroupInput): Group {
  const db = getDb();
  const id = generateId();

  const stmt = db.prepare(`
    INSERT INTO groups (id, name, description, created_by)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(id, input.name, input.description || null, input.created_by);

  // Add creator as owner
  addMemberToGroup(id, input.created_by, 'owner');

  return getGroupById(id)!;
}

export function getGroupById(id: string): Group | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM groups WHERE id = ?');
  return stmt.get(id) as Group | null;
}

export function getGroupsByUserId(userId: string): GroupWithMembers[] {
  const db = getDb();

  const stmt = db.prepare(`
    SELECT
      g.*,
      COUNT(gm.id) as member_count
    FROM groups g
    INNER JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = ?
    GROUP BY g.id
    ORDER BY g.created_at DESC
  `);

  const groups = stmt.all(userId) as Array<Group & { member_count: number }>;

  // Get members for each group
  return groups.map(group => ({
    ...group,
    members: getGroupMembers(group.id)
  }));
}

export function updateGroup(id: string, input: UpdateGroupInput): Group | null {
  const db = getDb();

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

  if (updates.length === 0) {
    return getGroupById(id);
  }

  values.push(id);

  const stmt = db.prepare(`
    UPDATE groups
    SET ${updates.join(', ')}
    WHERE id = ?
  `);

  stmt.run(...values);
  return getGroupById(id);
}

export function deleteGroup(id: string, userId: string): boolean {
  const db = getDb();

  // Check if user is the owner
  const group = getGroupById(id);
  if (!group || group.created_by !== userId) {
    return false;
  }

  const stmt = db.prepare('DELETE FROM groups WHERE id = ?');
  const result = stmt.run(id);

  return result.changes > 0;
}

export function getGroupDetail(id: string): GroupDetail | null {
  const group = getGroupById(id);

  if (!group) {
    return null;
  }

  return {
    ...group,
    members: getGroupMembers(id)
  };
}

// Member management functions

export function addMemberToGroup(
  groupId: string,
  userId: string,
  role: 'owner' | 'admin' | 'member' = 'member'
): GroupMember {
  const db = getDb();
  const id = generateId();

  const stmt = db.prepare(`
    INSERT INTO group_members (id, group_id, user_id, role)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(id, groupId, userId, role);

  return {
    id,
    group_id: groupId,
    user_id: userId,
    role,
    joined_at: new Date().toISOString()
  };
}

export function getGroupMembers(groupId: string): Array<GroupMember & { user_name: string; user_email: string }> {
  const db = getDb();

  const stmt = db.prepare(`
    SELECT
      gm.*,
      u.name as user_name,
      u.email as user_email
    FROM group_members gm
    INNER JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = ?
    ORDER BY gm.joined_at ASC
  `);

  return stmt.all(groupId) as Array<GroupMember & { user_name: string; user_email: string }>;
}

export function removeMemberFromGroup(groupId: string, userId: string, requestingUserId: string): boolean {
  const db = getDb();

  // Check if requesting user is owner or admin
  const memberStmt = db.prepare(`
    SELECT role FROM group_members
    WHERE group_id = ? AND user_id = ?
  `);

  const requester = memberStmt.get(groupId, requestingUserId) as { role: string } | undefined;

  if (!requester || (requester.role !== 'owner' && requester.role !== 'admin')) {
    return false;
  }

  // Can't remove the owner
  const targetMember = memberStmt.get(groupId, userId) as { role: string } | undefined;
  if (!targetMember) {
    return false;
  }

  if (targetMember.role === 'owner') {
    return false;
  }

  const stmt = db.prepare(`
    DELETE FROM group_members
    WHERE group_id = ? AND user_id = ?
  `);

  const result = stmt.run(groupId, userId);
  return result.changes > 0;
}

export function updateMemberRole(
  groupId: string,
  userId: string,
  role: 'admin' | 'member',
  requestingUserId: string
): boolean {
  const db = getDb();

  // Check if requesting user is owner
  const memberStmt = db.prepare(`
    SELECT role FROM group_members
    WHERE group_id = ? AND user_id = ?
  `);

  const requester = memberStmt.get(groupId, requestingUserId) as { role: string } | undefined;

  if (!requester || requester.role !== 'owner') {
    return false;
  }

  const stmt = db.prepare(`
    UPDATE group_members
    SET role = ?
    WHERE group_id = ? AND user_id = ?
  `);

  const result = stmt.run(role, groupId, userId);
  return result.changes > 0;
}

export function isGroupMember(groupId: string, userId: string): boolean {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 1 FROM group_members
    WHERE group_id = ? AND user_id = ?
  `);

  return !!stmt.get(groupId, userId);
}

export function isGroupOwner(groupId: string, userId: string): boolean {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 1 FROM group_members
    WHERE group_id = ? AND user_id = ? AND role = 'owner'
  `);

  return !!stmt.get(groupId, userId);
}

// Invitation functions
export interface CreateInvitationInput {
  group_id: string;
  email: string;
  invited_by: string;
}

export function createInvitation(input: CreateInvitationInput) {
  const db = getDb();
  const id = generateId();

  const stmt = db.prepare(`
    INSERT INTO invitations (id, group_id, email, invited_by)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(id, input.group_id, input.email.toLowerCase(), input.invited_by);

  return getInvitationById(id);
}

export function getInvitationById(id: string) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM invitations WHERE id = ?');
  return stmt.get(id);
}

export function getPendingInvitationsByEmail(email: string) {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT
      i.*,
      g.name as group_name,
      u.name as invited_by_name
    FROM invitations i
    INNER JOIN groups g ON i.group_id = g.id
    INNER JOIN users u ON i.invited_by = u.id
    WHERE i.email = ? AND i.status = 'pending'
    ORDER BY i.created_at DESC
  `);

  return stmt.all(email.toLowerCase());
}

export function getInvitationsByGroupId(groupId: string) {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT
      i.*,
      u.name as invited_by_name
    FROM invitations i
    INNER JOIN users u ON i.invited_by = u.id
    WHERE i.group_id = ? AND i.status = 'pending'
    ORDER BY i.created_at DESC
  `);

  return stmt.all(groupId);
}

export function updateInvitationStatus(
  invitationId: string,
  status: 'accepted' | 'declined'
): boolean {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE invitations
    SET status = ?
    WHERE id = ?
  `);

  const result = stmt.run(status, invitationId);
  return result.changes > 0;
}

export function deleteInvitation(invitationId: string, requestingUserId: string): boolean {
  const db = getDb();

  // Check if user is the one who created the invitation or is group owner/admin
  const inviteStmt = db.prepare(`
    SELECT i.*, gm.role as requester_role
    FROM invitations i
    INNER JOIN group_members gm ON i.group_id = gm.group_id
    WHERE i.id = ? AND gm.user_id = ?
  `);

  const invitation = inviteStmt.get(invitationId, requestingUserId) as any;

  if (!invitation) {
    return false;
  }

  if (invitation.invited_by !== requestingUserId && invitation.requester_role === 'member') {
    return false;
  }

  const stmt = db.prepare('DELETE FROM invitations WHERE id = ?');
  const result = stmt.run(invitationId);

  return result.changes > 0;
}

export function acceptInvitation(invitationId: string, userId: string): boolean {
  const db = getDb();

  const invitationStmt = db.prepare('SELECT * FROM invitations WHERE id = ?');
  const invitation = invitationStmt.get(invitationId) as any;

  if (!invitation || invitation.status !== 'pending') {
    return false;
  }

  // Add user to group
  try {
    addMemberToGroup(invitation.group_id, userId, 'member');
  } catch (error) {
    // User might already be a member
    const isMemberStmt = db.prepare(`
      SELECT 1 FROM group_members
      WHERE group_id = ? AND user_id = ?
    `);
    if (!isMemberStmt.get(invitation.group_id, userId)) {
      throw error;
    }
  }

  // Update invitation status
  updateInvitationStatus(invitationId, 'accepted');

  return true;
}
