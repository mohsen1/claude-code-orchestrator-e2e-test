/**
 * SplitSync Custom Server (JavaScript Runtime Version)
 *
 * This is the compiled JavaScript version for Docker runtime.
 * For development, use server.ts (TypeScript version).
 *
 * The custom server integrates Next.js with Socket.io for real-time features.
 */

const http = require("node:http");
const next = require("next");
const { Server: SocketIOServer } = require("socket.io");

// Environment configuration
const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOSTNAME || "localhost";

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = http.createServer(async (req, res) => {
    try {
      // Let Next.js handle the request
      await handle(req, res);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  // Initialize Socket.io
  const io = new SocketIOServer(httpServer, {
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
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Initialize socket data
    socket.data = socket.data || {};
    socket.data.groups = new Set();

    /**
     * Join a group room
     * Rooms allow broadcasting to specific group members
     */
    socket.on("join_group", (groupId) => {
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
    socket.on("leave_group", (groupId) => {
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
    socket.on("typing_start", (data) => {
      socket.to(data.groupId).emit("user_typing", {
        userId: data.userId,
        groupId: data.groupId,
      });
    });

    socket.on("typing_stop", (data) => {
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
      if (socket.data.groups) {
        socket.data.groups.forEach((groupId) => {
          socket.leave(groupId);
        });
        socket.data.groups.clear();
      }
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
  global.io = io;

  /**
   * Start listening
   */
  httpServer
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Environment: ${dev ? "development" : "production"}`);
      console.log(`> Socket.io server initialized`);
    })
    .on("error", (err) => {
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
 * Health check endpoint handler
 */
const healthCheck = () => ({
  status: "healthy",
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  memory: process.memoryUsage(),
});

module.exports = { healthCheck };
