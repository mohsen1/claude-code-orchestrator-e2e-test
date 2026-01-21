import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { type Socket } from "net";
import winston from "winston";
import jwt from "jsonwebtoken";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

// Configure Winston logger
const logger = winston.createLogger({
  level: dev ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Add console transport in development
if (dev) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      logger.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
  });

  // Socket.IO authentication middleware
  io.use((socket, next) => {
    // Extract token from various possible locations
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "") ||
      socket.handshake.query?.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      // Verify JWT token
      const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
      const decoded = jwt.verify(token, jwtSecret) as {
        userId: string;
        email?: string;
      };

      // Attach user information to socket for use in event handlers
      (socket as any).user = {
        userId: decoded.userId,
        email: decoded.email,
      };

      next();
    } catch (err) {
      logger.error("Socket.IO authentication failed:", err);
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    logger.debug("Client connected:", socket.id);

    // Join a group room
    socket.on("join_group", ({ groupId, userId }) => {
      // Derive authenticated user identity from the handshake (if present)
      const handshake: any = socket.handshake as any;
      const authenticatedUserId: string | undefined =
        (handshake?.auth && typeof handshake.auth.userId === "string"
          ? handshake.auth.userId
          : undefined) ??
        (handshake?.query && typeof handshake.query.userId === "string"
          ? handshake.query.userId
          : undefined);

      // If we have an authenticated user id, ensure it matches the claimed userId
      if (authenticatedUserId && userId && userId !== authenticatedUserId) {
        console.warn(
          `Unauthorized join_group attempt: socket ${socket.id} claimed userId=${userId}, authenticated as ${authenticatedUserId}`,
        );
        socket.emit("error", "Unauthorized to join this group.");
        return;
      }

      // Basic validation of groupId
      if (typeof groupId !== "string" || !groupId.trim()) {
        console.warn(`Invalid groupId provided by socket ${socket.id}:`, groupId);
        socket.emit("error", "Invalid group identifier.");
        return;
      }

      // If the handshake specifies allowed groups, enforce membership
      const allowedGroups: unknown = handshake?.auth?.groups;
      if (Array.isArray(allowedGroups) && !allowedGroups.includes(groupId)) {
        console.warn(
          `Unauthorized join_group attempt: socket ${socket.id} not allowed to join group ${groupId}`,
        );
        socket.emit("error", "Unauthorized to join this group.");
        return;
      }

      socket.join(groupId);
      console.log(`User ${userId ?? authenticatedUserId ?? socket.id} joined group ${groupId}`);
    });

    // Leave a group room
    socket.on("leave_group", ({ groupId }) => {
      socket.leave(groupId);
      logger.debug(`Client left group ${groupId}`);
    });

    // Expense added event
    socket.on("expense_added", ({ groupId, expense }) => {
      // Broadcast to all users in the group except sender
      socket.to(groupId).emit("expense_added", expense);
    });

    // Settlement created event
    socket.on("settlement_created", ({ groupId, settlement }) => {
      socket.to(groupId).emit("settlement_created", settlement);
    });

    // Member joined event
    socket.on("member_joined", ({ groupId, member }) => {
      socket.to(groupId).emit("member_joined", member);
    });

    socket.on("disconnect", () => {
      logger.debug("Client disconnected:", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      logger.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      logger.info(`> Ready on http://${hostname}:${port}`);
    });
});
