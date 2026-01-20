/**
 * API Route Handler for Groups
 * Handles GET (list) and POST (create) operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
  formatErrorResponse,
} from '@/lib/api/errors';
import {
  validateCreateGroup,
  validateListGroupsQuery,
  CreateGroupSchema,
  ListGroupsQuery,
} from '@/lib/validation/group-validation';

/**
 * GET /api/groups
 * List all groups for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get the session to authenticate the user
    const session = await getServerSession();

    if (!session || !session.user) {
      throw new UnauthorizedError('You must be logged in to view groups');
    }

    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = validateListGroupsQuery(searchParams);

    // TODO: Replace with actual database query
    // const groups = await db.group.findMany({
    //   where: {
    //     members: {
    //       some: {
    //         userId: session.user.id,
    //       },
    //     },
    //     ...(query.search && {
    //       name: {
    //         contains: query.search,
    //         mode: 'insensitive',
    //       },
    //     }),
    //   },
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
    //     _count: {
    //       select: {
    //         expenses: true,
    //         members: true,
    //       },
    //     },
    //   },
    //   skip: (query.page - 1) * query.limit,
    //   take: query.limit,
    //   orderBy: {
    //     updatedAt: 'desc',
    //   },
    // });

    // Mock response for now
    const groups = {
      data: [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: 0,
        totalPages: 0,
      },
    };

    return NextResponse.json(groups, { status: 200 });

  } catch (error: unknown) {
    const { error: formattedError, status } = formatErrorResponse(error);
    return NextResponse.json(formattedError, { status });
  }
}

/**
 * POST /api/groups
 * Create a new group
 */
export async function POST(request: NextRequest) {
  try {
    // Get the session to authenticate the user
    const session = await getServerSession();

    if (!session || !session.user) {
      throw new UnauthorizedError('You must be logged in to create a group');
    }

    // Parse request body
    const body = await request.json();

    // Validate request body
    const validatedData: CreateGroupSchema = validateCreateGroup(body);

    // TODO: Replace with actual database operation
    // const group = await db.group.create({
    //   data: {
    //     name: validatedData.name,
    //     description: validatedData.description,
    //     currency: validatedData.currency,
    //     members: {
    //       create: {
    //         userId: session.user.id,
    //         role: 'admin',
    //       },
    //     },
    //   },
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
    const group = {
      id: crypto.randomUUID(),
      name: validatedData.name,
      description: validatedData.description,
      currency: validatedData.currency,
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

    return NextResponse.json(group, { status: 201 });

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
 * OPTIONS /api/groups
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, POST, OPTIONS',
    },
  });
}
