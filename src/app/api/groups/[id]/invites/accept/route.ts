import { NextRequest, NextResponse } from 'next/server';
import { getInviteManager } from '@/lib/invites/invite-manager';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * POST /api/groups/[id]/invites/accept
 * Accept an invite to join a group
 * Body: { code: string, userId: string }
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const groupId = context.params.id;
    const body = await request.json();

    const { code, userId } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Invite code is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const inviteManager = getInviteManager();

    // First validate the invite
    const validation = inviteManager.validateInvite(code);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Verify the invite belongs to this group
    if (validation.invite!.groupId !== groupId) {
      return NextResponse.json(
        { success: false, error: 'Invite does not belong to this group' },
        { status: 400 }
      );
    }

    // Accept the invite
    const result = inviteManager.acceptInvite(code, userId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the group',
      groupId: groupId,
      invite: {
        id: result.invite!.id,
        code: result.invite!.code,
        createdBy: result.invite!.createdBy,
        createdAt: result.invite!.createdAt,
      },
    });
  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to accept invite' },
      { status: 500 }
    );
  }
}
