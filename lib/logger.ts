/**
 * Structured logging utility with environment-aware configuration
 * Provides consistent logging format across the application
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const CURRENT_LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) ?? 'info';
const CURRENT_LOG_LEVEL_VALUE = LOG_LEVELS[CURRENT_LOG_LEVEL];

/**
 * Format a log entry as JSON string
 */
function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

/**
 * Core logging function
 */
function log(level: LogLevel, message: string, context?: string, data?: unknown, error?: Error): void {
  if (LOG_LEVELS[level] > CURRENT_LOG_LEVEL_VALUE) {
    return; // Skip logs below current level
  }

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context && { context }),
    ...(data && { data }),
    ...(error && {
      error: {
        message: error.message,
        ...(error.stack && { stack: error.stack }),
        ...(error as unknown as { code?: string }).code && { code: (error as unknown as { code: string }).code },
      },
    }),
  };

  const formatted = formatLogEntry(entry);

  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'debug':
      console.debug(formatted);
      break;
    case 'info':
    default:
      console.log(formatted);
      break;
  }
}

/**
 * Logger object with methods for each log level
 */
export const logger = {
  error: (message: string, context?: string, error?: Error, data?: unknown) => {
    log('error', message, context, data, error);
  },
  warn: (message: string, context?: string, data?: unknown) => {
    log('warn', message, context, data);
  },
  info: (message: string, context?: string, data?: unknown) => {
    log('info', message, context, data);
  },
  debug: (message: string, context?: string, data?: unknown) => {
    log('debug', message, context, data);
  },
};

export default logger;
