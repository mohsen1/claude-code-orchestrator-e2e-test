/**
 * Example API route demonstrating Socket.io integration
 * This shows how to broadcast events to connected clients
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSocketIO } from '@/lib/socket';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, createdBy } = body;

    // Validate input
    if (!name || !createdBy) {
      return NextResponse.json(
        { error: 'Name and createdBy are required' },
        { status: 400 }
      );
    }

    // Create group in database (example - implement your database logic)
    const groupId = `group-${Date.now()}`;
    // await db.createGroup({ id: groupId, name, description, createdBy });

    // Broadcast to all connected clients
    const io = getSocketIO();
    if (io) {
      // Emit to all connected clients
      io.emit('group_created', {
        id: groupId,
        name,
        description,
        createdBy,
        createdAt: new Date(),
      });

      // Or emit to a specific room if needed
      // io.to(groupId).emit('group_updated', { ... });
    }

    return NextResponse.json({
      success: true,
      group: {
        id: groupId,
        name,
        description,
        createdBy,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get groups from database
    // const groups = await db.getGroups();

    return NextResponse.json({
      groups: [],
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}
