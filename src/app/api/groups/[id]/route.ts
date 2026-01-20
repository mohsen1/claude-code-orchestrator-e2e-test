/**
 * API Route Handler for Individual Groups
 * Handles GET, PUT, and DELETE operations for a specific group
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
  formatErrorResponse,
} from '@/lib/api/errors';
import {
  validateUpdateGroup,
  validateGroupId,
  UpdateGroupSchema,
} from '@/lib/validation/group-validation';

/**
 * GET /api/groups/[id]
 * Get a specific group by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session to authenticate the user
    const session = await getServerSession();

    if (!session || !session.user) {
      throw new UnauthorizedError('You must be logged in to view group details');
    }

    // Validate group ID
    const groupId = validateGroupId(params.id);

    // TODO: Replace with actual database query
    // const group = await db.group.findUnique({
    //   where: { id: groupId },
    //   include: {
    //     members: {
    //       include: {
    //         user: {
    //           select: {
    //             id: true,
    //             name: true,
    //             email: true,
    //             image: true,
    //           },
    //         },
    //       },
    //       orderBy: {
    //         createdAt: 'asc',
    //       },
    //     },
    //     expenses: {
    //       include: {
    //         paidBy: {
    //           select: {
    //             id: true,
    //             name: true,
    //             image: true,
    //           },
    //         },
    //         splits: {
    //           include: {
    //             user: {
    //               select: {
    //                 id: true,
    //                 name: true,
    //                 image: true,
    //               },
    //             },
    //           },
    //         },
    //       },
    //       orderBy: {
    //         date: 'desc',
    //       },
    //     },
    //   },
    // });

    // if (!group) {
    //   throw new NotFoundError('Group', groupId);
    // }

    // // Check if user is a member of the group
    // const isMember = group.members.some(
    //   (member) => member.userId === session.user.id
    // );

    // if (!isMember) {
    //   throw new ForbiddenError('You do not have access to this group');
    // }

    // Mock response for now
    const group = {
      id: groupId,
      name: 'Sample Group',
      description: 'A sample expense sharing group',
      currency: 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [
        {
          id: crypto.randomUUID(),
          userId: session.user.id,
          role: 'admin',
          user: {
            id: session.user.id,
            name: session.user.name || 'User',
            email: session.user.email || '',
            image: session.user.image || null,
          },
        },
      ],
      expenses: [],
    };

    return NextResponse.json(group, { status: 200 });

  } catch (error: unknown) {
    const { error: formattedError, status } = formatErrorResponse(error);
    return NextResponse.json(formattedError, { status });
  }
}

/**
 * PUT /api/groups/[id]
 * Update a specific group
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session to authenticate the user
    const session = await getServerSession();

    if (!session || !session.user) {
      throw new UnauthorizedError('You must be logged in to update a group');
    }

    // Validate group ID
    const groupId = validateGroupId(params.id);

    // Parse request body
    const body = await request.json();

    // Validate request body
    const validatedData: UpdateGroupSchema = validateUpdateGroup(body);

    // TODO: Replace with actual database operations
    // // Check if group exists and user is an admin
    // const existingGroup = await db.group.findUnique({
    //   where: { id: groupId },
    //   include: {
    //     members: {
    //       where: {
    //         userId: session.user.id,
    //       },
    //     },
    //   },
    // });

    // if (!existingGroup) {
    //   throw new NotFoundError('Group', groupId);
    // }

    // if (existingGroup.members.length === 0) {
    //   throw new ForbiddenError('You must be a member of this group to update it');
    // }

    // const memberRole = existingGroup.members[0].role;
    // if (memberRole !== 'admin') {
    //   throw new ForbiddenError('Only admins can update group details');
    // }

    // // Update the group
    // const updatedGroup = await db.group.update({
    //   where: { id: groupId },
    //   data: validatedData,
    //   include: {
    //     members: {
    //       include: {
    //         user: {
    //           select: {
    //             id: true,
    //             name: true,
    //             email: true,
    //             image: true,
    //           },
    //         },
    //       },
    //     },
    //   },
    // });

    // Mock response for now
    const updatedGroup = {
      id: groupId,
      ...validatedData,
      currency: validatedData.currency || 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [
        {
          id: crypto.randomUUID(),
          userId: session.user.id,
          role: 'admin',
          user: {
            id: session.user.id,
            name: session.user.name || 'User',
            email: session.user.email || '',
            image: session.user.image || null,
          },
        },
      ],
    };

    return NextResponse.json(updatedGroup, { status: 200 });

  } catch (error: unknown) {
    // Handle validation errors specifically
    if (error instanceof Error && (error as any).fields) {
      const validationError = new ValidationError(
        'Validation failed',
        (error as any).fields
      );
      const { error: formattedError, status } = formatErrorResponse(validationError);
      return NextResponse.json(formattedError, { status });
    }

    const { error: formattedError, status } = formatErrorResponse(error);
    return NextResponse.json(formattedError, { status });
  }
}

/**
 * DELETE /api/groups/[id]
 * Delete a specific group
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session to authenticate the user
    const session = await getServerSession();

    if (!session || !session.user) {
      throw new UnauthorizedError('You must be logged in to delete a group');
    }

    // Validate group ID
    const groupId = validateGroupId(params.id);

    // TODO: Replace with actual database operations
    // // Check if group exists and user is an admin
    // const existingGroup = await db.group.findUnique({
    //   where: { id: groupId },
    //   include: {
    //     members: {
    //       where: {
    //         userId: session.user.id,
    //       },
    //     },
    //   },
    // });

    // if (!existingGroup) {
    //   throw new NotFoundError('Group', groupId);
    // }

    // if (existingGroup.members.length === 0) {
    //   throw new ForbiddenError('You must be a member of this group to delete it');
    // }

    // const memberRole = existingGroup.members[0].role;
    // if (memberRole !== 'admin') {
    //   throw new ForbiddenError('Only admins can delete groups');
    // }

    // // Delete the group (cascade delete should handle members and expenses)
    // await db.group.delete({
    //   where: { id: groupId },
    // });

    // Mock response for now
    return NextResponse.json(
      {
        message: 'Group deleted successfully',
        id: groupId,
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    const { error: formattedError, status } = formatErrorResponse(error);
    return NextResponse.json(formattedError, { status });
  }
}

/**
 * OPTIONS /api/groups/[id]
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, PUT, DELETE, OPTIONS',
    },
  });
}
