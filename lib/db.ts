import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'library.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT NOT NULL UNIQUE,
    year INTEGER NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS borrowings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    borrower_name TEXT NOT NULL,
    borrowed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    returned_at DATETIME,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
  CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
  CREATE INDEX IF NOT EXISTS idx_borrowings_book_id ON borrowings(book_id);
`);

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  year: number;
  description?: string;
  created_at: string;
}

export interface Borrowing {
  id: number;
  book_id: number;
  borrower_name: string;
  borrowed_at: string;
  returned_at?: string;
}

export interface BookWithAvailability extends Book {
  available: boolean;
  current_borrower?: string;
}

export default db;
