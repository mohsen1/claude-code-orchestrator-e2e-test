import { NextRequest, NextResponse } from 'next/server';
import { getInviteManager } from '@/lib/invites/invite-manager';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/groups/[id]/invites
 * Get all invites for a group
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const groupId = context.params.id;
    const inviteManager = getInviteManager();

    const invites = inviteManager.getGroupInvites(groupId);

    return NextResponse.json({
      success: true,
      invites: invites.map(invite => ({
        id: invite.id,
        code: invite.code,
        createdBy: invite.createdBy,
        createdAt: invite.createdAt,
        expiresAt: invite.expiresAt,
        maxUses: invite.maxUses,
        useCount: invite.useCount,
        remainingUses: invite.maxUses === null ? null : Math.max(0, invite.maxUses - invite.useCount),
      })),
    });
  } catch (error) {
    console.error('Error fetching invites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invites' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups/[id]/invites
 * Create a new invite for a group
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const groupId = context.params.id;
    const body = await request.json();

    // Validate request body
    const { userId, expiresAt, maxUses } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate expiration date if provided
    let expirationDate: Date | undefined;
    if (expiresAt) {
      expirationDate = new Date(expiresAt);
      if (expirationDate <= new Date()) {
        return NextResponse.json(
          { success: false, error: 'Expiration date must be in the future' },
          { status: 400 }
        );
      }
    }

    // Validate max uses if provided
    if (maxUses !== undefined && (typeof maxUses !== 'number' || maxUses < 1)) {
      return NextResponse.json(
        { success: false, error: 'Max uses must be a positive number' },
        { status: 400 }
      );
    }

    const inviteManager = getInviteManager();
    const invite = inviteManager.createInvite({
      groupId,
      createdBy: userId,
      expiresAt: expirationDate,
      maxUses: maxUses || null,
    });

    // Generate invite link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteLink = `${baseUrl}/invite/${invite.code}`;

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        code: invite.code,
        inviteLink,
        createdBy: invite.createdBy,
        createdAt: invite.createdAt,
        expiresAt: invite.expiresAt,
        maxUses: invite.maxUses,
        useCount: invite.useCount,
        remainingUses: invite.maxUses === null ? null : Math.max(0, invite.maxUses - invite.useCount),
      },
    });
  } catch (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create invite' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]/invites
 * Delete an invite (requires code in query params)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const groupId = context.params.id;
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Invite code is required' },
        { status: 400 }
      );
    }

    const inviteManager = getInviteManager();
    const invite = inviteManager.getInvite(code);

    if (!invite) {
      return NextResponse.json(
        { success: false, error: 'Invite not found' },
        { status: 404 }
      );
    }

    // Verify invite belongs to the group
    if (invite.groupId !== groupId) {
      return NextResponse.json(
        { success: false, error: 'Invite does not belong to this group' },
        { status: 403 }
      );
    }

    const deleted = inviteManager.deleteInvite(code);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete invite' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invite deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting invite:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete invite' },
      { status: 500 }
    );
  }
}
