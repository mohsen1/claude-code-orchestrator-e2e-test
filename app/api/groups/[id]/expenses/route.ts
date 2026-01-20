import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import {
  getGroupById,
  getGroupMembers,
  insertExpense,
  insertExpenseSplit,
  getExpensesByGroup
} from '@/lib/db';
import { calculateSplits, Split } from '@/lib/splits';

// GET /api/groups/[id]/expenses - List all expenses for a group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = parseInt(params.id);
    if (isNaN(groupId)) {
      return NextResponse.json({ error: 'Invalid group ID' }, { status: 400 });
    }

    const group = getGroupById(groupId);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const members = getGroupMembers(groupId);
    const isMember = members.some(m => m.user_id === user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    const expenses = getExpensesByGroup(groupId);

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// POST /api/groups/[id]/expenses - Create a new expense
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = parseInt(params.id);
    if (isNaN(groupId)) {
      return NextResponse.json({ error: 'Invalid group ID' }, { status: 400 });
    }

    const group = getGroupById(groupId);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const members = getGroupMembers(groupId);
    const isMember = members.some(m => m.user_id === user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    const body = await request.json();
    const { paid_by, amount, description, date, splitType, splitFor } = body;

    // Validate required fields
    if (!paid_by || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'paid_by and valid amount are required' },
        { status: 400 }
      );
    }

    // Verify payer is a member
    const payer = members.find(m => m.user_id === paid_by);
    if (!payer) {
      return NextResponse.json(
        { error: 'Payer is not a member of this group' },
        { status: 400 }
      );
    }

    // Calculate splits based on splitType
    let splits: Split[];
    const memberIds = members.map(m => m.user_id);

    if (splitType === 'equal') {
      // Split equally among specified members or all members
      const membersToSplit = splitFor && Array.isArray(splitFor) && splitFor.length > 0
        ? splitFor
        : memberIds;

      // Validate that all members in splitFor are actual group members
      const memberSet = new Set(memberIds);
      for (const userId of membersToSplit) {
        if (!memberSet.has(userId)) {
          return NextResponse.json(
            { error: `User ${userId} is not a member of this group` },
            { status: 400 }
          );
        }
      }

      splits = calculateSplits(amount, membersToSplit, { type: 'equal' });
    } else if (splitType === 'custom') {
      // Use custom splits provided in body
      const { splits: customSplits } = body;

      if (!customSplits || !Array.isArray(customSplits) || customSplits.length === 0) {
        return NextResponse.json(
          { error: 'Custom splits requires splits array' },
          { status: 400 }
        );
      }

      splits = calculateSplits(amount, memberIds, { type: 'custom', splits: customSplits });
    } else {
      return NextResponse.json(
        { error: 'splitType must be "equal" or "custom"' },
        { status: 400 }
      );
    }

    // Create expense
    const expenseDate = date || new Date().toISOString();
    const expense = insertExpense(groupId, paid_by, amount, description || null, expenseDate);

    // Create splits
    for (const split of splits) {
      insertExpenseSplit(expense.id, split.user_id, split.amount);
    }

    // Return the created expense with details
    const expenses = getExpensesByGroup(groupId);
    const createdExpense = expenses.find(e => e.id === expense.id);

    return NextResponse.json(
      { expense: createdExpense },
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
