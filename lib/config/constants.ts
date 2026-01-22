/**
 * Application-wide constants
 * Centralized configuration values for consistency
 */

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'SplitSync';
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '3.0.0';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// Session configuration
export const SESSION_MAX_AGE = Number.parseInt(process.env.SESSION_MAX_AGE ?? '604800', 10); // 7 days
export const SESSION_UPDATE_AGE = Number.parseInt(process.env.SESSION_UPDATE_AGE ?? '86400', 10); // 1 day

// Security - Rate limiting
export const RATE_LIMIT_MAX = Number.parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10);
export const RATE_LIMIT_WINDOW_MS = Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10); // 15 minutes

// Invite link configuration
export const INVITE_LINK_EXPIRATION_HOURS = Number.parseInt(
  process.env.INVITE_LINK_EXPIRATION_HOURS ?? '168',
  10
); // 7 days

// File upload configuration
export const MAX_FILE_SIZE = Number.parseInt(process.env.MAX_FILE_SIZE ?? '5242880', 10); // 5MB
export const ALLOWED_FILE_TYPES = (process.env.ALLOWED_FILE_TYPES ?? 'image/jpeg,image/png,image/webp,application/pdf').split(',');

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Currency
export const DEFAULT_CURRENCY = 'USD';

// WebSocket/Socket.io
export const SOCKET_IO_CORS_ORIGIN = process.env.SOCKET_IO_CORS_ORIGIN ?? APP_URL;
export const SOCKET_IO_PING_TIMEOUT = Number.parseInt(
  process.env.SOCKET_IO_PING_TIMEOUT ?? '60000',
  10
);
export const SOCKET_IO_PING_INTERVAL = Number.parseInt(
  process.env.SOCKET_IO_PING_INTERVAL ?? '25000',
  10
);

// Feature flags
export const FEATURE_FLAGS = {
  emailNotifications: process.env.FEATURE_EMAIL_NOTIFICATIONS === 'true',
  receiptUploads: process.env.FEATURE_RECEIPT_UPLOADS !== 'false', // default true
  analytics: process.env.FEATURE_ANALYTICS === 'true',
} as const;
