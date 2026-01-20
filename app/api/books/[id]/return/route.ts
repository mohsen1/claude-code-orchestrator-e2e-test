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

    // Find active borrowing for this book
    const activeBorrowing = db.prepare(
      'SELECT * FROM borrowings WHERE book_id = ? AND returned_at IS NULL'
    ).get(bookId) as any;

    if (!activeBorrowing) {
      return NextResponse.json(
        { error: 'This book is not currently borrowed' },
        { status: 400 }
      );
    }

    // Update the borrowing record with return date
    const now = new Date().toISOString();
    db.prepare(
      'UPDATE borrowings SET returned_at = ? WHERE id = ?'
    ).run(now, activeBorrowing.id);

    // Get the updated borrowing record
    const returnedBorrowing = db.prepare('SELECT * FROM borrowings WHERE id = ?').get(activeBorrowing.id) as any;

    return NextResponse.json({
      success: true,
      message: 'Book returned successfully',
      borrowing: {
        id: returnedBorrowing.id,
        book_id: returnedBorrowing.book_id,
        borrower_name: returnedBorrowing.borrower_name,
        borrowed_at: returnedBorrowing.borrowed_at,
        returned_at: returnedBorrowing.returned_at
      }
    });

  } catch (error) {
    console.error('Error returning book:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
