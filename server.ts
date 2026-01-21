import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { type Socket } from "net";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

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
      console.error("Error occurred handling", req.url, err);
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
    // In production, you would validate the session token here
    // For now, we'll allow all connections
    next();
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join a group room
    socket.on("join_group", ({ groupId, userId }) => {
      // TODO: Validate user has access to this group
      socket.join(groupId);
      console.log(`User ${userId} joined group ${groupId}`);
    });

    // Leave a group room
    socket.on("leave_group", ({ groupId }) => {
      socket.leave(groupId);
      console.log(`Client left group ${groupId}`);
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
      console.log("Client disconnected:", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
