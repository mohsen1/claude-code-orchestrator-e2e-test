import { NextRequest, NextResponse } from 'next/server';
import { bookDb, borrowingDb } from '@/lib/db';

export const runtime = 'nodejs';

// POST /api/books/[id]/borrow - Borrow a book
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

    if (book.borrowed) {
      return NextResponse.json(
        { error: 'Book is already borrowed' },
        { status: 409 }
      );
    }

    const body = await request.json();
    const { borrower_name } = body;

    if (!borrower_name || typeof borrower_name !== 'string' || borrower_name.trim() === '') {
      return NextResponse.json(
        { error: 'Borrower name is required' },
        { status: 400 }
      );
    }

    borrowingDb.borrow(id, borrower_name.trim());

    const updatedBook = bookDb.getById(id);

    return NextResponse.json(updatedBook, { status: 200 });
  } catch (error) {
    console.error('Error borrowing book:', error);
    return NextResponse.json(
      { error: 'Failed to borrow book' },
      { status: 500 }
    );
  }
}
