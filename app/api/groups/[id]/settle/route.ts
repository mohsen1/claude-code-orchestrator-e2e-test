import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

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
    const { from_user, to_user, amount } = body;

    // Validate required fields
    if (!from_user || !to_user || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: from_user, to_user, amount' },
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

    // Validate users are different
    if (from_user === to_user) {
      return NextResponse.json(
        { error: 'from_user and to_user must be different' },
        { status: 400 }
      );
    }

    // Check if group exists
    const group = db.prepare('SELECT id FROM groups WHERE id = ?').get(groupId);
    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Check if both users are members of the group
    const fromMember = db.prepare(
      'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?'
    ).get(groupId, from_user);

    const toMember = db.prepare(
      'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?'
    ).get(groupId, to_user);

    if (!fromMember || !toMember) {
      return NextResponse.json(
        { error: 'Both users must be members of the group' },
        { status: 400 }
      );
    }

    // Insert the settlement
    const stmt = db.prepare(`
      INSERT INTO settlements (group_id, from_user, to_user, amount)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(groupId, from_user, to_user, amount);

    // Get the created settlement
    const settlement = db.prepare(`
      SELECT * FROM settlements WHERE id = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json(
      { settlement, message: 'Settlement recorded successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording settlement:', error);
    return NextResponse.json(
      { error: 'Failed to record settlement' },
      { status: 500 }
    );
  }
}
