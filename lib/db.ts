import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'library.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Book interface
export interface Book {
  id?: number;
  title: string;
  author: string;
  isbn: string;
  year: number;
  borrowed: boolean;
  borrower?: string | null;
  borrowDate?: string | null;
  returnDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Initialize database schema
export function initializeDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      isbn TEXT NOT NULL UNIQUE,
      year INTEGER NOT NULL,
      borrowed BOOLEAN DEFAULT 0,
      borrower TEXT,
      borrowDate TEXT,
      returnDate TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
    CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
    CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
    CREATE INDEX IF NOT EXISTS idx_books_borrowed ON books(borrowed);
  `);
}

// CRUD Operations

// Create a new book
export function createBook(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Book {
  const stmt = db.prepare(`
    INSERT INTO books (title, author, isbn, year, borrowed, borrower, borrowDate, returnDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    book.title,
    book.author,
    book.isbn,
    book.year,
    book.borrowed ? 1 : 0,
    book.borrower || null,
    book.borrowDate || null,
    book.returnDate || null
  );

  return getBookById(result.lastInsertRowid as number)!;
}

// Get a single book by ID
export function getBookById(id: number): Book | null {
  const stmt = db.prepare('SELECT * FROM books WHERE id = ?');
  const row = stmt.get(id) as any;

  if (!row) return null;

  return {
    ...row,
    borrowed: Boolean(row.borrowed),
  };
}

// Get book by ISBN
export function getBookByISBN(isbn: string): Book | null {
  const stmt = db.prepare('SELECT * FROM books WHERE isbn = ?');
  const row = stmt.get(isbn) as any;

  if (!row) return null;

  return {
    ...row,
    borrowed: Boolean(row.borrowed),
  };
}

// Get all books with optional search filter
export function getAllBooks(searchQuery?: string): Book[] {
  let stmt;
  let params: any[] = [];

  if (searchQuery && searchQuery.trim()) {
    stmt = db.prepare(`
      SELECT * FROM books
      WHERE title LIKE ?
         OR author LIKE ?
         OR isbn LIKE ?
      ORDER BY createdAt DESC
    `);
    const searchTerm = `%${searchQuery.trim()}%`;
    params = [searchTerm, searchTerm, searchTerm];
  } else {
    stmt = db.prepare('SELECT * FROM books ORDER BY createdAt DESC');
  }

  const rows = stmt.all(...params) as any[];

  return rows.map(row => ({
    ...row,
    borrowed: Boolean(row.borrowed),
  }));
}

// Update an existing book
export function updateBook(id: number, updates: Partial<Omit<Book, 'id' | 'createdAt' | 'updatedAt'>>): Book | null {
  const currentBook = getBookById(id);
  if (!currentBook) return null;

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.author !== undefined) {
    fields.push('author = ?');
    values.push(updates.author);
  }
  if (updates.isbn !== undefined) {
    fields.push('isbn = ?');
    values.push(updates.isbn);
  }
  if (updates.year !== undefined) {
    fields.push('year = ?');
    values.push(updates.year);
  }
  if (updates.borrowed !== undefined) {
    fields.push('borrowed = ?');
    values.push(updates.borrowed ? 1 : 0);
  }
  if (updates.borrower !== undefined) {
    fields.push('borrower = ?');
    values.push(updates.borrower);
  }
  if (updates.borrowDate !== undefined) {
    fields.push('borrowDate = ?');
    values.push(updates.borrowDate);
  }
  if (updates.returnDate !== undefined) {
    fields.push('returnDate = ?');
    values.push(updates.returnDate);
  }

  if (fields.length === 0) return currentBook;

  fields.push('updatedAt = CURRENT_TIMESTAMP');
  values.push(id);

  const stmt = db.prepare(`UPDATE books SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);

  return getBookById(id);
}

// Delete a book
export function deleteBook(id: number): boolean {
  const stmt = db.prepare('DELETE FROM books WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// Mark a book as borrowed
export function borrowBook(id: number, borrower: string): Book | null {
  return updateBook(id, {
    borrowed: true,
    borrower,
    borrowDate: new Date().toISOString(),
    returnDate: null,
  });
}

// Mark a book as returned
export function returnBook(id: number): Book | null {
  return updateBook(id, {
    borrowed: false,
    borrower: null,
    borrowDate: null,
    returnDate: new Date().toISOString(),
  });
}

// Get borrowed books
export function getBorrowedBooks(): Book[] {
  const stmt = db.prepare('SELECT * FROM books WHERE borrowed = 1 ORDER BY borrowDate DESC');
  const rows = stmt.all() as any[];

  return rows.map(row => ({
    ...row,
    borrowed: Boolean(row.borrowed),
  }));
}

// Get available books (not borrowed)
export function getAvailableBooks(): Book[] {
  const stmt = db.prepare('SELECT * FROM books WHERE borrowed = 0 ORDER BY createdAt DESC');
  const rows = stmt.all() as any[];

  return rows.map(row => ({
    ...row,
    borrowed: Boolean(row.borrowed),
  }));
}

// Initialize the database on module load
initializeDatabase();

export default db;
