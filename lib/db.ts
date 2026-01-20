import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'books.db');
const db = new Database(dbPath);

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE,
    year INTEGER,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS borrowings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    borrower_name TEXT NOT NULL,
    borrowed_at TEXT DEFAULT CURRENT_TIMESTAMP,
    returned_at TEXT,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
  CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
  CREATE INDEX IF NOT EXISTS idx_books_year ON books(year);
`);

export interface Book {
  id?: number;
  title: string;
  author: string;
  isbn?: string;
  year?: number;
  description?: string;
  created_at?: string;
}

export interface Borrowing {
  id?: number;
  book_id: number;
  borrower_name: string;
  borrowed_at?: string;
  returned_at?: string;
}

export interface BookWithBorrowing extends Book {
  borrowed?: boolean;
  borrower_name?: string;
  borrowed_at?: string;
}

// Book CRUD operations
export const bookDb = {
  getAll: (options?: { search?: string; author?: string; year?: number; limit?: number; offset?: number }): BookWithBorrowing[] => {
    let query = `
      SELECT
        b.*,
        bo.id as borrowing_id,
        bo.borrower_name,
        bo.borrowed_at
      FROM books b
      LEFT JOIN borrowings bo ON b.id = bo.book_id AND bo.returned_at IS NULL
      WHERE 1=1
    `;
    const params: any[] = [];

    if (options?.search) {
      query += ` AND (b.title LIKE ? OR b.author LIKE ?)`;
      params.push(`%${options.search}%`, `%${options.search}%`);
    }

    if (options?.author) {
      query += ` AND b.author LIKE ?`;
      params.push(`%${options.author}%`);
    }

    if (options?.year) {
      query += ` AND b.year = ?`;
      params.push(options.year);
    }

    query += ` ORDER BY b.created_at DESC`;

    if (options?.limit) {
      query += ` LIMIT ?`;
      params.push(options.limit);
      if (options?.offset !== undefined) {
        query += ` OFFSET ?`;
        params.push(options.offset);
      }
    }

    const rows = db.prepare(query).all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      author: row.author,
      isbn: row.isbn,
      year: row.year,
      description: row.description,
      created_at: row.created_at,
      borrowed: !!row.borrowing_id,
      borrower_name: row.borrower_name,
      borrowed_at: row.borrowed_at,
    }));
  },

  getById: (id: number): BookWithBorrowing | null => {
    const row = db.prepare(`
      SELECT
        b.*,
        bo.id as borrowing_id,
        bo.borrower_name,
        bo.borrowed_at
      FROM books b
      LEFT JOIN borrowings bo ON b.id = bo.book_id AND bo.returned_at IS NULL
      WHERE b.id = ?
    `).get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      author: row.author,
      isbn: row.isbn,
      year: row.year,
      description: row.description,
      created_at: row.created_at,
      borrowed: !!row.borrowing_id,
      borrower_name: row.borrower_name,
      borrowed_at: row.borrowed_at,
    };
  },

  create: (book: Book): Book => {
    const stmt = db.prepare(`
      INSERT INTO books (title, author, isbn, year, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(book.title, book.author, book.isbn || null, book.year || null, book.description || null);
    return bookDb.getById(result.lastInsertRowid as number)!;
  },

  update: (id: number, book: Partial<Book>): Book | null => {
    const fields: string[] = [];
    const values: any[] = [];

    if (book.title !== undefined) {
      fields.push('title = ?');
      values.push(book.title);
    }
    if (book.author !== undefined) {
      fields.push('author = ?');
      values.push(book.author);
    }
    if (book.isbn !== undefined) {
      fields.push('isbn = ?');
      values.push(book.isbn);
    }
    if (book.year !== undefined) {
      fields.push('year = ?');
      values.push(book.year);
    }
    if (book.description !== undefined) {
      fields.push('description = ?');
      values.push(book.description);
    }

    if (fields.length === 0) return bookDb.getById(id);

    values.push(id);
    db.prepare(`UPDATE books SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return bookDb.getById(id);
  },

  delete: (id: number): boolean => {
    const result = db.prepare('DELETE FROM books WHERE id = ?').run(id);
    return result.changes > 0;
  },

  count: (options?: { search?: string; author?: string; year?: number }): number => {
    let query = 'SELECT COUNT(*) as count FROM books WHERE 1=1';
    const params: any[] = [];

    if (options?.search) {
      query += ` AND (title LIKE ? OR author LIKE ?)`;
      params.push(`%${options.search}%`, `%${options.search}%`);
    }

    if (options?.author) {
      query += ` AND author LIKE ?`;
      params.push(`%${options.author}%`);
    }

    if (options?.year) {
      query += ` AND year = ?`;
      params.push(options.year);
    }

    const result = db.prepare(query).get(...params) as { count: number };
    return result.count;
  },
};

// Borrowing operations
export const borrowingDb = {
  borrow: (bookId: number, borrowerName: string): Borrowing => {
    const stmt = db.prepare(`
      INSERT INTO borrowings (book_id, borrower_name)
      VALUES (?, ?)
    `);
    const result = stmt.run(bookId, borrowerName);
    return {
      id: result.lastInsertRowid as number,
      book_id: bookId,
      borrower_name: borrowerName,
      borrowed_at: new Date().toISOString(),
    };
  },

  return: (bookId: number): boolean => {
    const result = db.prepare(`
      UPDATE borrowings
      SET returned_at = CURRENT_TIMESTAMP
      WHERE book_id = ? AND returned_at IS NULL
    `).run(bookId);
    return result.changes > 0;
  },
};

export default db;
