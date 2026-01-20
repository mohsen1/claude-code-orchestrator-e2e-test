import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import db from '@/lib/db';
import { UpdateExpenseInput, ExpenseWithDetails } from '@/lib/schema';

// GET /api/expenses/[id] - Get a specific expense
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if user is a member of the group that the expense belongs to
    const membership = db
      .prepare(`
        SELECT gm.*
        FROM group_members gm
        INNER JOIN expenses e ON e.group_id = gm.group_id
        WHERE e.id = ? AND gm.user_id = ?
      `)
      .get(id, session.user.id);

    if (!membership) {
      return NextResponse.json(
        { error: 'Not authorized to view this expense' },
        { status: 403 }
      );
    }

    // Get expense details
    const expense = db
      .prepare(`
        SELECT e.*, u.name as paid_by_name, u.email as paid_by_email
        FROM expenses e
        INNER JOIN users u ON e.paid_by = u.id
        WHERE e.id = ?
      `)
      .get(id) as any;

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Get expense splits
    const splits = db
      .prepare(`
        SELECT es.user_id, es.amount, u.name, u.email
        FROM expense_splits es
        INNER JOIN users u ON es.user_id = u.id
        WHERE es.expense_id = ?
      `)
      .all(id);

    expense.paid_by_user = {
      id: expense.paid_by,
      name: expense.paid_by_name,
      email: expense.paid_by_email,
    };
    delete expense.paid_by_name;
    delete expense.paid_by_email;

    expense.splits = splits.map((split: any) => ({
      user_id: split.user_id,
      amount: split.amount,
      user: {
        id: split.user_id,
        name: split.name,
        email: split.email,
      },
    }));

    return NextResponse.json({ expense });
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    );
  }
}

// PATCH /api/expenses/[id] - Update an expense
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body: UpdateExpenseInput = await request.json();
    const { description, amount } = body;

    // Get the expense
    const expense = db
      .prepare('SELECT * FROM expenses WHERE id = ?')
      .get(id) as any;

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Check if user is the one who paid for the expense
    if (expense.paid_by !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the payer can update the expense' },
        { status: 403 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let needsSplitRecalculation = false;

    if (description !== undefined) {
      if (description.trim().length === 0) {
        return NextResponse.json(
          { error: 'Description cannot be empty' },
          { status: 400 }
        );
      }
      updates.push('description = ?');
      values.push(description.trim());
    }

    if (amount !== undefined) {
      if (amount <= 0) {
        return NextResponse.json(
          { error: 'Amount must be greater than 0' },
          { status: 400 }
        );
      }
      updates.push('amount = ?');
      values.push(amount);
      needsSplitRecalculation = true;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(id);

    db.prepare(`UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`).run(
      ...values
    );

    // Recalculate splits if amount changed
    if (needsSplitRecalculation) {
      const splits = db
        .prepare('SELECT COUNT(*) as count FROM expense_splits WHERE expense_id = ?')
        .get(id) as any;

      const splitAmount = amount / splits.count;

      db.prepare(
        'UPDATE expense_splits SET amount = ? WHERE expense_id = ?'
      ).run(splitAmount, id);
    }

    // Fetch updated expense
    const updatedExpense = db
      .prepare(`
        SELECT e.*, u.name as paid_by_name, u.email as paid_by_email
        FROM expenses e
        INNER JOIN users u ON e.paid_by = u.id
        WHERE e.id = ?
      `)
      .get(id) as any;

    const splits = db
      .prepare(`
        SELECT es.user_id, es.amount, u.name, u.email
        FROM expense_splits es
        INNER JOIN users u ON es.user_id = u.id
        WHERE es.expense_id = ?
      `)
      .all(id);

    updatedExpense.paid_by_user = {
      id: updatedExpense.paid_by,
      name: updatedExpense.paid_by_name,
      email: updatedExpense.paid_by_email,
    };
    delete updatedExpense.paid_by_name;
    delete updatedExpense.paid_by_email;

    updatedExpense.splits = splits.map((split: any) => ({
      user_id: split.user_id,
      amount: split.amount,
      user: {
        id: split.user_id,
        name: split.name,
        email: split.email,
      },
    }));

    return NextResponse.json({ expense: updatedExpense });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get the expense
    const expense = db
      .prepare('SELECT * FROM expenses WHERE id = ?')
      .get(id) as any;

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Check if user is the one who paid for the expense
    if (expense.paid_by !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the payer can delete the expense' },
        { status: 403 }
      );
    }

    // Delete expense (cascade will handle splits)
    db.prepare('DELETE FROM expenses WHERE id = ?').run(id);

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
