import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { removeMemberFromGroup } from '@/lib/members/remove-member';
import { updateMemberRole } from '@/lib/members/update-role';
import { getMemberRole } from '@/lib/members/authorize';

// PATCH /api/groups/[id]/members/[userId] - Update member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const groupId = params.id;
    const targetUserId = params.userId;
    const body = await request.json();
    const { role } = body;

    // Validate role
    if (!role || !['owner', 'admin', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be owner, admin, or member' },
        { status: 400 }
      );
    }

    // Update the member role
    const result = await updateMemberRole(
      groupId,
      targetUserId,
      role,
      session.user.id
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      member: result.member
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[id]/members/[userId] - Remove a member from the group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const groupId = params.id;
    const targetUserId = params.userId;

    // Check if user is removing themselves
    if (session.user.id === targetUserId) {
      // Import leaveGroup function
      const { leaveGroup } = await import('@/lib/members/remove-member');
      const result = await leaveGroup(groupId, session.user.id);

      if (!result.success) {
        return NextResponse.json(
          { error: result.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: result.message
      });
    }

    // Remove the member
    const result = await removeMemberFromGroup(
      groupId,
      targetUserId,
      session.user.id
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error removing member from group:', error);
    return NextResponse.json(
      { error: 'Failed to remove member from group' },
      { status: 500 }
    );
  }
}

// GET /api/groups/[id]/members/[userId] - Get specific member details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const groupId = params.id;
    const targetUserId = params.userId;

    // Get the member's role
    const role = await getMemberRole(groupId, targetUserId);

    if (!role) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Check if requester is a member
    const requesterRole = await getMemberRole(groupId, session.user.id);
    if (!requesterRole) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    // Return member details
    return NextResponse.json({
      success: true,
      member: {
        user_id: targetUserId,
        role,
        is_you: session.user.id === targetUserId
      }
    });
  } catch (error) {
    console.error('Error fetching member details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member details' },
      { status: 500 }
    );
  }
}
