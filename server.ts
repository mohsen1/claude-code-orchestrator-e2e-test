/**
 * SplitSync Custom Server
 *
 * This custom server integrates Next.js with Socket.io for real-time features.
 * Required because:
 * - Socket.io needs a stateful connection (not compatible with serverless)
 * - SQLite database needs file system access
 * - Single Docker deployment architecture
 */

import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { type Socket } from "net";
import { type DefaultEventsMap } from "socket.io/dist/typed-events";

// Environment configuration
const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOSTNAME || "localhost";

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Socket.io type definitions
interface ServerToClientEvents {
  expense_added: (data: { groupId: string; expense: unknown }) => void;
  expense_updated: (data: { groupId: string; expense: unknown }) => void;
  expense_deleted: (data: { groupId: string; expenseId: string }) => void;
  group_updated: (data: { groupId: string }) => void;
  member_joined: (data: { groupId: string; user: unknown }) => void;
  settlement_created: (data: { groupId: string; settlement: unknown }) => void;
  notification: (data: { message: string; type: string }) => void;
}

interface ClientToServerEvents {
  join_group: (groupId: string) => void;
  leave_group: (groupId: string) => void;
  typing_start: (data: { groupId: string; userId: string }) => void;
  typing_stop: (data: { groupId: string; userId: string }) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  userId?: string;
  username?: string;
  groups: Set<string>;
}

type TypedSocket = Socket<
  DefaultEventsMap,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      // Parse URL
      const parsedUrl = parse(req.url!, true);

      // Let Next.js handle the request
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  // Initialize Socket.io
  const io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"],
  });

  // Socket.io connection handling
  io.on("connection", (socket: TypedSocket) => {
    console.log(`Client connected: ${socket.id}`);

    // Initialize socket data
    socket.data.groups = new Set();

    /**
     * Join a group room
     * Rooms allow broadcasting to specific group members
     */
    socket.on("join_group", (groupId: string) => {
      try {
        // Validate groupId
        if (!groupId || typeof groupId !== "string") {
          throw new Error("Invalid groupId");
        }

        // Join the room
        socket.join(groupId);
        socket.data.groups.add(groupId);

        console.log(`Socket ${socket.id} joined group ${groupId}`);

        // Notify others in the group
        socket.to(groupId).emit("member_joined", {
          groupId,
          socketId: socket.id,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error joining group:", error);
        socket.emit("notification", {
          message: "Failed to join group",
          type: "error",
        });
      }
    });

    /**
     * Leave a group room
     */
    socket.on("leave_group", (groupId: string) => {
      try {
        socket.leave(groupId);
        socket.data.groups.delete(groupId);

        console.log(`Socket ${socket.id} left group ${groupId}`);
      } catch (error) {
        console.error("Error leaving group:", error);
      }
    });

    /**
     * Typing indicators for collaborative features
     */
    socket.on("typing_start", (data: { groupId: string; userId: string }) => {
      socket.to(data.groupId).emit("user_typing", {
        userId: data.userId,
        groupId: data.groupId,
      });
    });

    socket.on("typing_stop", (data: { groupId: string; userId: string }) => {
      socket.to(data.groupId).emit("user_stopped_typing", {
        userId: data.userId,
        groupId: data.groupId,
      });
    });

    /**
     * Handle disconnection
     */
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);

      // Leave all groups
      socket.data.groups.forEach((groupId) => {
        socket.leave(groupId);
      });
      socket.data.groups.clear();
    });

    /**
     * Error handling
     */
    socket.on("error", (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  /**
   * Make io instance available globally for API routes
   * This allows API routes to emit socket events
   */
  (global as any).io = io;

  /**
   * Start listening
   */
  httpServer
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Environment: ${dev ? "development" : "production"}`);
      console.log(`> Socket.io server initialized`);
    })
    .on("error", (err: Error) => {
      console.error("Server error:", err);
      process.exit(1);
    });

  /**
   * Graceful shutdown
   */
  const gracefulShutdown = () => {
    console.log("Shutting down gracefully...");

    io.close(() => {
      httpServer.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);
});

/**
 * Export a helper function for API routes to emit events
 * Usage in API route: import { emitToGroup } from '@/server'
 */
export const emitToGroup = (
  groupId: string,
  event: keyof ServerToClientEvents,
  data: Parameters<ServerToClientEvents[keyof ServerToClientEvents]>[0]
) => {
  const io = (global as any).io as SocketIOServer;
  if (io) {
    io.to(groupId).emit(event, data);
  } else {
    console.warn("Socket.io not initialized");
  }
};

/**
 * Health check endpoint handler
 */
export const healthCheck = () => ({
  status: "healthy",
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  memory: process.memoryUsage(),
});
