import { Server as IOServer } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export interface GroupCreatedEventData {
  groupId: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  members: Array<{
    userId: string;
    name: string;
    email: string;
  }>;
}

export interface GroupUpdatedEventData {
  groupId: string;
  name?: string;
  description?: string;
  updatedBy: string;
  updatedAt: Date;
}

export interface MemberJoinedEventData {
  groupId: string;
  memberId: string;
  name: string;
  email: string;
  joinedAt: Date;
  invitedBy?: string;
}

export interface MemberLeftEventData {
  groupId: string;
  memberId: string;
  leftAt: Date;
}

export interface GroupDeletedEventData {
  groupId: string;
  deletedBy: string;
  deletedAt: Date;
}

/**
 * Emit event when a new group is created
 * Notifies all members that they've been added to a new group
 */
export function emitGroupCreated(
  io: IOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  data: GroupCreatedEventData
): void {
  const memberIds = data.members.map((m) => m.userId);

  // Emit to all members of the new group
  memberIds.forEach((userId) => {
    io.to(`user:${userId}`).emit('group:created', {
      groupId: data.groupId,
      name: data.name,
      description: data.description,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      members: data.members,
    });
  });
}

/**
 * Emit event when group details are updated
 * Notifies all group members about the update
 */
export function emitGroupUpdated(
  io: IOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  groupId: string,
  memberIds: string[],
  data: GroupUpdatedEventData
): void {
  memberIds.forEach((userId) => {
    io.to(`user:${userId}`).emit('group:updated', {
      groupId,
      name: data.name,
      description: data.description,
      updatedBy: data.updatedBy,
      updatedAt: data.updatedAt,
    });
  });
}

/**
 * Emit event when a new member joins a group
 * Notifies all existing group members about the new member
 */
export function emitMemberJoined(
  io: IOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  groupId: string,
  memberIds: string[],
  data: MemberJoinedEventData
): void {
  // Notify all existing members
  memberIds.forEach((userId) => {
    io.to(`user:${userId}`).emit('group:member:joined', {
      groupId: data.groupId,
      memberId: data.memberId,
      name: data.name,
      email: data.email,
      joinedAt: data.joinedAt,
      invitedBy: data.invitedBy,
    });
  });

  // Also notify the new member
  io.to(`user:${data.memberId}`).emit('group:member:joined', {
    groupId: data.groupId,
    memberId: data.memberId,
    name: data.name,
    email: data.email,
    joinedAt: data.joinedAt,
    invitedBy: data.invitedBy,
  });
}

/**
 * Emit event when a member leaves a group
 * Notifies all remaining group members
 */
export function emitMemberLeft(
  io: IOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  groupId: string,
  memberIds: string[],
  data: MemberLeftEventData
): void {
  memberIds.forEach((userId) => {
    io.to(`user:${userId}`).emit('group:member:left', {
      groupId: data.groupId,
      memberId: data.memberId,
      leftAt: data.leftAt,
    });
  });
}

/**
 * Emit event when a group is deleted
 * Notifies all group members
 */
export function emitGroupDeleted(
  io: IOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  groupId: string,
  memberIds: string[],
  data: GroupDeletedEventData
): void {
  memberIds.forEach((userId) => {
    io.to(`user:${userId}`).emit('group:deleted', {
      groupId: data.groupId,
      deletedBy: data.deletedBy,
      deletedAt: data.deletedAt,
    });
  });
}
