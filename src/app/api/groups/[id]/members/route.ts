import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { addMemberToGroup, addMultipleMembersToGroup } from '@/lib/members/add-member';
import { getGroupMembers, isGroupMember } from '@/lib/members/authorize';

// GET /api/groups/[id]/members - List all members of a group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Check if user is a member of the group
    const isMember = await isGroupMember(groupId, session.user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    // Get all members with user details
    const members = await getGroupMembers(groupId);

    // Fetch user details for each member
    const membersWithDetails = await Promise.all(
      members.map(async (member) => {
        const user = await new Promise<any>((resolve) => {
          // This would typically query a users table
          // For now, return basic info
          resolve({
            id: member.user_id,
            name: session.user.id === member.user_id ? session.user.name : 'User',
            email: session.user.id === member.user_id ? session.user.email : null
          });
        });

        return {
          ...member,
          user
        };
      })
    );

    return NextResponse.json({
      success: true,
      members: membersWithDetails
    });
  } catch (error) {
    console.error('Error fetching group members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group members' },
      { status: 500 }
    );
  }
}

// POST /api/groups/[id]/members - Add a member to the group
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const body = await request.json();
    const { userId, userIds, role = 'member' } = body;

    // Validate request body
    if (!userId && !userIds) {
      return NextResponse.json(
        { error: 'userId or userIds is required' },
        { status: 400 }
      );
    }

    // Handle single member addition
    if (userId) {
      const result = await addMemberToGroup(
        groupId,
        userId,
        session.user.id,
        role
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
    }

    // Handle multiple members addition
    if (userIds && Array.isArray(userIds)) {
      const result = await addMultipleMembersToGroup(
        groupId,
        userIds,
        session.user.id,
        role
      );

      return NextResponse.json({
        success: result.success,
        message: result.message,
        results: result.results
      });
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error adding member to group:', error);
    return NextResponse.json(
      { error: 'Failed to add member to group' },
      { status: 500 }
    );
  }
}
