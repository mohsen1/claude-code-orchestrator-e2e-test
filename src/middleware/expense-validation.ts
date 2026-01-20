import { NextRequest, NextResponse } from 'next/server';

export interface ExpenseCreateData {
  groupId: string;
  amount: number;
  description: string;
  paidBy: string;
  date?: string;
  category?: string;
}

export interface ExpenseUpdateData {
  amount?: number;
  description?: string;
  date?: string;
  category?: string;
}

export interface ExpenseFilters {
  groupId?: string;
  startDate?: string;
  endDate?: string;
  paidBy?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateExpenseCreate(data: any): ExpenseCreateData {
  const errors: { field: string; message: string }[] = [];

  if (!data.groupId) {
    errors.push({ field: 'groupId', message: 'Group ID is required' });
  }

  if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push({
      field: 'amount',
      message: 'Amount must be a positive number'
    });
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Description is required' });
  } else if (data.description.length > 500) {
    errors.push({
      field: 'description',
      message: 'Description must be less than 500 characters'
    });
  }

  if (!data.paidBy) {
    errors.push({ field: 'paidBy', message: 'Payer ID is required' });
  }

  if (data.date && !isValidDate(data.date)) {
    errors.push({ field: 'date', message: 'Invalid date format' });
  }

  if (data.category && typeof data.category !== 'string') {
    errors.push({ field: 'category', message: 'Category must be a string' });
  }

  if (errors.length > 0) {
    throw new ValidationError(
      `Validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`,
      errors[0].field
    );
  }

  return {
    groupId: data.groupId,
    amount: Number(data.amount),
    description: data.description.trim(),
    paidBy: data.paidBy,
    date: data.date || new Date().toISOString(),
    category: data.category || null
  };
}

export function validateExpenseUpdate(data: any): ExpenseUpdateData {
  const errors: { field: string; message: string }[] = [];

  if (data.amount !== undefined) {
    if (typeof data.amount !== 'number' || data.amount <= 0) {
      errors.push({
        field: 'amount',
        message: 'Amount must be a positive number'
      });
    }
  }

  if (data.description !== undefined) {
    if (typeof data.description !== 'string' || data.description.trim().length === 0) {
      errors.push({ field: 'description', message: 'Description is required' });
    } else if (data.description.length > 500) {
      errors.push({
        field: 'description',
        message: 'Description must be less than 500 characters'
      });
    }
  }

  if (data.date !== undefined && !isValidDate(data.date)) {
    errors.push({ field: 'date', message: 'Invalid date format' });
  }

  if (data.category !== undefined && typeof data.category !== 'string') {
    errors.push({ field: 'category', message: 'Category must be a string' });
  }

  if (errors.length > 0) {
    throw new ValidationError(
      `Validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`,
      errors[0].field
    );
  }

  const result: ExpenseUpdateData = {};
  if (data.amount !== undefined) result.amount = Number(data.amount);
  if (data.description !== undefined) result.description = data.description.trim();
  if (data.date !== undefined) result.date = data.date;
  if (data.category !== undefined) result.category = data.category;

  return result;
}

export function validateExpenseFilters(searchParams: URLSearchParams): ExpenseFilters {
  const filters: ExpenseFilters = {};

  if (searchParams.get('groupId')) {
    filters.groupId = searchParams.get('groupId')!;
  }

  if (searchParams.get('startDate')) {
    if (!isValidDate(searchParams.get('startDate')!)) {
      throw new ValidationError('Invalid start date format', 'startDate');
    }
    filters.startDate = searchParams.get('startDate')!;
  }

  if (searchParams.get('endDate')) {
    if (!isValidDate(searchParams.get('endDate')!)) {
      throw new ValidationError('Invalid end date format', 'endDate');
    }
    filters.endDate = searchParams.get('endDate')!;
  }

  if (searchParams.get('paidBy')) {
    filters.paidBy = searchParams.get('paidBy')!;
  }

  if (searchParams.get('category')) {
    filters.category = searchParams.get('category')!;
  }

  if (searchParams.get('limit')) {
    const limit = parseInt(searchParams.get('limit')!, 10);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100', 'limit');
    }
    filters.limit = limit;
  }

  if (searchParams.get('offset')) {
    const offset = parseInt(searchParams.get('offset')!, 10);
    if (isNaN(offset) || offset < 0) {
      throw new ValidationError('Offset must be a positive number', 'offset');
    }
    filters.offset = offset;
  }

  return filters;
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function handleValidationError(error: unknown): NextResponse {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        error: error.message,
        field: error.field
      },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
