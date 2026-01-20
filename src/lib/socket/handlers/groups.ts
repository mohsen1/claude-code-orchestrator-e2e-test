import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket } from '../server';
import { SocketEvents, GroupCreatedPayload, GroupUpdatedPayload, MemberAddedPayload, MemberRemovedPayload, AckResponse } from '../events';
import { broadcastToGroup } from '../server';

/**
 * Register group-related event handlers
 */
export function registerGroupHandlers(io: SocketIOServer, socket: AuthenticatedSocket) {
  // User manually creates a group
  socket.on(
    'group:create',
    async (data: { name: string; description: string }, callback?: (response: AckResponse) => void) => {
      try {
        const userId = socket.data.user.id;

        // TODO: Create group in database
        // const group = await createGroup({
        //   name: data.name,
        //   description: data.description,
        //   createdBy: userId,
        // });

        // Placeholder group data
        const group = {
          id: `group_${Date.now()}`,
          name: data.name,
          description: data.description,
          createdBy: userId,
          createdAt: Date.now(),
        };

        // Auto-join the creator to the group
        const roomName = `group:${group.id}`;
        socket.join(roomName);
        socket.data.groups.add(group.id);

        // Broadcast group creation to all members (just creator for now)
        const payload: GroupCreatedPayload = {
          group,
          timestamp: Date.now(),
        };

        broadcastToGroup(io, group.id, SocketEvents.GROUP_CREATED, payload);

        callback?.({
          success: true,
          data: group,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create group';
        callback?.({
          success: false,
          error: message,
        });
      }
    }
  );

  // Group details updated
  socket.on(
    'group:update',
    async (data: { groupId: string; name?: string; description?: string }, callback?: (response: AckResponse) => void) => {
      try {
        const userId = socket.data.user.id;
        const { groupId, name, description } = data;

        // Verify user is member of the group
        if (!socket.data.groups.has(groupId)) {
          throw new Error('User is not a member of this group');
        }

        // TODO: Update group in database
        // await updateGroup(groupId, { name, description });

        // Broadcast update to all group members
        const payload: GroupUpdatedPayload = {
          groupId,
          changes: { name, description },
          timestamp: Date.now(),
        };

        broadcastToGroup(io, groupId, SocketEvents.GROUP_UPDATED, payload);

        callback?.({
          success: true,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update group';
        callback?.({
          success: false,
          error: message,
        });
      }
    }
  );

  // Group deleted
  socket.on(
    'group:delete',
    async (groupId: string, callback?: (response: AckResponse) => void) => {
      try {
        const userId = socket.data.user.id;

        // Verify user is member of the group
        if (!socket.data.groups.has(groupId)) {
          throw new Error('User is not a member of this group');
        }

        // TODO: Verify user is the creator
        // const group = await getGroup(groupId);
        // if (group.createdBy !== userId) {
        //   throw new Error('Only the group creator can delete the group');
        // }

        // TODO: Delete group from database
        // await deleteGroup(groupId);

        // Broadcast deletion to all group members
        broadcastToGroup(io, groupId, SocketEvents.GROUP_DELETED, {
          groupId,
          timestamp: Date.now(),
        });

        // Make all members leave the room
        io.in(`group:${groupId}`).fetchSockets().then((sockets) => {
          sockets.forEach((s) => {
            s.leave(`group:${groupId}`);
            (s as AuthenticatedSocket).data.groups.delete(groupId);
          });
        });

        callback?.({
          success: true,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete group';
        callback?.({
          success: false,
          error: message,
        });
      }
    }
  );

  // Member added to group
  socket.on(
    'group:add_member',
    async (data: { groupId: string; memberId: string }, callback?: (response: AckResponse) => void) => {
      try {
        const userId = socket.data.user.id;
        const { groupId, memberId } = data;

        // Verify user is member of the group
        if (!socket.data.groups.has(groupId)) {
          throw new Error('User is not a member of this group');
        }

        // TODO: Add member to database
        // await addGroupMember(groupId, memberId);
        // const member = await getUser(memberId);

        // Placeholder member data
        const member = {
          id: memberId,
          name: 'New Member',
          email: 'newmember@example.com',
        };

        // Broadcast to all group members
        const payload: MemberAddedPayload = {
          groupId,
          member,
          timestamp: Date.now(),
        };

        broadcastToGroup(io, groupId, SocketEvents.MEMBER_ADDED, payload);

        callback?.({
          success: true,
          data: member,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to add member';
        callback?.({
          success: false,
          error: message,
        });
      }
    }
  );

  // Member removed from group
  socket.on(
    'group:remove_member',
    async (data: { groupId: string; memberId: string }, callback?: (response: AckResponse) => void) => {
      try {
        const userId = socket.data.user.id;
        const { groupId, memberId } = data;

        // Verify user is member of the group
        if (!socket.data.groups.has(groupId)) {
          throw new Error('User is not a member of this group');
        }

        // TODO: Remove member from database
        // await removeGroupMember(groupId, memberId);

        // If removing self, leave the room
        if (memberId === userId) {
          socket.leave(`group:${groupId}`);
          socket.data.groups.delete(groupId);
        }

        // Broadcast to all group members
        const payload: MemberRemovedPayload = {
          groupId,
          memberId,
          timestamp: Date.now(),
        };

        broadcastToGroup(io, groupId, SocketEvents.MEMBER_REMOVED, payload);

        // Make the removed user leave the room if they're connected
        io.of('/').fetchSockets().then((sockets) => {
          sockets.forEach((s) => {
            const authSocket = s as AuthenticatedSocket;
            if (authSocket.data.user.id === memberId) {
              s.leave(`group:${groupId}`);
              authSocket.data.groups.delete(groupId);
            }
          });
        });

        callback?.({
          success: true,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to remove member';
        callback?.({
          success: false,
          error: message,
        });
      }
    }
  );

  // Request group member list
  socket.on(
    'group:members',
    async (groupId: string, callback?: (response: AckResponse) => void) => {
      try {
        const userId = socket.data.user.id;

        // Verify user is member of the group
        if (!socket.data.groups.has(groupId)) {
          throw new Error('User is not a member of this group');
        }

        // TODO: Fetch members from database
        // const members = await getGroupMembers(groupId);

        // Placeholder data
        const members = [
          {
            id: socket.data.user.id,
            name: socket.data.user.name,
            email: socket.data.user.email,
          },
        ];

        // Get connected members in the room
        const sockets = await io.in(`group:${groupId}`).fetchSockets();
        const onlineMemberIds = sockets.map((s) => (s as AuthenticatedSocket).data.user.id);

        callback?.({
          success: true,
          data: {
            members,
            online: onlineMemberIds,
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch members';
        callback?.({
          success: false,
          error: message,
        });
      }
    }
  );
}
