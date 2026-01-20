import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  removeGroupMember,
  updateGroupMemberRole,
} from '@/lib/actions/groups';
import { z } from 'zod';

const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'member']),
});

// DELETE /api/groups/[id]/members/[userId] - Remove a member from the group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = parseInt(params.id);
    if (isNaN(groupId)) {
      return NextResponse.json({ error: 'Invalid group ID' }, { status: 400 });
    }

    await removeGroupMember(groupId, params.userId);

    return NextResponse.json({
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Error removing member:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}

// PATCH /api/groups/[id]/members/[userId] - Update member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = parseInt(params.id);
    if (isNaN(groupId)) {
      return NextResponse.json({ error: 'Invalid group ID' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateMemberRoleSchema.parse(body);

    const member = await updateGroupMemberRole(
      groupId,
      params.userId,
      validatedData.role
    );

    return NextResponse.json({
      member,
      message: 'Member role updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating member role:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    );
  }
}
