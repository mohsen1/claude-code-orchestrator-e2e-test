import { NextRequest, NextResponse } from 'next/server';
import { getInviteManager } from '@/lib/invites/invite-manager';

interface RouteContext {
  params: {
    code: string;
  };
}

/**
 * GET /api/invites/[code]
 * Public endpoint to lookup an invite by code
 * Returns invite details without sensitive information
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const code = context.params.code;
    const inviteManager = getInviteManager();

    // Validate the invite
    const validation = inviteManager.validateInvite(code);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          invite: null,
        },
        { status: 404 }
      );
    }

    const invite = validation.invite!;

    // Return public-safe invite information
    return NextResponse.json({
      success: true,
      invite: {
        code: invite.code,
        groupId: invite.groupId,
        createdAt: invite.createdAt,
        expiresAt: invite.expiresAt,
        maxUses: invite.maxUses,
        useCount: invite.useCount,
        remainingUses: invite.maxUses === null ? null : Math.max(0, invite.maxUses - invite.useCount),
        isValid: true,
      },
    });
  } catch (error) {
    console.error('Error looking up invite:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to lookup invite' },
      { status: 500 }
    );
  }
}
