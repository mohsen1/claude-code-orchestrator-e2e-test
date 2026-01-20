import { NextRequest, NextResponse } from 'next/server';
import { bookDb } from '@/lib/db';

export const runtime = 'nodejs';

// GET /api/books/[id] - Get a single book
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    const book = bookDb.getById(id);

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    );
  }
}

// PUT /api/books/[id] - Update a book
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    const book = bookDb.getById(id);
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, author, isbn, year, description } = body;

    // Validation for year if provided
    if (year !== undefined && (isNaN(year) || year < 0 || year > new Date().getFullYear() + 1)) {
      return NextResponse.json(
        { error: 'Invalid year' },
        { status: 400 }
      );
    }

    const updatedBook = bookDb.update(id, {
      title,
      author,
      isbn,
      year,
      description,
    });

    return NextResponse.json(updatedBook);
  } catch (error: any) {
    console.error('Error updating book:', error);

    // Handle unique constraint violation for ISBN
    if (error.code === 'SQLITE_CONSTRAINT' || error.message?.includes('UNIQUE')) {
      return NextResponse.json(
        { error: 'A book with this ISBN already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    );
  }
}

// DELETE /api/books/[id] - Delete a book
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    const book = bookDb.getById(id);
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    const deleted = bookDb.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete book' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Book deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    );
  }
}
