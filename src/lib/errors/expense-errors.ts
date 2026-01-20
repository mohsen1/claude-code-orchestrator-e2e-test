/**
 * Custom error classes for expense-related operations
 */

export class ExpenseError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'ExpenseError';
  }
}

export class ExpenseNotFoundError extends ExpenseError {
  constructor(id: string) {
    super(`Expense with ID ${id} not found`, 404);
    this.name = 'ExpenseNotFoundError';
  }
}

export class ExpenseValidationError extends ExpenseError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ExpenseValidationError';
  }
}

export class GroupNotFoundError extends ExpenseError {
  constructor(id: string) {
    super(`Group with ID ${id} not found`, 404);
    this.name = 'GroupNotFoundError';
  }
}

export class UnauthorizedExpenseError extends ExpenseError {
  constructor(message: string = 'Unauthorized to perform this operation') {
    super(message, 403);
    this.name = 'UnauthorizedExpenseError';
  }
}

export class InvalidAmountError extends ExpenseValidationError {
  constructor(amount: number) {
    super(`Amount must be greater than 0, received: ${amount}`);
    this.name = 'InvalidAmountError';
  }
}

export class InvalidSplitError extends ExpenseValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSplitError';
  }
}

export class ExpenseCreationError extends ExpenseError {
  constructor(message: string = 'Failed to create expense') {
    super(message, 500);
    this.name = 'ExpenseCreationError';
  }
}

export class ExpenseUpdateError extends ExpenseError {
  constructor(message: string = 'Failed to update expense') {
    super(message, 500);
    this.name = 'ExpenseUpdateError';
  }
}

export class ExpenseDeleteError extends ExpenseError {
  constructor(message: string = 'Failed to delete expense') {
    super(message, 500);
    this.name = 'ExpenseDeleteError';
  }
}
