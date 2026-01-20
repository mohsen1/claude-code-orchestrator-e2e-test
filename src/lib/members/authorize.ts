import { database } from '@/lib/database';

export interface GroupMember {
  user_id: string;
  role: 'owner' | 'admin' | 'member';
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const members = database.prepare(`
    SELECT user_id, role
    FROM group_members
    WHERE group_id = ?
  `).all(groupId) as GroupMember[];

  return members;
}

export async function getMemberRole(groupId: string, userId: string): Promise<string | null> {
  const member = database.prepare(`
    SELECT role
    FROM group_members
    WHERE group_id = ? AND user_id = ?
  `).get(groupId, userId) as { role: string } | undefined;

  return member?.role || null;
}

export async function isGroupMember(groupId: string, userId: string): Promise<boolean> {
  const member = database.prepare(`
    SELECT 1
    FROM group_members
    WHERE group_id = ? AND user_id = ?
  `).get(groupId, userId);

  return !!member;
}

export async function isGroupOwner(groupId: string, userId: string): Promise<boolean> {
  const role = await getMemberRole(groupId, userId);
  return role === 'owner';
}

export async function isGroupAdmin(groupId: string, userId: string): Promise<boolean> {
  const role = await getMemberRole(groupId, userId);
  return role === 'owner' || role === 'admin';
}

export function canModifyRole(requesterRole: string, targetRole: string): boolean {
  // Owner can modify anyone
  if (requesterRole === 'owner') return true;

  // Admin can modify members but not owners or other admins
  if (requesterRole === 'admin') {
    return targetRole === 'member';
  }

  // Members cannot modify anyone
  return false;
}

export function canRemoveMember(requesterRole: string, targetRole: string): boolean {
  // Owner can remove anyone
  if (requesterRole === 'owner') return true;

  // Admin can remove members but not owners or other admins
  if (requesterRole === 'admin') {
    return targetRole === 'member';
  }

  // Members cannot remove anyone
  return false;
}
