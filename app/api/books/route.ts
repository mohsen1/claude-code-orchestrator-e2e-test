import { NextRequest, NextResponse } from 'next/server';
import { bookDb } from '@/lib/db';

export const runtime = 'nodejs';

// GET /api/books - List all books with optional search/filter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const author = searchParams.get('author') || undefined;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const books = bookDb.getAll({ search, author, year, limit, offset });
    const totalCount = bookDb.count({ search, author, year });

    return NextResponse.json({
      books,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

// POST /api/books - Create a new book
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, author, isbn, year, description } = body;

    // Validation
    if (!title || !author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    if (year && (isNaN(year) || year < 0 || year > new Date().getFullYear() + 1)) {
      return NextResponse.json(
        { error: 'Invalid year' },
        { status: 400 }
      );
    }

    const book = bookDb.create({
      title,
      author,
      isbn,
      year,
      description,
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error: any) {
    console.error('Error creating book:', error);

    // Handle unique constraint violation for ISBN
    if (error.code === 'SQLITE_CONSTRAINT' || error.message?.includes('UNIQUE')) {
      return NextResponse.json(
        { error: 'A book with this ISBN already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
}
