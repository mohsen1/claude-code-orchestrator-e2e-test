import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure database directory exists
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'library.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
export function initializeDatabase() {
  // Create books table
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      isbn TEXT NOT NULL UNIQUE,
      year INTEGER NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create borrowings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS borrowings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      borrower_name TEXT NOT NULL,
      borrowed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      returned_at DATETIME,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )
  `);

  // Create index on books for faster searches
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
    CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
    CREATE INDEX IF NOT EXISTS idx_books_year ON books(year);
  `);

  // Create index on borrowings for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_borrowings_book_id ON borrowings(book_id);
    CREATE INDEX IF NOT EXISTS idx_borrowings_returned ON borrowings(returned_at);
  `);
}

// Initialize database on import
initializeDatabase();

// Book CRUD operations
export const bookDb = {
  // Get all books with optional search and filter
  getAll: (options?: { search?: string; year?: number; limit?: number; offset?: number }) => {
    const { search, year, limit = 50, offset = 0 } = options || {};

    let query = 'SELECT * FROM books WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (year) {
      query += ' AND year = ?';
      params.push(year);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(query);
    return stmt.all(...params) as Book[];
  },

  // Get book by ID
  getById: (id: number) => {
    const stmt = db.prepare('SELECT * FROM books WHERE id = ?');
    return stmt.get(id) as Book | undefined;
  },

  // Get book by ISBN
  getByIsbn: (isbn: string) => {
    const stmt = db.prepare('SELECT * FROM books WHERE isbn = ?');
    return stmt.get(isbn) as Book | undefined;
  },

  // Create new book
  create: (book: Omit<Book, 'id' | 'created_at'>) => {
    const stmt = db.prepare(`
      INSERT INTO books (title, author, isbn, year, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(book.title, book.author, book.isbn, book.year, book.description);
    return result.lastInsertRowid as number;
  },

  // Update book
  update: (id: number, book: Partial<Omit<Book, 'id' | 'created_at'>>) => {
    const fields: string[] = [];
    const params: any[] = [];

    if (book.title !== undefined) {
      fields.push('title = ?');
      params.push(book.title);
    }
    if (book.author !== undefined) {
      fields.push('author = ?');
      params.push(book.author);
    }
    if (book.isbn !== undefined) {
      fields.push('isbn = ?');
      params.push(book.isbn);
    }
    if (book.year !== undefined) {
      fields.push('year = ?');
      params.push(book.year);
    }
    if (book.description !== undefined) {
      fields.push('description = ?');
      params.push(book.description);
    }

    if (fields.length === 0) return false;

    params.push(id);
    const stmt = db.prepare(`UPDATE books SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...params);
    return result.changes > 0;
  },

  // Delete book
  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM books WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  // Count total books
  count: (options?: { search?: string; year?: number }) => {
    const { search, year } = options || {};

    let query = 'SELECT COUNT(*) as count FROM books WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (year) {
      query += ' AND year = ?';
      params.push(year);
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...params) as { count: number };
    return result.count;
  },
};

// Borrowing CRUD operations
export const borrowingDb = {
  // Get active borrowing for a book
  getActiveByBookId: (bookId: number) => {
    const stmt = db.prepare(`
      SELECT * FROM borrowings
      WHERE book_id = ? AND returned_at IS NULL
      ORDER BY borrowed_at DESC
      LIMIT 1
    `);
    return stmt.get(bookId) as Borrowing | undefined;
  },

  // Get all borrowings for a book
  getByBookId: (bookId: number) => {
    const stmt = db.prepare(`
      SELECT * FROM borrowings
      WHERE book_id = ?
      ORDER BY borrowed_at DESC
    `);
    return stmt.all(bookId) as Borrowing[];
  },

  // Borrow a book
  create: (bookId: number, borrowerName: string) => {
    const stmt = db.prepare(`
      INSERT INTO borrowings (book_id, borrower_name, borrowed_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    const result = stmt.run(bookId, borrowerName);
    return result.lastInsertRowid as number;
  },

  // Return a book
  returnBook: (bookId: number) => {
    const stmt = db.prepare(`
      UPDATE borrowings
      SET returned_at = CURRENT_TIMESTAMP
      WHERE book_id = ? AND returned_at IS NULL
    `);
    const result = stmt.run(bookId);
    return result.changes > 0;
  },

  // Get borrowing by ID
  getById: (id: number) => {
    const stmt = db.prepare('SELECT * FROM borrowings WHERE id = ?');
    return stmt.get(id) as Borrowing | undefined;
  },

  // Get all active borrowings
  getAllActive: () => {
    const stmt = db.prepare(`
      SELECT b.*, borrowings.id as borrowing_id, borrowings.borrower_name, borrowings.borrowed_at
      FROM borrowings
      JOIN books b ON borrowings.book_id = b.id
      WHERE borrowings.returned_at IS NULL
      ORDER BY borrowings.borrowed_at DESC
    `);
    return stmt.all() as (Book & { borrowing_id: number; borrower_name: string; borrowed_at: string })[];
  },
};

// Helper function to check if a book is available
export function isBookAvailable(bookId: number): boolean {
  const activeBorrowing = borrowingDb.getActiveByBookId(bookId);
  return !activeBorrowing;
}

// Helper function to get book with availability status
export function getBookWithAvailability(bookId: number) {
  const book = bookDb.getById(bookId);
  if (!book) return null;

  const activeBorrowing = borrowingDb.getActiveByBookId(bookId);
  return {
    ...book,
    isAvailable: !activeBorrowing,
    currentBorrowing: activeBorrowing || null,
  };
}

// Helper function to get all books with availability status
export function beyondushortAllBooksWithAvailability(options?: { search?: string; year?: number; limit?: number; offset?: number }) {
  const books = bookDb.getAll(options);
  return books.map(book => {
    const activeBorrowing = borrowingDb.getActiveByBookId(book.id);
    return {
      ...book,
      isAvailable: !activeBorrowing,
      currentBorrowing: activeBorrowing || null,
    };
  });
}

// Export database instance for direct queries if needed
export { db };

// Type definitions
export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  year: number;
  description: string | null;
  created_at: string;
}

export interface Borrowing {
  id: number;
  book_id: number;
  borrower_name: string;
  borrowed_at: string;
  returned_at: string | null;
}

export interface BookWithAvailability extends Book {
  isAvailable: boolean;
  currentBorrowing: Borrowing | null;
}
