import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { validateExpense, validateExpenseUpdate, validateExpenseSplits } from '@/lib/validators/expense';
import {
  ExpenseError,
  ExpenseNotFoundError,
  ExpenseUpdateError,
  ExpenseDeleteError,
  ExpenseValidationError,
  GroupNotFoundError,
  UnauthorizedExpenseError,
} from '@/lib/errors/expense-errors';

// Mock database functions (replace with actual database calls)
async function getExpenseFromDb(id: string) {
  // TODO: Implement actual database query
  return null;
}

async function checkGroupExists(groupId: string): Promise<boolean> {
  // TODO: Implement actual database check
  return true;
}

async function checkGroupMembership(groupId: string, userId: string): Promise<boolean> {
  // TODO: Implement actual database check
  return true;
}

async function updateExpenseInDb(id: string, data: any) {
  // TODO: Implement actual database update
  return {
    id,
    ...data,
    updatedAt: new Date().toISOString(),
  };
}

async function deleteExpenseFromDb(id: string) {
  // TODO: Implement actual database delete
  return true;
}

async function recalculateGroupBalances(groupId: string) {
  // TODO: Implement balance recalculation logic
  return { success: true };
}

/**
 * GET /api/expenses/[id]
 * Get a single expense by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const expense = await getExpenseFromDb(params.id);

    if (!expense) {
      throw new ExpenseNotFoundError(params.id);
    }

    // Check if user is a member of the group
    const isMember = await checkGroupMembership(expense.groupId, session.user.id);
    if (!isMember) {
      throw new UnauthorizedExpenseError('You are not a member of this group');
    }

    return NextResponse.json(
      {
        success: true,
        expense
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching expense:', error);

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

/**
 * PUT /api/expenses/[id]
 * Update an existing expense
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if expense exists
    const existingExpense = await getExpenseFromDb(params.id);
    if (!existingExpense) {
      throw new ExpenseNotFoundError(params.id);
    }

    // Check if user is a member of the group
    const isMember = await checkGroupMembership(existingExpense.groupId, session.user.id);
    if (!isMember) {
      throw new UnauthorizedExpenseError('You are not a member of this group');
    }

    const body = await request.json();

    // Validate update data
    const validatedData = validateExpenseUpdate(body);

    // If splitType and splits are provided, validate them
    if (validatedData.splitType && validatedData.splits) {
      const amount = validatedData.amount ?? existingExpense.amount;
      validateExpenseSplits(
        amount,
        validatedData.splitType,
        validatedData.splits
      );
    }

    // Update expense
    const updatedExpense = await updateExpenseInDb(params.id, {
      ...validatedData,
      updatedBy: session.user.id,
    });

    // Recalculate group balances
    await recalculateGroupBalances(existingExpense.groupId);

    return NextResponse.json(
      {
        success: true,
        expense: updatedExpense,
        message: 'Expense updated successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating expense:', error);

    if (error instanceof ExpenseError) {
      return NextResponse.json(
        {
          error: error.message,
          type: error.name
        },
        { status: error.statusCode }
      );
    }

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/expenses/[id]
 * Delete an expense
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if expense exists
    const expense = await getExpenseFromDb(params.id);
    if (!expense) {
      throw new ExpenseNotFoundError(params.id);
    }

    // Check if user is a member of the group
    const isMember = await checkGroupMembership(expense.groupId, session.user.id);
    if (!isMember) {
      throw new UnauthorizedExpenseError('You are not a member of this group');
    }

    // Delete expense
    await deleteExpenseFromDb(params.id);

    // Recalculate group balances
    await recalculateGroupBalances(expense.groupId);

    return NextResponse.json(
      {
        success: true,
        message: 'Expense deleted successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting expense:', error);

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
