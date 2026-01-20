/**
 * Custom API Error classes for consistent error handling
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public fields?: Record<string, string[]>) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super(404, message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized access') {
    super(401, message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Access forbidden') {
    super(403, message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(500, message, 'INTERNAL_SERVER_ERROR');
    this.name = 'InternalServerError';
  }
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        ...(error instanceof ValidationError && error.fields ? { fields: error.fields } : {}),
      },
      status: error.statusCode,
    };
  }

  if (error instanceof Error) {
    return {
      error: {
        message: error.message,
        code: 'INTERNAL_SERVER_ERROR',
      },
      status: 500,
    };
  }

  return {
    error: {
      message: 'An unexpected error occurred',
      code: 'INTERNAL_SERVER_ERROR',
    },
    status: 500,
  };
}

/**
 * Handler wrapper that catches errors and formats responses
 */
export function withErrorHandler<T>(
  handler: () => Promise<T>
): Promise<{ data?: T; error?: ReturnType<typeof formatErrorResponse> }> {
  return handler()
    .then((data) => ({ data }))
    .catch((error) => ({ error: formatErrorResponse(error) }));
}
