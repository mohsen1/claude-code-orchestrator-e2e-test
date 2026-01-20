import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

interface UserPresence {
  userId: string;
  socketId: string;
  username: string;
  lastSeen: Date;
}

interface GroupPresence {
  groupId: string;
  onlineUsers: Map<string, UserPresence>;
}

export class PresenceManager {
  private io: SocketIOServer;
  private userPresence: Map<string, UserPresence>; // socketId -> UserPresence
  private groupPresence: Map<string, GroupPresence>; // groupId -> GroupPresence
  private userToSockets: Map<string, Set<string>>; // userId -> Set of socketIds
  private socketToUser: Map<string, string>; // socketId -> userId

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.userPresence = new Map();
    this.groupPresence = new Map();
    this.userToSockets = new Map();
    this.socketToUser = new Map();

    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Handle user joining with authentication
      socket.on('user:online', (data: { userId: string; username: string }) => {
        this.handleUserOnline(socket.id, data.userId, data.username);
      });

      // Handle joining a group
      socket.on('group:join', (data: { userId: string; groupId: string }) => {
        this.handleGroupJoin(socket, data.userId, data.groupId);
      });

      // Handle leaving a group
      socket.on('group:leave', (data: { groupId: string }) => {
        this.handleGroupLeave(socket, data.groupId);
      });

      // Handle presence heartbeat
      socket.on('presence:heartbeat', (data: { userId: string }) => {
        this.handleHeartbeat(socket.id, data.userId);
      });

      // Handle typing indicator
      socket.on('presence:typing', (data: { groupId: string; userId: string; isTyping: boolean }) => {
        this.handleTyping(socket, data.groupId, data.userId, data.isTyping);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket.id);
      });

      // Request current presence state
      socket.on('presence:get_state', (data: { groupId: string }, callback) => {
        const state = this.getGroupPresenceState(data.groupId);
        callback(state);
      });
    });
  }

  private handleUserOnline(socketId: string, userId: string, username: string): void {
    const presence: UserPresence = {
      userId,
      socketId,
      username,
      lastSeen: new Date(),
    };

    this.userPresence.set(socketId, presence);
    this.socketToUser.set(socketId, userId);

    // Track multiple sockets for the same user
    if (!this.userToSockets.has(userId)) {
      this.userToSockets.set(userId, new Set());
    }
    this.userToSockets.get(userId)!.add(socketId);

    // Notify all groups this user is in
    this.notifyUserStatusChange(userId, 'online');
  }

  private handleGroupJoin(socket: any, userId: string, groupId: string): void {
    socket.join(groupId);

    // Initialize group presence if doesn't exist
    if (!this.groupPresence.has(groupId)) {
      this.groupPresence.set(groupId, {
        groupId,
        onlineUsers: new Map(),
      });
    }

    const group = this.groupPresence.get(groupId)!;
    const userPresence = this.userPresence.get(socket.id);

    if (userPresence) {
      group.onlineUsers.set(socket.id, userPresence);
    }

    // Broadcast updated user list to group
    this.broadcastGroupPresence(groupId);

    // Notify others in the group
    socket.to(groupId).emit('presence:user_joined', {
      groupId,
      userId,
      users: this.getGroupOnlineUsers(groupId),
    });
  }

  private handleGroupLeave(socket: any, groupId: string): void {
    socket.leave(groupId);

    const group = this.groupPresence.get(groupId);
    if (group) {
      group.onlineUsers.delete(socket.id);
    }

    // Broadcast updated user list
    this.broadcastGroupPresence(groupId);
  }

  private handleHeartbeat(socketId: string, userId: string): void {
    const presence = this.userPresence.get(socketId);
    if (presence) {
      presence.lastSeen = new Date();
    }
  }

  private handleTyping(socket: any, groupId: string, userId: string, isTyping: boolean): void {
    socket.to(groupId).emit('presence:typing', {
      groupId,
      userId,
      isTyping,
    });
  }

  private handleDisconnect(socketId: string): void {
    console.log('User disconnected:', socketId);

    const userId = this.socketToUser.get(socketId);
    const presence = this.userPresence.get(socketId);

    if (userId && presence) {
      // Remove this socket from user's socket set
      const sockets = this.userToSockets.get(userId);
      if (sockets) {
        sockets.delete(socketId);

        // If no more sockets for this user, they're offline
        if (sockets.size === 0) {
          this.userToSockets.delete(userId);
          this.notifyUserStatusChange(userId, 'offline');
        }
      }

      // Remove from all groups
      this.groupPresence.forEach((group) => {
        if (group.onlineUsers.has(socketId)) {
          group.onlineUsers.delete(socketId);
          this.broadcastGroupPresence(group.groupId);
        }
      });

      this.socketToUser.delete(socketId);
      this.userPresence.delete(socketId);
    }
  }

  private notifyUserStatusChange(userId: string, status: 'online' | 'offline'): void {
    // Find all groups this user is in and notify
    this.groupPresence.forEach((group) => {
      const isUserInGroup = Array.from(group.onlineUsers.values()).some(
        (u) => u.userId === userId
      );

      if (isUserInGroup || status === 'offline') {
        this.io.to(group.groupId).emit('presence:user_status', {
          userId,
          status,
          timestamp: new Date(),
        });
      }
    });
  }

  private broadcastGroupPresence(groupId: string): void {
    const users = this.getGroupOnlineUsers(groupId);
    this.io.to(groupId).emit('presence:update', {
      groupId,
      users,
      count: users.length,
    });
  }

  public getGroupOnlineUsers(groupId: string): Array<{ userId: string; username: string; lastSeen: Date }> {
    const group = this.groupPresence.get(groupId);
    if (!group) return [];

    // Deduplicate users who might have multiple sockets
    const uniqueUsers = new Map<string, UserPresence>();
    group.onlineUsers.forEach((presence) => {
      const existing = uniqueUsers.get(presence.userId);
      if (!existing || presence.lastSeen > existing.lastSeen) {
        uniqueUsers.set(presence.userId, presence);
      }
    });

    return Array.from(uniqueUsers.values()).map((p) => ({
      userId: p.userId,
      username: p.username,
      lastSeen: p.lastSeen,
    }));
  }

  public getGroupPresenceState(groupId: string): {
    onlineUsers: Array<{ userId: string; username: string; lastSeen: Date }>;
    count: number;
  } {
    return {
      onlineUsers: this.getGroupOnlineUsers(groupId),
      count: this.getGroupOnlineUsers(groupId).length,
    };
  }

  public isUserOnline(userId: string): boolean {
    const sockets = this.userToSockets.get(userId);
    return sockets !== undefined && sockets.size > 0;
  }

  public getOnlineUserIds(): string[] {
    return Array.from(this.userToSockets.keys());
  }

  public broadcastToGroup(groupId: string, event: string, data: any): void {
    this.io.to(groupId).emit(event, data);
  }

  public broadcastToUser(userId: string, event: string, data: any): void {
    const sockets = this.userToSockets.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  public getIO(): SocketIOServer {
    return this.io;
  }

  public cleanupInactiveUsers(timeoutMs: number = 5 * 60 * 1000): void {
    const now = new Date();
    const socketsToRemove: string[] = [];

    this.userPresence.forEach((presence, socketId) => {
      const inactiveTime = now.getTime() - presence.lastSeen.getTime();
      if (inactiveTime > timeoutMs) {
        socketsToRemove.push(socketId);
      }
    });

    socketsToRemove.forEach((socketId) => {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.disconnect(true);
      }
      this.handleDisconnect(socketId);
    });
  }

  public getStats(): {
    totalConnections: number;
    uniqueUsers: number;
    activeGroups: number;
  } {
    const activeGroups = Array.from(this.groupPresence.values()).filter(
      (group) => group.onlineUsers.size > 0
    ).length;

    return {
      totalConnections: this.userPresence.size,
      uniqueUsers: this.userToSockets.size,
      activeGroups,
    };
  }
}

// Singleton instance
let presenceManager: PresenceManager | null = null;

export function initializePresence(httpServer: HttpServer): PresenceManager {
  if (!presenceManager) {
    presenceManager = new PresenceManager(httpServer);

    // Cleanup inactive users every 5 minutes
    setInterval(() => {
      presenceManager?.cleanupInactiveUsers();
    }, 5 * 60 * 1000);
  }
  return presenceManager;
}

export function getPresenceManager(): PresenceManager | null {
  return presenceManager;
}
