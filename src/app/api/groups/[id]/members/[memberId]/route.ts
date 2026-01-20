import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Database } from 'better-sqlite3';

// Database initialization
function getDb(): Database.Database {
  const sqlite = require('better-sqlite3');
  return new sqlite('expenses.db');
}

// DELETE - Remove a member from a group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const groupId = params.id;
    const targetMemberId = params.memberId;
    const requesterEmail = session.user.email;

    const db = getDb();

    // Get requester's role and verify membership
    const requester = db.prepare(`
      SELECT id, role, user_email
      FROM group_members
      WHERE group_id = ? AND user_email = ?
    `).get(groupId, requesterEmail);

    if (!requester) {
      db.close();
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    // Get target member info
    const targetMember = db.prepare(`
      SELECT id, role, user_email
      FROM group_members
      WHERE id = ? AND group_id = ?
    `).get(targetMemberId, groupId);

    if (!targetMember) {
      db.close();
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Check permissions:
    // 1. Admin can remove any member (except group creator)
    // 2. Group creator can remove anyone
    // 3. Members can only remove themselves

    // Check if requester is the group creator
    const group = db.prepare('SELECT created_by FROM groups WHERE id = ?').get(groupId);
    const isCreator = group && group.created_by === requesterEmail;

    const isSelf = targetMember.user_email === requesterEmail;
    const isAdmin = requester.role === 'admin';

    if (!isSelf && !isCreator && !isAdmin) {
      db.close();
      return NextResponse.json(
        { error: 'You do not have permission to remove this member' },
        { status: 403 }
      );
    }

    // Prevent removing the group creator
    if (targetMember.user_email === group.created_by && !isSelf) {
      db.close();
      return NextResponse.json(
        { error: 'Cannot remove the group creator' },
        { status: 400 }
      );
    }

    // Use a transaction to safely remove member and update related records
    const transaction = db.transaction(() => {
      // Get member's email before deletion for notification
      const memberEmail = targetMember.user_email;

      // Check if member has any unpaid expenses
      const unpaidExpenses = db.prepare(`
        SELECT COUNT(*) as count
        FROM expenses
        WHERE group_id = ? AND paid_by = ?
      `).get(groupId, memberEmail);

      // You could add logic here to handle unsettled debts
      // For now, we'll allow removal but you might want to add warnings

      // Delete member's expense splits
      db.prepare(`
        DELETE FROM expense_splits
        WHERE member_id = ?
      `).run(targetMemberId);

      // Delete the member
      const deleteResult = db.prepare(`
        DELETE FROM group_members
        WHERE id = ? AND group_id = ?
      `).run(targetMemberId, groupId);

      if (!deleteResult.changes) {
        throw new Error('Failed to remove member');
      }

      return {
        success: true,
        removedMemberEmail: memberEmail,
        removedBy: requesterEmail
      };
    });

    let result;
    try {
      result = transaction();
    } catch (error: any) {
      db.close();
      console.error('Transaction error:', error);
      return NextResponse.json(
        { error: 'Failed to remove member' },
        { status: 500 }
      );
    }

    db.close();

    // Emit socket event for real-time update (if socket.io is set up)
    // TODO: Emit 'member:removed' event to group room
    // io.to(`group:${groupId}`).emit('member:removed', {
    //   groupId,
    //   removedMemberEmail: result.removedMemberEmail,
    //   removedBy: result.removedBy,
    //   timestamp: new Date().toISOString()
    // });

    return NextResponse.json({
      ...result,
      message: isSelf
        ? 'You have left the group'
        : `Successfully removed ${result.removedMemberEmail} from the group`
    });

  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}

// GET - Get member details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const groupId = params.id;
    const memberId = params.memberId;
    const db = getDb();

    // Verify requester is a member
    const requesterMember = db.prepare(`
      SELECT id FROM group_members
      WHERE group_id = ? AND user_email = ?
    `).get(groupId, session.user.email);

    if (!requesterMember) {
      db.close();
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    // Get member details
    const member = db.prepare(`
      SELECT
        id,
        user_email,
        role,
        joined_at,
        balance
      FROM group_members
      WHERE id = ? AND group_id = ?
    `).get(memberId, groupId);

    if (!member) {
      db.close();
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Get member's expense summary
    const expenseSummary = db.prepare(`
      SELECT
        COUNT(*) as total_expenses,
        COALESCE(SUM(amount), 0) as total_spent
      FROM expenses
      WHERE group_id = ? AND paid_by = ?
    `).get(groupId, member.user_email);

    db.close();

    return NextResponse.json({
      member: {
        id: member.id,
        email: member.user_email,
        role: member.role,
        joinedAt: member.joined_at,
        balance: member.balance,
        expenseSummary: {
          totalExpenses: expenseSummary.total_expenses,
          totalSpent: expenseSummary.total_spent
        }
      }
    });

  } catch (error) {
    console.error('Error fetching member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member details' },
      { status: 500 }
    );
  }
}

// PATCH - Update member role (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const groupId = params.id;
    const memberId = params.memberId;
    const { role } = await request.json();

    if (!role || !['admin', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "admin" or "member"' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verify requester is an admin or creator
    const requester = db.prepare(`
      SELECT gm.role, g.created_by
      FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE gm.group_id = ? AND gm.user_email = ?
    `).get(groupId, session.user.email);

    const isCreator = requester && requester.created_by === session.user.email;
    const isAdmin = requester && requester.role === 'admin';

    if (!isCreator && !isAdmin) {
      db.close();
      return NextResponse.json(
        { error: 'You do not have permission to update member roles' },
        { status: 403 }
      );
    }

    // Get target member
    const targetMember = db.prepare(`
      SELECT user_email FROM group_members
      WHERE id = ? AND group_id = ?
    `).get(memberId, groupId);

    if (!targetMember) {
      db.close();
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Prevent changing the creator's role
    if (targetMember.user_email === requester.created_by) {
      db.close();
      return NextResponse.json(
        { error: 'Cannot change the group creator\'s role' },
        { status: 400 }
      );
    }

    // Update member role
    db.prepare(`
      UPDATE group_members
      SET role = ?
      WHERE id = ? AND group_id = ?
    `).run(role, memberId, groupId);

    db.close();

    return NextResponse.json({
      success: true,
      message: `Member role updated to ${role}`,
      email: targetMember.user_email,
      newRole: role
    });

  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    );
  }
}
