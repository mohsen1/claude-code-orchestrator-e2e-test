import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Database from 'better-sqlite3';
import { validateExpenseCreate, validateExpenseFilters, handleValidationError } from '@/middleware/expense-validation';

const db = new Database('expenses.db');

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    groupId TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT NOT NULL,
    paidBy TEXT NOT NULL,
    date TEXT NOT NULL,
    category TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (groupId) REFERENCES groups(id),
    FOREIGN KEY (paidBy) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_expenses_groupId ON expenses(groupId);
  CREATE INDEX IF NOT EXISTS idx_expenses_paidBy ON expenses(paidBy);
  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
  CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
`);

// GET /api/expenses - Retrieve expenses with optional filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const filters = validateExpenseFilters(request.nextUrl.searchParams);

    let query = 'SELECT * FROM expenses WHERE 1=1';
    const params: any[] = [];

    if (filters.groupId) {
      query += ' AND groupId = ?';
      params.push(filters.groupId);
    }

    if (filters.startDate) {
      query += ' AND date >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ' AND date <= ?';
      params.push(filters.endDate);
    }

    if (filters.paidBy) {
      query += ' AND paidBy = ?';
      params.push(filters.paidBy);
    }

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    query += ' ORDER BY date DESC, createdAt DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);

      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
      }
    }

    const expenses = db.prepare(query).all(...params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM expenses WHERE 1=1';
    const countParams: any[] = [];

    if (filters.groupId) {
      countQuery += ' AND groupId = ?';
      countParams.push(filters.groupId);
    }

    if (filters.startDate) {
      countQuery += ' AND date >= ?';
      countParams.push(filters.startDate);
    }

    if (filters.endDate) {
      countQuery += ' AND date <= ?';
      countParams.push(filters.endDate);
    }

    if (filters.paidBy) {
      countQuery += ' AND paidBy = ?';
      countParams.push(filters.paidBy);
    }

    if (filters.category) {
      countQuery += ' AND category = ?';
      countParams.push(filters.category);
    }

    const { total } = db.prepare(countQuery).get(...countParams) as { total: number };

    return NextResponse.json({
      expenses,
      pagination: {
        total,
        limit: filters.limit || null,
        offset: filters.offset || 0
      }
    });

  } catch (error) {
    return handleValidationError(error);
  }
}

// POST /api/expenses - Create a new expense
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
    const data = validateExpenseCreate(body);

    // Verify user is a member of the group
    const membership = db.prepare(
      'SELECT * FROM group_members WHERE groupId = ? AND userId = ?'
    ).get(data.groupId, session.user.id);

    if (!membership) {
      return NextResponse.json(
        { error: 'User is not a member of this group' },
        { status: 403 }
      );
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO expenses (id, groupId, amount, description, paidBy, date, category, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      id,
      data.groupId,
      data.amount,
      data.description,
      data.paidBy,
      data.date,
      data.category,
      now,
      now
    );

    // Fetch the created expense
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);

    return NextResponse.json(
      { expense, message: 'Expense created successfully' },
      { status: 201 }
    );

  } catch (error) {
    return handleValidationError(error);
  }
}
