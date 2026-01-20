import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GroupsDatabase } from '@/lib/db/groups';
import { getDb } from '@/lib/db';

// GET /api/invitations - Get all pending invitations for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const groupsDb = new GroupsDatabase(db);

    // Get user's email
    const userStmt = db.prepare('SELECT email FROM users WHERE id = ?');
    const user = userStmt.get(session.user.id) as { email: string } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all pending invitations for this email
    const invitations = groupsDb.getInvitationsByEmail(user.email);

    // Enrich with group details and filter expired
    const enrichedInvitations = invitations
      .filter((inv) => inv.expires_at > Date.now())
      .map((invitation) => {
        const group = groupsDb.getGroupById(invitation.group_id);
        return {
          ...invitation,
          group_name: group?.name,
          group_description: group?.description,
        };
      });

    return NextResponse.json({ invitations: enrichedInvitations });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
