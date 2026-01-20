import { NextRequest, NextResponse } from 'next/server';
import {
  createExpense,
  getExpensesByGroupId,
  getExpensesByUserId,
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

// GET /api/expenses - Get expenses
export async function GET(request: NextRequest) {
  try {
    ensureDbInitialized();

    const searchParams = request.nextUrl.searchParams;
    const groupId = searchParams.get('groupId');
    const userId = searchParams.get('userId');

    if (!groupId && !userId) {
      return NextResponse.json(
        { error: 'Either groupId or userId query parameter is required' },
        { status: 400 }
      );
    }

    let expenses;

    if (groupId) {
      expenses = getExpensesByGroupId(groupId);
    } else {
      expenses = getExpensesByUserId(userId!);
    }

    return NextResponse.json({
      success: true,
      data: expenses,
      count: expenses.length,
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch expenses',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create a new expense
export async function POST(request: NextRequest) {
  try {
    ensureDbInitialized();

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['group_id', 'description', 'amount', 'paid_by'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          fields: missingFields,
        },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof body.amount !== 'number' || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Create expense
    const expense = createExpense({
      group_id: body.group_id,
      description: body.description,
      amount: body.amount,
      currency: body.currency,
      paid_by: body.paid_by,
      category: body.category,
      date: body.date,
      split_with: body.split_with,
    });

    return NextResponse.json(
      {
        success: true,
        data: expense,
        message: 'Expense created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating expense:', error);

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return NextResponse.json(
        { error: 'A record with this information already exists' },
        { status: 409 }
      );
    }

    // Handle foreign key violations
    if (error instanceof Error && error.message.includes('FOREIGN KEY')) {
      return NextResponse.json(
        {
          error: 'Invalid reference',
          details: 'The specified group_id or paid_by user does not exist',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create expense',
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
