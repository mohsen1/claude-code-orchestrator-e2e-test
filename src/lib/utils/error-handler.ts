// Error handling utilities for group management

export enum ErrorCode {
  // Group errors (1000-1099)
  GROUP_NOT_FOUND = 1000,
  GROUP_ALREADY_EXISTS = 1001,
  GROUP_NAME_REQUIRED = 1002,
  GROUP_LIMIT_REACHED = 1003,

  // Member errors (1100-1199)
  MEMBER_NOT_FOUND = 1100,
  MEMBER_ALREADY_EXISTS = 1101,
  MEMBER_LIMIT_REACHED = 1102,
  NOT_GROUP_MEMBER = 1103,
  INSUFFICIENT_PERMISSIONS = 1104,
  CANNOT_REMOVE_OWNER = 1105,
  CANNOT_CHANGE_OWNER_ROLE = 1106,

  // Expense errors (1200-1299)
  EXPENSE_NOT_FOUND = 1200,
  INVALID_AMOUNT = 1201,
  INVALID_SPLIT_TYPE = 1202,
  SPLIT_TOTAL_MISMATCH = 1203,
  PAID_BY_NOT_MEMBER = 1204,
  SPLIT_USER_NOT_MEMBER = 1205,

  // Settlement errors (1300-1399)
  SETTLEMENT_NOT_FOUND = 1300,
  INVALID_SETTLEMENT_AMOUNT = 1301,
  NO_BALANCE_TO_SETTLE = 1302,

  // Invite errors (1400-1499)
  INVITE_NOT_FOUND = 1400,
  INVITE_EXPIRED = 1401,
  INVITE_ALREADY_ACCEPTED = 1402,
  INVALID_INVITE_TOKEN = 1403,
  ALREADY_GROUP_MEMBER = 1404,

  // Validation errors (1500-1599)
  VALIDATION_ERROR = 1500,
  INVALID_INPUT = 1501,
  MISSING_REQUIRED_FIELD = 1502,
}

export class GroupError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number = 400,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GroupError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GroupError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

// Specific error constructors for common scenarios
export class GroupNotFoundError extends GroupError {
  constructor(groupId: string) {
    super(
      `Group with ID "${groupId}" not found`,
      ErrorCode.GROUP_NOT_FOUND,
      404,
      { groupId }
    );
    this.name = 'GroupNotFoundError';
  }
}

export class MemberNotFoundError extends GroupError {
  constructor(memberId: string) {
    super(
      `Member with ID "${memberId}" not found`,
      ErrorCode.MEMBER_NOT_FOUND,
      404,
      { memberId }
    );
    this.name = 'MemberNotFoundError';
  }
}

export class NotGroupMemberError extends GroupError {
  constructor(groupId: string, userId: string) {
    super(
      'User is not a member of this group',
      ErrorCode.NOT_GROUP_MEMBER,
      403,
      { groupId, userId }
    );
    this.name = 'NotGroupMemberError';
  }
}

export class InsufficientPermissionsError extends GroupError {
  constructor(action: string, requiredRole: string) {
    super(
      `Insufficient permissions to ${action}. Required role: ${requiredRole}`,
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      403,
      { action, requiredRole }
    );
    this.name = 'InsufficientPermissionsError';
  }
}

export class ExpenseNotFoundError extends GroupError {
  constructor(expenseId: string) {
    super(
      `Expense with ID "${expenseId}" not found`,
      ErrorCode.EXPENSE_NOT_FOUND,
      404,
      { expenseId }
    );
    this.name = 'ExpenseNotFoundError';
  }
}

export class InvalidAmountError extends GroupError {
  constructor(amount: number, reason: string) {
    super(
      `Invalid amount: ${reason}`,
      ErrorCode.INVALID_AMOUNT,
      400,
      { amount, reason }
    );
    this.name = 'InvalidAmountError';
  }
}

export class InviteExpiredError extends GroupError {
  constructor(expiredAt: Date) {
    super(
      'Invite has expired',
      ErrorCode.INVITE_EXPIRED,
      410,
      { expiredAt: expiredAt.toISOString() }
    );
    this.name = 'InviteExpiredError';
  }
}

export class ValidationError extends GroupError {
  constructor(field: string, message: string) {
    super(
      `Validation failed for ${field}: ${message}`,
      ErrorCode.VALIDATION_ERROR,
      400,
      { field, message }
    );
    this.name = 'ValidationError';
  }
}

// Error response formatter for API routes
export function formatErrorResponse(error: unknown) {
  if (error instanceof GroupError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
      },
      status: error.statusCode,
    };
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as { issues: Array<{ path: string[]; message: string }> };
    return {
      error: {
        message: 'Validation failed',
        code: ErrorCode.VALIDATION_ERROR,
        details: {
          issues: zodError.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
      },
      status: 400,
    };
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      error: {
        message: 'An unexpected error occurred',
        code: ErrorCode.VALIDATION_ERROR,
        details: {
          originalMessage: error.message,
        },
      },
      status: 500,
    };
  }

  return {
    error: {
      message: 'An unexpected error occurred',
      code: ErrorCode.VALIDATION_ERROR,
    },
    status: 500,
  };
}

// Async error wrapper for route handlers
export function asyncHandler<T>(
  handler: () => Promise<T>
): Promise<T> {
  return handler().catch((error) => {
    throw error;
  });
}

// Type guard to check if error is a GroupError
export function isGroupError(error: unknown): error is GroupError {
  return error instanceof GroupError;
}
