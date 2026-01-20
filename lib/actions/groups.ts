'use server';

import { db } from '@/lib/db';
import { groups, groupMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export type GroupInput = {
  name: string;
  description?: string;
};

export type GroupMemberInput = {
  groupId: number;
  userId: string;
  role?: 'admin' | 'member';
};

export async function createGroup(input: GroupInput) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const [newGroup] = await db
    .insert(groups)
    .values({
      name: input.name,
      description: input.description,
      createdBy: session.user.id,
    })
    .returning();

  await db.insert(groupMembers).values({
    groupId: newGroup.id,
    userId: session.user.id,
    role: 'admin',
  });

  revalidatePath('/dashboard');
  revalidatePath(`/groups/${newGroup.id}`);

  return newGroup;
}

export async function getGroups() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userGroups = await db
    .select({
      id: groups.id,
      name: groups.name,
      description: groups.description,
      createdAt: groups.createdAt,
      updatedAt: groups.updatedAt,
      role: groupMembers.role,
    })
    .from(groups)
    .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.userId, session.user.id))
    .orderBy(groups.createdAt);

  return userGroups;
}

export async function getGroupById(id: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const [group] = await db
    .select()
    .from(groups)
    .where(eq(groups.id, id))
    .limit(1);

  if (!group) {
    return null;
  }

  const members = await db
    .select()
    .from(groupMembers)
    .where(eq(groupMembers.groupId, id));

  const isMember = members.some((m) => m.userId === session.user.id);

  if (!isMember) {
    throw new Error('Forbidden: Not a member of this group');
  }

  return {
    ...group,
    members,
  };
}

export async function updateGroup(id: number, input: Partial<GroupInput>) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const [member] = await db
    .select()
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, id),
        eq(groupMembers.userId, session.user.id)
      )
    )
    .limit(1);

  if (!member || member.role !== 'admin') {
    throw new Error('Forbidden: Only admins can update groups');
  }

  const [updatedGroup] = await db
    .update(groups)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(groups.id, id))
    .returning();

  revalidatePath('/dashboard');
  revalidatePath(`/groups/${id}`);

  return updatedGroup;
}

export async function deleteGroup(id: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const [member] = await db
    .select()
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, id),
        eq(groupMembers.userId, session.user.id)
      )
    )
    .limit(1);

  if (!member || member.role !== 'admin') {
    throw new Error('Forbidden: Only admins can delete groups');
  }

  await db.delete(groups).where(eq(groups.id, id));

  revalidatePath('/dashboard');

  return { success: true };
}

export async function addGroupMember(input: GroupMemberInput) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const [adminMember] = await db
    .select()
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, input.groupId),
        eq(groupMembers.userId, session.user.id)
      )
    )
    .limit(1);

  if (!adminMember || adminMember.role !== 'admin') {
    throw new Error('Forbidden: Only admins can add members');
  }

  const [newMember] = await db
    .insert(groupMembers)
    .values({
      groupId: input.groupId,
      userId: input.userId,
      role: input.role || 'member',
    })
    .returning();

  revalidatePath('/dashboard');
  revalidatePath(`/groups/${input.groupId}`);

  return newMember;
}

export async function removeGroupMember(groupId: number, userId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const [adminMember] = await db
    .select()
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, session.user.id)
      )
    )
    .limit(1);

  if (!adminMember || adminMember.role !== 'admin') {
    throw new Error('Forbidden: Only admins can remove members');
  }

  await db
    .delete(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      )
    );

  revalidatePath('/dashboard');
  revalidatePath(`/groups/${groupId}`);

  return { success: true };
}

export async function updateGroupMemberRole(
  groupId: number,
  userId: string,
  role: 'admin' | 'member'
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const [adminMember] = await db
    .select()
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, session.user.id)
      )
    )
    .limit(1);

  if (!adminMember || adminMember.role !== 'admin') {
    throw new Error('Forbidden: Only admins can update member roles');
  }

  const [updatedMember] = await db
    .update(groupMembers)
    .set({ role })
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      )
    )
    .returning();

  revalidatePath('/dashboard');
  revalidatePath(`/groups/${groupId}`);

  return updatedMember;
}
