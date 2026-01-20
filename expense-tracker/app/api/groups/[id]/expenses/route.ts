import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getExpensesByGroupId, getUserBalancesInGroup } from '@/db/expenses';
import db from '@/lib/db';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
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

    const groupId = parseInt(context.params.id);

    if (isNaN(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID' },
        { status: 400 }
      );
    }

    // Verify user is a member of the group
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

    // Get all expenses for the group
    const expenses = getExpensesByGroupId(groupId);

    // Get user's balances in this group
    const balances = getUserBalancesInGroup(groupId, payload.userId);

    // Get group details
    const group = db.prepare(`
      SELECT g.*,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
      FROM groups g
      WHERE g.id = ?
    `).get(groupId);

    return NextResponse.json({
      group,
      expenses,
      balances: {
        owes: balances.owes,
        owed: balances.owed,
        net: balances.net
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
