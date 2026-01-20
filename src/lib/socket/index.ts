/**
 * Socket.io initialization and configuration
 * This file exports utilities for integrating Socket.io with Next.js
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initSocketIO } from './server';
import Database from 'better-sqlite3';

let io: SocketIOServer | null = null;

/**
 * Initialize Socket.io with the HTTP server
 * Call this in your custom server setup (e.g., server.js or with next-http-proxy-middleware)
 */
export function initializeSocket(server: HTTPServer) {
  try {
    // Initialize database
    const dbPath = process.env.DATABASE_PATH || './expenses.db';
    const db = new Database(dbPath);

    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');

    // Initialize Socket.io
    io = initSocketIO(server, db);

    // Cleanup on server shutdown
    server.on('close', () => {
      if (io) {
        io.close();
        io = null;
      }
      db.close();
    });

    return io;
  } catch (error) {
    console.error('Failed to initialize Socket.io:', error);
    throw error;
  }
}

/**
 * Get the Socket.io server instance
 */
export function getIO(): SocketIOServer | null {
  return io;
}

// Re-export types and utilities
export * from './events';
export * from './server';
