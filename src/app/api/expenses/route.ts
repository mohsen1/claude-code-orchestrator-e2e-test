import { NextRequest, NextResponse } from 'next/server';
import {
  createExpense,
  getExpensesByUserId,
  getExpenseById,
} from '@/lib/db/expenses';
import { splitEqually } from '@/lib/splitters/equal-splitter';

/**
 * GET /api/expenses
 * Get expenses for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const expenses = getExpensesByUserId(parseInt(userId));

    return NextResponse.json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/expenses
 * Create a new expense
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      group_id,
      description,
      amount,
      currency,
      paid_by,
      category,
      date,
      participant_ids,
    } = body;

    // Validation
    if (!group_id || !description || !amount || !paid_by || !participant_ids) {
      return NextResponse.json(
        {
          error: 'Missing required fields: group_id, description, amount, paid_by, participant_ids',
        },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    if (!Array.isArray(participant_ids) || participant_ids.length === 0) {
      return NextResponse.json(
        { error: 'Participant IDs must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate split
    const splitResult = splitEqually(amount, participant_ids);

    // Create expense
    const expense = createExpense({
      group_id: parseInt(group_id),
      description,
      amount,
      currency: currency || 'USD',
      paid_by: parseInt(paid_by),
      category,
      date: date || new Date().toISOString(),
      participant_ids,
    });

    return NextResponse.json(
      {
        success: true,
        data: expense,
        split: splitResult,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
