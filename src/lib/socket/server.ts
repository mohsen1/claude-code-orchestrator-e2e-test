import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
import { SocketEvents, SocketUserData, AckResponse } from './events';
import { registerGroupHandlers } from './handlers/groups';
import { registerExpenseHandlers } from './handlers/expenses';
import { registerSettlementHandlers } from './handlers/settlements';

// Extend Socket type to include user data
export interface AuthenticatedSocket extends Socket {
  data: {
    user: SocketUserData;
    groups: Set<string>;
  };
}

// Socket.IO server instance
let io: SocketIOServer | null = null;

/**
 * Initialize Socket.IO server with Next.js
 */
export function initSocket(server: HTTPServer) {
  if (io) {
    return io;
  }

  io = new SocketIOServer(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(async (socket: any, next) => {
    try {
      // Extract user from NextAuth session cookie
      const sessionToken = socket.handshake.auth.sessionToken;

      if (!sessionToken) {
        return next(new Error('Authentication failed: No session token'));
      }

      // Verify session with NextAuth
      // In production, you would validate the session token
      // against your database or session store
      const user = await verifySession(sessionToken);

      if (!user) {
        return next(new Error('Authentication failed: Invalid session'));
      }

      // Attach user data to socket
      socket.data = {
        user,
        groups: new Set(),
      };

      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on(SocketEvents.CONNECT, (socket: any) => {
    console.log(`User connected: ${socket.data.user.id}`);

    // Register all event handlers
    registerGroupHandlers(io, socket);
    registerExpenseHandlers(io, socket);
    registerSettlementHandlers(io, socket);

    // Handle manual group join
    socket.on(SocketEvents.GROUP_JOIN, async (groupId: string, callback?: (response: AckResponse) => void) => {
      try {
        await joinGroup(io, socket, groupId);
        callback?.({ success: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to join group';
        callback?.({ success: false, error: message });
      }
    });

    // Handle manual group leave
    socket.on(SocketEvents.GROUP_LEAVE, (groupId: string, callback?: (response: AckResponse) => void) => {
      try {
        leaveGroup(socket, groupId);
        callback?.({ success: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to leave group';
        callback?.({ success: false, error: message });
      }
    });

    // Handle disconnection
    socket.on(SocketEvents.DISCONNECT, () => {
      console.log(`User disconnected: ${socket.data.user.id}`);
      handleDisconnect(socket);
    });

    // Handle errors
    socket.on(SocketEvents.ERROR, (error) => {
      console.error(`Socket error for user ${socket.data.user.id}:`, error);
    });

    // Emit success connection
    socket.emit(SocketEvents.ACK, {
      success: true,
      data: { userId: socket.data.user.id },
    });
  });

  return io;
}

/**
 * Get the Socket.IO server instance
 */
export function getSocketServer(): SocketIOServer | null {
  return io;
}

/**
 * Verify session token and return user data
 * In production, this would validate against your session store
 */
async function verifySession(sessionToken: string): Promise<SocketUserData | null> {
  // TODO: Implement actual session verification with NextAuth
  // This is a placeholder that should be replaced with real authentication
  try {
    // Example: Fetch session from database
    // const session = await getSession(sessionToken);
    // if (!session?.user) return null;
    // return { userId: session.user.id, email: session.user.email, name: session.user.name };

    // For now, decode a basic JWT (implement proper verification)
    const parts = sessionToken.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return {
      userId: payload.userId || payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

/**
 * Join a group room
 */
async function joinGroup(io: SocketIOServer, socket: any, groupId: string) {
  // Verify user is a member of the group
  const isMember = await verifyGroupMembership(socket.data.user.userId, groupId);

  if (!isMember) {
    throw new Error('User is not a member of this group');
  }

  // Join the group's room
  const roomName = `group:${groupId}`;
  socket.join(roomName);
  socket.data.groups.add(groupId);

  console.log(`User ${socket.data.user.id} joined group ${groupId}`);

  // Notify others in the group
  socket.to(roomName).emit(SocketEvents.MEMBER_ADDED, {
    groupId,
    member: {
      id: socket.data.user.id,
      name: socket.data.user.name,
      email: socket.data.user.email,
    },
    timestamp: Date.now(),
  });
}

/**
 * Leave a group room
 */
function leaveGroup(socket: any, groupId: string) {
  const roomName = `group:${groupId}`;
  socket.leave(roomName);
  socket.data.groups.delete(groupId);

  console.log(`User ${socket.data.user.id} left group ${groupId}`);

  // Notify others in the group
  socket.to(roomName).emit(SocketEvents.MEMBER_REMOVED, {
    groupId,
    memberId: socket.data.user.id,
    timestamp: Date.now(),
  });
}

/**
 * Verify user is a member of the group
 */
async function verifyGroupMembership(userId: string, groupId: string): Promise<boolean> {
  // TODO: Implement actual membership verification
  // This should check the database to verify the user is a member
  try {
    // Example: const membership = await db.query.groupMembers.findFirst({
    //   where: eq(groupMembers.groupId, groupId) && eq(groupMembers.userId, userId)
    // });
    // return !!membership;
    return true; // Placeholder
  } catch {
    return false;
  }
}

/**
 * Handle socket disconnection
 */
function handleDisconnect(socket: any) {
  // Leave all group rooms
  socket.data.groups.forEach((groupId: string) => {
    const roomName = `group:${groupId}`;
    socket.leave(roomName);

    // Notify others in the group
    socket.to(roomName).emit(SocketEvents.MEMBER_REMOVED, {
      groupId,
      memberId: socket.data.user.id,
      timestamp: Date.now(),
    });
  });

  // Clear groups set
  socket.data.groups.clear();
}

/**
 * Helper function to broadcast to a group
 */
export function broadcastToGroup(
  io: SocketIOServer,
  groupId: string,
  event: string,
  data: any
) {
  const roomName = `group:${groupId}`;
  io.to(roomName).emit(event, {
    ...data,
    groupId,
    timestamp: Date.now(),
  });
}

/**
 * Helper function to send to specific user
 */
export function sendToUser(
  io: SocketIOServer,
  userId: string,
  event: string,
  data: any
) {
  const roomName = `user:${userId}`;
  io.to(roomName).emit(event, data);
}

/**
 * API route handler for Socket.IO
 * This is used by Next.js API routes to get the socket instance
 */
export function socketHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!io) {
    res.status(500).json({ error: 'Socket.IO not initialized' });
    return;
  }

  // The socket upgrade is handled by the server, not this handler
  res.status(200).json({ message: 'Socket.IO server running' });
}
