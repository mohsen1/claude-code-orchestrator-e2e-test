import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * GET /api/groups/[id]/members
 * Get all members of a group
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = params.id;

    // Check if user is a member of the group
    const membership = await db.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      );
    }

    const members = await db.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        role: 'desc',
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching group members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group members' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups/[id]/members
 * Add a member to a group
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = params.id;
    const body = await request.json();
    const { userId, email, role = 'MEMBER' } = body;

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'Either userId or email is required' },
        { status: 400 }
      );
    }

    // Check if the current user is an admin
    const adminMembership = await db.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    });

    if (!adminMembership || adminMembership.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can add members' },
        { status: 403 }
      );
    }

    // If email is provided, find the user by email
    let targetUserId = userId;
    if (email && !userId) {
      const targetUser = await db.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!targetUser) {
        return NextResponse.json(
          { error: 'User with this email not found' },
          { status: 404 }
        );
      }

      targetUserId = targetUser.id;
    }

    // Check if user is already a member
    const existingMembership = await db.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: targetUserId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: 'User is already a member of this group' },
        { status: 400 }
      );
    }

    // Add the member to the group
    const newMember = await db.groupMember.create({
      data: {
        groupId,
        userId: targetUserId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error('Error adding group member:', error);
    return NextResponse.json(
      { error: 'Failed to add group member' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]/members
 * Remove a member from a group (or leave the group)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = params.id;
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');

    // Check if user is removing themselves or is an admin
    const isSelfRemoval = !targetUserId || targetUserId === session.user.id;

    if (!isSelfRemoval) {
      // Check if current user is an admin
      const adminMembership = await db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: session.user.id,
          },
        },
      });

      if (!adminMembership || adminMembership.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Only admins can remove other members' },
          { status: 403 }
        );
      }

      // Prevent removing the last admin
      const targetMembership = await db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: targetUserId,
          },
        },
      });

      if (targetMembership?.role === 'ADMIN') {
        const adminCount = await db.groupMember.count({
          where: {
            groupId,
            role: 'ADMIN',
          },
        });

        if (adminCount <= 1) {
          return NextResponse.json(
            { error: 'Cannot remove the last admin. Promote another member first.' },
            { status: 400 }
          );
        }
      }

      // Remove the specified member
      await db.groupMember.delete({
        where: {
          groupId_userId: {
            groupId,
            userId: targetUserId,
          },
        },
      });

      return NextResponse.json(
        { message: 'Member removed successfully' },
        { status: 200 }
      );
    } else {
      // User is leaving the group
      const membership = await db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: session.user.id,
          },
        },
      });

      if (!membership) {
        return NextResponse.json(
          { error: 'Not a member of this group' },
          { status: 404 }
        );
      }

      // Prevent leaving if the user is the last admin
      if (membership.role === 'ADMIN') {
        const adminCount = await db.groupMember.count({
          where: {
            groupId,
            role: 'ADMIN',
          },
        });

        if (adminCount <= 1) {
          return NextResponse.json(
            { error: 'Cannot leave the group as the last admin. Promote another member or delete the group.' },
            { status: 400 }
          );
        }
      }

      // Remove the user from the group
      await db.groupMember.delete({
        where: {
          groupId_userId: {
            groupId,
            userId: session.user.id,
          },
        },
      });

      return NextResponse.json(
        { message: 'Left the group successfully' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error removing group member:', error);
    return NextResponse.json(
      { error: 'Failed to remove group member' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/groups/[id]/members
 * Update member role (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = params.id;
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      );
    }

    if (!['ADMIN', 'MEMBER'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be ADMIN or MEMBER' },
        { status: 400 }
      );
    }

    // Check if current user is an admin
    const adminMembership = await db.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    });

    if (!adminMembership || adminMembership.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can update member roles' },
        { status: 403 }
      );
    }

    // Prevent removing the last admin
    if (role === 'MEMBER') {
      const targetMembership = await db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
      });

      if (targetMembership?.role === 'ADMIN') {
        const adminCount = await db.groupMember.count({
          where: {
            groupId,
            role: 'ADMIN',
          },
        });

        if (adminCount <= 1) {
          return NextResponse.json(
            { error: 'Cannot demote the last admin. Promote another member first.' },
            { status: 400 }
          );
        }
      }
    }

    // Update the member role
    const updatedMember = await db.groupMember.update({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    );
  }
}
