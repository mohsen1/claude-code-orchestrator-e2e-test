import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
import { GroupHandler } from './handlers/group-handler';
import { ExpenseHandler } from './handlers/expense-handler';

interface Database {
  prepare(sql: string): any;
  exec(sql: string): void;
}

let io: SocketIOServer | null = null;

/**
 * Initialize Socket.io server with Next.js
 */
export function initSocketIO(server: any, db: Database) {
  if (io) {
    return io;
  }

  // Create Socket.io server
  io = new SocketIOServer(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Initialize handlers
  const groupHandler = new GroupHandler(io, db);
  const expenseHandler = new ExpenseHandler(io, db);

  // Authentication middleware
  io.use(async (socket: any, next) => {
    try {
      // Get session token from handshake
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify the session with NextAuth
      // In production, you'd verify the JWT token here
      // For now, we'll extract the user ID from the session
      const getSession = await import('next-auth/next').then((mod) => mod.getSession);
      const session = await getSession({
        req: socket.handshake as unknown as NextApiRequest,
      });

      if (!session?.user) {
        return next(new Error('Authentication error: Invalid session'));
      }

      // Attach user info to socket
      socket.userId = (session.user as any).id;
      socket.userName = session.user.name;
      socket.userEmail = session.user.email;

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket: any) => {
    console.log(`Client connected: ${socket.id} (User: ${socket.userId})`);

    // Set up group event handlers
    groupHandler.handleJoinGroup(socket);
    groupHandler.handleLeaveGroup(socket);
    groupHandler.handleAddMember(socket);
    groupHandler.handleRemoveMember(socket);

    // Set up expense event handlers
    expenseHandler.handleCreateExpense(socket);
    expenseHandler.handleUpdateExpense(socket);
    expenseHandler.handleDeleteExpense(socket);
    expenseHandler.handleSettleUp(socket);

    // Handle disconnect
    socket.on('disconnect', (reason: string) => {
      console.log(`Client disconnected: ${socket.id} (Reason: ${reason})`);
    });

    // Handle errors
    socket.on('error', (error: Error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  console.log('Socket.io server initialized');

  return io;
}

/**
 * Get Socket.io server instance
 */
export function getSocketIO(): SocketIOServer | null {
  return io;
}

/**
 * API route handler for Socket.io
 * This is used by Next.js API routes
 */
export function configSocketIO() {
  return {
    api: {
      bodyParser: false,
    },
  };
}

/**
 * Helper function to broadcast events to a group
 */
export function broadcastToGroup(groupId: string, event: string, data: any) {
  if (io) {
    io.to(groupId).emit(event, data);
  }
}

/**
 * Helper function to get active connections in a group
 */
export function getGroupConnections(groupId: string): Promise<string[]> {
  return new Promise((resolve) => {
    if (!io) {
      resolve([]);
      return;
    }

    const room = io.sockets.adapter.rooms.get(groupId);
    const sockets = room ? Array.from(room) : [];
    resolve(sockets);
  });
}

/**
 * Helper function to get user's active sockets
 */
export function getUserSockets(userId: string): Promise<string[]> {
  return new Promise((resolve) => {
    if (!io) {
      resolve([]);
      return;
    }

    const sockets: string[] = [];
    io.sockets.sockets.forEach((socket: any) => {
      if (socket.userId === userId) {
        sockets.push(socket.id);
      }
    });
    resolve(sockets);
  });
}
