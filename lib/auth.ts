import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "expenses.db");
const db = new Database(dbPath);

// Create users table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    name TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export interface User {
  id: number;
  email: string;
  name?: string | null;
  image?: string | null;
}

export async function registerUser(
  email: string,
  password: string,
  name?: string
): Promise<User> {
  // Check if user already exists
  const existingUser = getUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const stmt = db.prepare(
    "INSERT INTO users (email, password, name) VALUES (?, ?, ?)"
  );
  const result = stmt.run(email, hashedPassword, name || null);

  return {
    id: result.lastInsertRowid as number,
    email,
    name: name || null,
    image: null,
  };
}

export function getUserByEmail(email: string): User | null {
  const stmt = db.prepare("SELECT id, email, name, image FROM users WHERE email = ?");
  const user = stmt.get(email) as any;
  return user || null;
}

export function getUserById(id: string | number): User | null {
  const stmt = db.prepare("SELECT id, email, name, image FROM users WHERE id = ?");
  const user = stmt.get(typeof id === "string" ? parseInt(id) : id) as any;
  return user || null;
}

export async function verifyPassword(
  email: string,
  password: string
): Promise<User | null> {
  const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
  const user = stmt.get(email) as any;

  if (!user || !user.password) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
  };
}

export function updateUserProfile(
  userId: number,
  data: { name?: string; image?: string }
): void {
  const updates: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    updates.push("name = ?");
    values.push(data.name);
  }
  if (data.image !== undefined) {
    updates.push("image = ?");
    values.push(data.image);
  }

  if (updates.length === 0) return;

  values.push(userId);
  const stmt = db.prepare(
    `UPDATE users SET ${updates.join(", ")} WHERE id = ?`
  );
  stmt.run(...values);
}

export async function createUser(
  email: string,
  password: string | null,
  name?: string,
  image?: string
): Promise<User> {
  const stmt = db.prepare(
    "INSERT INTO users (email, password, name, image) VALUES (?, ?, ?, ?)"
  );
  const result = stmt.run(email, password, name || null, image || null);
  return {
    id: result.lastInsertRowid as number,
    email,
    name,
    image,
  };
}
