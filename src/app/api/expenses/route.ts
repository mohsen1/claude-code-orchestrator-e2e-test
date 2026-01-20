import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { validateExpense, validateExpenseSplits } from '@/lib/validators/expense';
import {
  ExpenseError,
  ExpenseCreationError,
  ExpenseValidationError,
  GroupNotFoundError,
  UnauthorizedExpenseError,
} from '@/lib/errors/expense-errors';

// Mock database functions (replace with actual database calls)
async function checkGroupExists(groupId: string): Promise<boolean> {
  // TODO: Implement actual database check
  return true;
}

async function checkGroupMembership(groupId: string, userId: string): Promise<boolean> {
  // TODO: Implement actual database check
  return true;
}

async function createExpenseInDb(data: any) {
  // TODO: Implement actual database insert
  return {
    id: `expense_${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
  };
}

async function getExpensesFromDb(groupId: string, userId: string) {
  // TODO: Implement actual database query
  return [];
}

/**
 * POST /api/expenses
 * Create a new expense
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validatedData = validateExpense(body);

    // Check if group exists
    const groupExists = await checkGroupExists(validatedData.groupId);
    if (!groupExists) {
      throw new GroupNotFoundError(validatedData.groupId);
    }

    // Check if user is a member of the group
    const isMember = await checkGroupMembership(validatedData.groupId, session.user.id);
    if (!isMember) {
      throw new UnauthorizedExpenseError('You are not a member of this group');
    }

    // Validate splits
    validateExpenseSplits(
      validatedData.amount,
      validatedData.splitType,
      validatedData.splits
    );

    // Create expense
    const expense = await createExpenseInDb({
      ...validatedData,
      createdBy: session.user.id,
    });

    return NextResponse.json(
      {
        success: true,
        expense,
        message: 'Expense created successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating expense:', error);

    // Handle known error types
    if (error instanceof ExpenseError) {
      return NextResponse.json(
        {
          error: error.message,
          type: error.name
        },
        { status: error.statusCode }
      );
    }

    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.message
        },
        { status: 400 }
      );
    }

    // Handle unexpected errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/expenses
 * Get expenses (optionally filtered by group)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json(
        { error: 'groupId parameter is required' },
        { status: 400 }
      );
    }

    // Check if user is a member of the group
    const isMember = await checkGroupMembership(groupId, session.user.id);
    if (!isMember) {
      throw new UnauthorizedExpenseError('You are not a member of this group');
    }

    // Get expenses
    const expenses = await getExpensesFromDb(groupId, session.user.id);

    return NextResponse.json(
      {
        success: true,
        expenses,
        count: expenses.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching expenses:', error);

    if (error instanceof ExpenseError) {
      return NextResponse.json(
        {
          error: error.message,
          type: error.name
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
