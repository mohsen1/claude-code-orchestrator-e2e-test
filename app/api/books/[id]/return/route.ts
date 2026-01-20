import { NextRequest, NextResponse } from 'next/server';
import { bookDb, borrowingDb } from '@/lib/db';

export const runtime = 'nodejs';

// POST /api/books/[id]/return - Return a borrowed book
export async function POST(
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

    if (!book.borrowed) {
      return NextResponse.json(
        { error: 'Book is not currently borrowed' },
        { status: 409 }
      );
    }

    const returned = borrowingDb.return(id);

    if (!returned) {
      return NextResponse.json(
        { error: 'Failed to return book' },
        { status: 500 }
      );
    }

    const updatedBook = bookDb.getById(id);

    return NextResponse.json(updatedBook, { status: 200 });
  } catch (error) {
    console.error('Error returning book:', error);
    return NextResponse.json(
      { error: 'Failed to return book' },
      { status: 500 }
    );
  }
}
