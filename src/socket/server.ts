import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents } from './types';

// User socket mapping for tracking connections
const userSocketMap = new Map<string, Socket>();
// Group room tracking
const groupRooms = new Map<string, Set<string>>();

export function initializeSocketServer(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use((socket: Socket, next) => {
    const userId = socket.handshake.auth.userId;
    const userEmail = socket.handshake.auth.email;

    if (!userId) {
      return next(new Error('Authentication error: Missing user ID'));
    }

    socket.data.userId = userId;
    socket.data.userEmail = userEmail;
    next();
  });

  // Connection handler
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    const userEmail = socket.data.userEmail;

    console.log(`User connected: ${userEmail} (${socket.id})`);

    // Store socket mapping
    userSocketMap.set(userId, socket);

    // Join user's personal room for direct notifications
    socket.join(`user:${userId}`);

    // ============================================================================
    // GROUP EVENT HANDLERS
    // ============================================================================

    socket.on('group:join', (groupId: string) => {
      socket.join(`group:${groupId}`);

      // Track group membership
      if (!groupRooms.has(groupId)) {
        groupRooms.set(groupId, new Set());
      }
      groupRooms.get(groupId)!.add(userId);

      console.log(`User ${userEmail} joined group ${groupId}`);

      // Notify others in the group
      socket.to(`group:${groupId}`).emit('group:user_joined', {
        groupId,
        userId,
        userEmail,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('group:leave', (groupId: string) => {
      socket.leave(`group:${groupId}`);

      // Remove from group tracking
      if (groupRooms.has(groupId)) {
        groupRooms.get(groupId)!.delete(userId);
        if (groupRooms.get(groupId)!.size === 0) {
          groupRooms.delete(groupId);
        }
      }

      console.log(`User ${userEmail} left group ${groupId}`);

      // Notify others in the group
      socket.to(`group:${groupId}`).emit('group:user_left', {
        groupId,
        userId,
        timestamp: new Date().toISOString(),
      });
    });

    // ============================================================================
    // EXPENSE EVENT HANDLERS
    // ============================================================================

    socket.on('expense:created', (data) => {
      const { groupId, expense } = data;

      console.log(`Expense created in group ${groupId}:`, expense.id);

      // Broadcast to all members in the group
      io.to(`group:${groupId}`).emit('expense:created', {
        groupId,
        expense,
        createdBy: userId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('expense:updated', (data) => {
      const { groupId, expense } = data;

      console.log(`Expense updated in group ${groupId}:`, expense.id);

      // Broadcast to all members in the group
      io.to(`group:${groupId}`).emit('expense:updated', {
        groupId,
        expense,
        updatedBy: userId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('expense:deleted', (data) => {
      const { groupId, expenseId } = data;

      console.log(`Expense deleted in group ${groupId}:`, expenseId);

      // Broadcast to all members in the group
      io.to(`group:${groupId}`).emit('expense:deleted', {
        groupId,
        expenseId,
        deletedBy: userId,
        timestamp: new Date().toISOString(),
      });
    });

    // ============================================================================
    // MEMBER EVENT HANDLERS
    // ============================================================================

    socket.on('member:invited', (data) => {
      const { groupId, member } = data;

      console.log(`Member invited to group ${groupId}:`, member.email);

      // Broadcast to all members in the group
      io.to(`group:${groupId}`).emit('member:invited', {
        groupId,
        member,
        invitedBy: userId,
        timestamp: new Date().toISOString(),
      });

      // If invited user is online, notify them directly
      const invitedUserSocket = userSocketMap.get(member.id);
      if (invitedUserSocket) {
        invitedUserSocket.emit('notification:new', {
          type: 'group_invitation',
          groupId,
          groupName: data.groupName,
          invitedBy: userEmail,
        });
      }
    });

    socket.on('member:joined', (data) => {
      const { groupId, member } = data;

      console.log(`Member joined group ${groupId}:`, member.email);

      // Broadcast to all members in the group
      io.to(`group:${groupId}`).emit('member:joined', {
        groupId,
        member,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('member:removed', (data) => {
      const { groupId, memberId } = data;

      console.log(`Member removed from group ${groupId}:`, memberId);

      // Broadcast to all members in the group
      io.to(`group:${groupId}`).emit('member:removed', {
        groupId,
        memberId,
        removedBy: userId,
        timestamp: new Date().toISOString(),
      });

      // Notify removed user directly if they're online
      const removedUserSocket = userSocketMap.get(memberId);
      if (removedUserSocket) {
        removedUserSocket.emit('notification:new', {
          type: 'removed_from_group',
          groupId,
          groupName: data.groupName,
        });
        removedUserSocket.leave(`group:${groupId}`);
      }
    });

    socket.on('member:role_updated', (data) => {
      const { groupId, memberId, role } = data;

      console.log(`Member role updated in group ${groupId}:`, memberId, role);

      // Broadcast to all members in the group
      io.to(`group:${groupId}`).emit('member:role_updated', {
        groupId,
        memberId,
        role,
        updatedBy: userId,
        timestamp: new Date().toISOString(),
      });
    });

    // ============================================================================
    // BALANCE EVENT HANDLERS
    // ============================================================================

    socket.on('balance:updated', (data) => {
      const { groupId, balances } = data;

      console.log(`Balances updated for group ${groupId}`);

      // Broadcast to all members in the group
      io.to(`group:${groupId}`).emit('balance:updated', {
        groupId,
        balances,
        timestamp: new Date().toISOString(),
      });
    });

    // ============================================================================
    // SETTLEMENT EVENT HANDLERS
    // ============================================================================

    socket.on('settlement:created', (data) => {
      const { groupId, settlement } = data;

      console.log(`Settlement created in group ${groupId}:`, settlement.id);

      // Broadcast to all members in the group
      io.to(`group:${groupId}`).emit('settlement:created', {
        groupId,
        settlement,
        createdBy: userId,
        timestamp: new Date().toISOString(),
      });

      // Notify payer and payee directly
      const payerSocket = userSocketMap.get(settlement.payerId);
      const payeeSocket = userSocketMap.get(settlement.payeeId);

      if (payerSocket) {
        payerSocket.emit('notification:new', {
          type: 'settlement_created',
          groupId,
          groupName: data.groupName,
          amount: settlement.amount,
          isPayer: true,
        });
      }

      if (payeeSocket && payeeSocket.id !== payerSocket?.id) {
        payeeSocket.emit('notification:new', {
          type: 'settlement_created',
          groupId,
          groupName: data.groupName,
          amount: settlement.amount,
          isPayer: false,
        });
      }
    });

    socket.on('settlement:completed', (data) => {
      const { groupId, settlementId } = data;

      console.log(`Settlement completed in group ${groupId}:`, settlementId);

      // Broadcast to all members in the group
      io.to(`group:${groupId}`).emit('settlement:completed', {
        groupId,
        settlementId,
        completedBy: userId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('settlement:cancelled', (data) => {
      const { groupId, settlementId } = data;

      console.log(`Settlement cancelled in group ${groupId}:`, settlementId);

      // Broadcast to all members in the group
      io.to(`group:${groupId}`).emit('settlement:cancelled', {
        groupId,
        settlementId,
        cancelledBy: userId,
        timestamp: new Date().toISOString(),
      });
    });

    // ============================================================================
    // ACTIVITY EVENT HANDLERS
    // ============================================================================

    socket.on('activity:logged', (data) => {
      const { groupId, activity } = data;

      console.log(`Activity logged in group ${groupId}:`, activity.type);

      // Broadcast to all members in the group
      io.to(`group:${groupId}`).emit('activity:logged', {
        groupId,
        activity,
        timestamp: new Date().toISOString(),
      });
    });

    // ============================================================================
    // TYPING INDICATOR
    // ============================================================================

    socket.on('typing:start', (data) => {
      const { groupId } = data;

      socket.to(`group:${groupId}`).emit('typing:indicator', {
        groupId,
        userId,
        userEmail,
        isTyping: true,
      });
    });

    socket.on('typing:stop', (data) => {
      const { groupId } = data;

      socket.to(`group:${groupId}`).emit('typing:indicator', {
        groupId,
        userId,
        isTyping: false,
      });
    });

    // ============================================================================
    // DISCONNECTION HANDLER
    // ============================================================================

    socket.on('disconnecting', () => {
      // User is disconnecting, handle room cleanup
      const rooms = socket.rooms;

      for (const room of rooms) {
        if (room.startsWith('group:')) {
          const groupId = room.replace('group:', '');

          if (groupRooms.has(groupId)) {
            groupRooms.get(groupId)!.delete(userId);
            if (groupRooms.get(groupId)!.size === 0) {
              groupRooms.delete(groupId);
            }
          }

          // Notify others in the group
          socket.to(`group:${groupId}`).emit('group:user_offline', {
            groupId,
            userId,
            timestamp: new Date().toISOString(),
          });
        }
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${userEmail} (${socket.id}) - Reason: ${reason}`);

      // Remove from socket mapping
      userSocketMap.delete(userId);

      // Clean up any remaining group associations
      for (const [groupId, members] of groupRooms.entries()) {
        if (members.has(userId)) {
          members.delete(userId);
          if (members.size === 0) {
            groupRooms.delete(groupId);
          }
        }
      }
    });

    // ============================================================================
    // ERROR HANDLER
    // ============================================================================

    socket.on('error', (error) => {
      console.error(`Socket error for ${userEmail}:`, error);
    });
  });

  // ============================================================================
  // SERVER-SIDE HELPER FUNCTIONS
  // ============================================================================

  // Get all active users in a group
  io.getGroupMembers = (groupId: string): string[] => {
    const members = groupRooms.get(groupId);
    return members ? Array.from(members) : [];
  };

  // Check if a user is online
  io.isUserOnline = (userId: string): boolean => {
    return userSocketMap.has(userId);
  };

  // Send notification to specific user
  io.notifyUser = (userId: string, notification: any) => {
    const socket = userSocketMap.get(userId);
    if (socket) {
      socket.emit('notification:new', notification);
      return true;
    }
    return false;
  };

  // Broadcast to group
  io.broadcastToGroup = (groupId: string, event: string, data: any) => {
    io.to(`group:${groupId}`).emit(event, data);
  };

  console.log('Socket.io server initialized');

  return io;
}

// Export types for use in client and server
export type { ServerToClientEvents, ClientToServerEvents } from './types';
