import { createServer } from 'node:http';
import { parse } from 'node:url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { type Socket } from 'socket.io';
import { type DefaultEventsMap } from 'socket.io/dist/typed-events';
import { type Server as HTTPServer } from 'node:http';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Type definitions for Socket.io
interface SocketWithAuth extends Socket {
  userId?: string;
}

app.prepare().then(() => {
  const httpServer: HTTPServer = createServer(async (req, res) => {
    try {
      // Parse URL
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Initialize Socket.io
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket.io authentication middleware
  io.use((socket: SocketWithAuth, next) => {
    // In production, verify JWT token from handshake auth
    const token = socket.handshake.auth.token;

    if (!token && !dev) {
      return next(new Error('Authentication error'));
    }

    // TODO: Verify and decode JWT token to get userId
    // For now, in development, we'll skip this check
    if (dev) {
      socket.userId = socket.handshake.auth.userId || 'dev-user';
      return next();
    }

    // const decoded = verifyJwt(token);
    // socket.userId = decoded.userId;
    next();
  });

  // Socket.io connection handling
  io.on('connection', (socket: SocketWithAuth) => {
    console.log(`User connected: ${socket.userId}`);

    // Join a group room
    socket.on('join_group', (groupId: string) => {
      // TODO: Verify user is a member of the group
      socket.join(groupId);
      console.log(`User ${socket.userId} joined group ${groupId}`);
    });

    // Leave a group room
    socket.on('leave_group', (groupId: string) => {
      socket.leave(groupId);
      console.log(`User ${socket.userId} left group ${groupId}`);
    });

    // Handle new expense
    socket.on('new_expense', (data: { groupId: string; expense: unknown }) => {
      // Broadcast to all users in the group except sender
      socket.to(data.groupId).emit('expense_added', data.expense);
    });

    // Handle expense updates
    socket.on('update_expense', (data: { groupId: string; expense: unknown }) => {
      socket.to(data.groupId).emit('expense_updated', data.expense);
    });

    // Handle expense deletion
    socket.on('delete_expense', (data: { groupId: string; expenseId: string }) => {
      socket.to(data.groupId).emit('expense_deleted', data.expenseId);
    });

    // Handle settlements
    socket.on('new_settlement', (data: { groupId: string; settlement: unknown }) => {
      socket.to(data.groupId).emit('settlement_added', data.settlement);
    });

    // Handle new member joining group
    socket.on('member_joined', (data: { groupId: string; member: unknown }) => {
      socket.to(data.groupId).emit('group_member_added', data.member);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  // Start server
  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
