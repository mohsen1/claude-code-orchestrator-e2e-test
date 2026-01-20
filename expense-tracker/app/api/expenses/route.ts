import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import {
  createExpense,
  createExpenseSplits,
  getGroupMembers,
  updateDebts
} from '@/db/expenses';
import { splitExpenseEqually } from '@/lib/split-expense';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { groupId, description, amount, paidBy } = body;

    // Validate required fields
    if (!groupId || !description || !amount || !paidBy) {
      return NextResponse.json(
        { error: 'Missing required fields: groupId, description, amount, paidBy' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Verify user is part of the group
    const memberCheck = db.prepare(`
      SELECT * FROM group_members
      WHERE group_id = ? AND user_id = ?
    `);

    const isMember = memberCheck.get(groupId, payload.userId);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    // Verify the payer is also a group member
    const payerCheck = db.prepare(`
      SELECT * FROM group_members
      WHERE group_id = ? AND user_id = ?
    `);

    const payer = payerCheck.get(groupId, paidBy);
    if (!payer) {
      return NextResponse.json(
        { error: 'Payer is not a member of this group' },
        { status: 400 }
      );
    }

    // Get all group members for splitting
    const members = getGroupMembers(groupId);

    if (members.length === 0) {
      return NextResponse.json(
        { error: 'No members found in this group' },
        { status: 400 }
      );
    }

    // Calculate equal splits
    const splits = splitExpenseEqually(amount, members.map(m => m.id));

    // Create the expense
    const expense = createExpense(groupId, description, amount, paidBy);

    // Create the splits
    createExpenseSplits(expense.id, splits);

    // Update debts
    updateDebts(groupId, paidBy, splits);

    // Return the created expense with details
    const expenseWithDetails = db.prepare(`
      SELECT
        e.*,
        u.name as paid_by_name,
        u.email as paid_by_email
      FROM expenses e
      JOIN users u ON e.paid_by = u.id
      WHERE e.id = ?
    `).get(expense.id);

    const splitsWithDetails = db.prepare(`
      SELECT
        es.user_id,
        u.name as user_name,
        u.email as user_email,
        es.amount
      FROM expense_splits es
      JOIN users u ON es.user_id = u.id
      WHERE es.expense_id = ?
    `).all(expense.id);

    return NextResponse.json(
      {
        expense: {
          ...expenseWithDetails,
          splits: splitsWithDetails
        },
        message: 'Expense added successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
