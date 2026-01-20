import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Database from 'better-sqlite3';
import { validateExpenseUpdate, handleValidationError } from '@/middleware/expense-validation';

const db = new Database('expenses.db');

interface RouteContext {
  params: {
    id: string;
  };
}

// GET /api/expenses/[id] - Retrieve a single expense by ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = context.params;

    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Verify user is a member of the group
    const membership = db.prepare(
      'SELECT * FROM group_members WHERE groupId = ? AND userId = ?'
    ).get((expense as any).groupId, session.user.id);

    if (!membership) {
      return NextResponse.json(
        { error: 'User is not a member of this group' },
        { status: 403 }
      );
    }

    return NextResponse.json({ expense });

  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/expenses/[id] - Update an existing expense
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = context.params;

    // Check if expense exists
    const existingExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Verify user is a member of the group
    const membership = db.prepare(
      'SELECT * FROM group_members WHERE groupId = ? AND userId = ?'
    ).get((existingExpense as any).groupId, session.user.id);

    if (!membership) {
      return NextResponse.json(
        { error: 'User is not a member of this group' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = validateExpenseUpdate(body);

    // Build dynamic update query
    const updateFields: string[] = [];
    const params: any[] = [];

    if (data.amount !== undefined) {
      updateFields.push('amount = ?');
      params.push(data.amount);
    }

    if (data.description !== undefined) {
      updateFields.push('description = ?');
      params.push(data.description);
    }

    if (data.date !== undefined) {
      updateFields.push('date = ?');
      params.push(data.date);
    }

    if (data.category !== undefined) {
      updateFields.push('category = ?');
      params.push(data.category);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updateFields.push('updatedAt = ?');
    params.push(new Date().toISOString());
    params.push(id);

    const query = `
      UPDATE expenses
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    const result = db.prepare(query).run(...params);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Failed to update expense' },
        { status: 500 }
      );
    }

    // Fetch the updated expense
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);

    return NextResponse.json({
      expense,
      message: 'Expense updated successfully'
    });

  } catch (error) {
    return handleValidationError(error);
  }
}

// DELETE /api/expenses/[id] - Delete an expense
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = context.params;

    // Check if expense exists
    const existingExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Verify user is a member of the group
    const membership = db.prepare(
      'SELECT * FROM group_members WHERE groupId = ? AND userId = ?'
    ).get((existingExpense as any).groupId, session.user.id);

    if (!membership) {
      return NextResponse.json(
        { error: 'User is not a member of this group' },
        { status: 403 }
      );
    }

    // Delete the expense
    const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Failed to delete expense' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Expense deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
