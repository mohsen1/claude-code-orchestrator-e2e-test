import { NextResponse } from 'next/server';
import { type ApiResponse } from '@/lib/types/common';
import { ApiError } from '@/lib/errors/api-error';
import { ZodError } from 'zod';

/**
 * Utility functions for creating consistent API responses
 */

/**
 * Create a successful API response
 */
export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Create an error API response
 */
export function errorResponse(
  code: string,
  message: string,
  status = 500,
  details?: unknown
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

/**
 * Handle ApiError instances and create appropriate response
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return errorResponse(
      'VALIDATION_ERROR',
      'Invalid input data',
      422,
      error.errors
    );
  }

  if (error instanceof Error) {
    return errorResponse(
      'INTERNAL_SERVER_ERROR',
      process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
      500,
      process.env.NODE_ENV === 'development' ? error.stack : undefined
    );
  }

  return errorResponse(
    'INTERNAL_SERVER_ERROR',
    'An unexpected error occurred',
    500
  );
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): NextResponse<ApiResponse> {
  return successResponse({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
