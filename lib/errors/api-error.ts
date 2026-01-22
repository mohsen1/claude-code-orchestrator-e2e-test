/**
 * Custom API error class for consistent error handling
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

/**
 * Common API error constructors
 */
export class BadRequestError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(400, 'BAD_REQUEST', message, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(403, 'FORBIDDEN', message);
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} not found`);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(409, 'CONFLICT', message, details);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(422, 'VALIDATION_ERROR', message, details);
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(500, 'INTERNAL_SERVER_ERROR', message);
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service temporarily unavailable') {
    super(503, 'SERVICE_UNAVAILABLE', message);
  }
}
