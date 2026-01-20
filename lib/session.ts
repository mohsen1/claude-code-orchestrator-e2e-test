import db from './db';
import { generateId, generateToken } from './auth';

export interface Session {
  id: string;
  userId: string;
  sessionToken: string;
  expires: Date;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
}

const SESSION_EXPIRY_DAYS = 30;

/**
 * Create a new session for a user
 */
export function createSession(userId: string): Session {
  const sessionId = generateId();
  const sessionToken = generateToken();
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_EXPIRY_DAYS);
  const now = new Date();

  const stmt = db.prepare(`
    INSERT INTO sessions (id, user_id, session_token, expires, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(sessionId, userId, sessionToken, expires.toISOString(), now.toISOString());

  return {
    id: sessionId,
    userId,
    sessionToken,
    expires,
    createdAt: now,
  };
}

/**
 * Get a session by token
 */
export function getSession(sessionToken: string): Session | null {
  const stmt = db.prepare(`
    SELECT id, user_id as userId, session_token as sessionToken,
           expires, created_at as createdAt
    FROM sessions
    WHERE session_token = ? AND expires > datetime('now')
  `);

  const row = stmt.get(sessionToken) as any;
  return row || null;
}

/**
 * Get user by session token
 */
export function getUserBySession(sessionToken: string): User | null {
  const session = getSession(sessionToken);
  if (!session) return null;

  const stmt = db.prepare(`
    SELECT id, email, name, image, email_verified as emailVerified
    FROM users
    WHERE id = ?
  `);

  const row = stmt.get(session.userId) as any;
  return row || null;
}

/**
 * Delete a session (logout)
 */
export function deleteSession(sessionToken: string): boolean {
  const stmt = db.prepare('DELETE FROM sessions WHERE session_token = ?');
  const result = stmt.run(sessionToken);
  return result.changes > 0;
}

/**
 * Clean up expired sessions
 */
export function cleanupExpiredSessions(): number {
  const stmt = db.prepare('DELETE FROM sessions WHERE expires <= datetime("now")');
  const result = stmt.run();
  return result.changes;
}

/**
 * Extend session expiration
 */
export function extendSession(sessionToken: string): Session | null {
  const session = getSession(sessionToken);
  if (!session) return null;

  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_EXPIRY_DAYS);

  const stmt = db.prepare(`
    UPDATE sessions
    SET expires = ?
    WHERE session_token = ?
  `);

  stmt.run(expires.toISOString(), sessionToken);

  return getSession(sessionToken);
}
