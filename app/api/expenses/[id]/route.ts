import { NextRequest, NextResponse } from 'next/server';
import {
  getExpenseById,
  updateExpense,
  deleteExpense,
  updateExpenseSplits,
} from '@/lib/db/expenses';
import { initializeDatabase } from '@/lib/db/schema';

// Initialize database on first request
let dbInitialized = false;

function ensureDbInitialized() {
  if (!dbInitialized) {
    initializeDatabase();
    dbInitialized = true;
  }
}

// GET /api/expenses/[id] - Get a single expense by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    ensureDbInitialized();

    const expense = getExpenseById(params.id);

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch expense',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT /api/expenses/[id] - Update an expense
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    ensureDbInitialized();

    const body = await request.json();

    // Check if expense exists
    const existingExpense = getExpenseById(params.id);

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Validate amount if provided
    if (body.amount !== undefined) {
      if (typeof body.amount !== 'number' || body.amount <= 0) {
        return NextResponse.json(
          { error: 'Amount must be a positive number' },
          { status: 400 }
        );
      }
    }

    // Handle split updates separately
    if (body.split_with !== undefined) {
      const success = updateExpenseSplits(params.id, body.split_with);

      if (!success) {
        return NextResponse.json(
          { error: 'Failed to update expense splits' },
          { status: 400 }
        );
      }

      // Remove split_with from body before updating main expense
      delete body.split_with;
    }

    // Update expense
    const updatedExpense = updateExpense(params.id, body);

    if (!updatedExpense) {
      return NextResponse.json(
        { error: 'Failed to update expense' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedExpense,
      message: 'Expense updated successfully',
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      {
        error: 'Failed to update expense',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id] - Delete an expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    ensureDbInitialized();

    // Check if expense exists
    const existingExpense = getExpenseById(params.id);

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    const success = deleteExpense(params.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete expense' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete expense',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/expenses/[id] - Partial update (alternative to PUT)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    ensureDbInitialized();

    const body = await request.json();

    // Check if expense exists
    const existingExpense = getExpenseById(params.id);

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Handle split updates
    if (body.split_with !== undefined) {
      const success = updateExpenseSplits(params.id, body.split_with);

      if (!success) {
        return NextResponse.json(
          { error: 'Failed to update expense splits' },
          { status: 400 }
        );
      }

      delete body.split_with;
    }

    // Update expense
    const updatedExpense = updateExpense(params.id, body);

    if (!updatedExpense) {
      return NextResponse.json(
        { error: 'Failed to update expense' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedExpense,
      message: 'Expense updated successfully',
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      {
        error: 'Failed to update expense',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
