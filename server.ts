import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import { Server } from "socket.io";
import type { Socket } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

interface SocketWithData extends Socket {
  data: {
    userId?: string;
    sessionId?: string;
  };
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: dev ? "http://localhost:3000" : process.env.NEXT_PUBLIC_APP_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket: SocketWithData) => {
    console.log("Client connected:", socket.id);

    socket.on("join_group", ({ groupId, userId }: { groupId: string; userId: string }) => {
      // In production, validate that userId has access to groupId
      socket.data.userId = userId;
      socket.join(groupId);
      console.log(`User ${userId} joined group ${groupId}`);
    });

    socket.on("leave_group", ({ groupId }: { groupId: string }) => {
      socket.leave(groupId);
      console.log(`User left group ${groupId}`);
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
