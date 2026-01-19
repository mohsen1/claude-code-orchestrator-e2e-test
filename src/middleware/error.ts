import { Request, Response, NextFunction } from 'express';

/**
 * Custom API Error class for known error types
 * Allows throwing errors with specific status codes and messages
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    stack?: string;
  };
}

/**
 * Error handler middleware
 * Catches all errors throughout the application and formats them into consistent JSON responses
 *
 * @param err - Error object (can be ApiError or generic Error)
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle ApiError instances
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle validation errors (from Zod or other validation libraries)
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }
  // Handle database errors
  else if (err.name === 'DatabaseError') {
    statusCode = 500;
    message = 'Database operation failed';
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  // Handle generic errors
  else if (err.message) {
    message = err.message;
  }

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message,
      statusCode,
    },
  };

  // Include stack trace in development mode
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    errorResponse.error.stack = err.stack;
  }

  // Log error for debugging (in production, use a proper logging service)
  if (statusCode >= 500) {
    console.error('Server Error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
    });
  } else {
    console.warn('Client Error:', {
      message: err.message,
      statusCode,
      url: req.url,
      method: req.method,
    });
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors and pass them to the error middleware
 *
 * @param fn - Async function to wrap
 * @returns Express middleware function
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found handler middleware
 * Handles requests to undefined routes
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.url} not found`,
      statusCode: 404,
    },
  });
};
