import { NextRequest, NextResponse } from 'next/server';
import {
  getExpensesByGroupId,
  getGroupBalance,
  createExpense as dbCreateExpense,
} from '@/lib/db/expenses';
import { splitEqually } from '@/lib/splitters/equal-splitter';

/**
 * GET /api/groups/[id]/expenses
 * Get all expenses for a specific group
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = parseInt(params.id);

    if (isNaN(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeBalance = searchParams.get('includeBalance') === 'true';

    const expenses = getExpensesByGroupId(groupId);

    let balance = null;
    if (includeBalance) {
      balance = getGroupBalance(groupId);
    }

    return NextResponse.json({
      success: true,
      data: {
        expenses,
        balance,
      },
    });
  } catch (error) {
    console.error('Error fetching group expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group expenses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups/[id]/expenses
 * Create a new expense in a specific group
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = parseInt(params.id);

    if (isNaN(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      description,
      amount,
      currency,
      paid_by,
      category,
      date,
      participant_ids,
    } = body;

    // Validation
    if (!description || !amount || !paid_by || !participant_ids) {
      return NextResponse.json(
        {
          error: 'Missing required fields: description, amount, paid_by, participant_ids',
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

    // Validate equal split
    const splitResult = splitEqually(amount, participant_ids);

    // Create expense with the group_id from the URL
    const expense = dbCreateExpense({
      group_id: groupId,
      description,
      amount,
      currency: currency || 'USD',
      paid_by: parseInt(paid_by),
      category,
      date: date || new Date().toISOString(),
      participant_ids,
    });

    // Fetch updated balance
    const balance = getGroupBalance(groupId);

    return NextResponse.json(
      {
        success: true,
        data: {
          expense,
          balance,
          split: splitResult,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating group expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
