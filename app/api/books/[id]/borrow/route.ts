import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = parseInt(params.id);

    if (isNaN(bookId)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    // Check if book exists
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId) as any;
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Check if book is already borrowed
    const activeBorrowing = db.prepare(
      'SELECT * FROM borrowings WHERE book_id = ? AND returned_at IS NULL'
    ).get(bookId) as any;

    if (activeBorrowing) {
      return NextResponse.json(
        { error: 'Book is already borrowed', current_borrower: activeBorrowing.borrower_name },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { borrower_name } = body;

    if (!borrower_name || typeof borrower_name !== 'string' || borrower_name.trim() === '') {
      return NextResponse.json(
        { error: 'Borrower name is required' },
        { status: 400 }
      );
    }

    // Create borrowing record
    const result = db.prepare(
      'INSERT INTO borrowings (book_id, borrower_name) VALUES (?, ?)'
    ).run(bookId, borrower_name.trim());

    // Get the created borrowing record
    const borrowing = db.prepare('SELECT * FROM borrowings WHERE id = ?').get(result.lastInsertRowid) as any;

    return NextResponse.json({
      success: true,
      message: 'Book borrowed successfully',
      borrowing: {
        id: borrowing.id,
        book_id: borrowing.book_id,
        borrower_name: borrowing.borrower_name,
        borrowed_at: borrowing.borrowed_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error borrowing book:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
