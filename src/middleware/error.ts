import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 * Catches all errors and returns consistent JSON error responses
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';

  // Handle known application errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle Zod validation errors (should be caught by validation middleware, but just in case)
  else if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Invalid request data';
  }
  // Handle other error types with status codes
  else if ('statusCode' in err && typeof err.statusCode === 'number') {
    statusCode = err.statusCode as number;
    message = err.message;
  }

  // Log error for debugging (in production, use proper logging service)
  if (statusCode === 500) {
    console.error('Error:', err);
  }

  // Send error response
  res.status(statusCode).json({
    error: message
  });
};

/**
 * Not found error handler for undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 * Use this to wrap async route handlers to ensure errors are passed to error middleware
 * @param fn - Async route handler function
 * @returns Express middleware function with error handling
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
