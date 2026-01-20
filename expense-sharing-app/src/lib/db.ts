import Database from "better-sqlite3"
import path from "path"

const dbPath = path.join(process.cwd(), "data", "expenses.db")

export const prisma = {
  user: {
    findUnique: async ({ where }: { where: { email?: string } }) => {
      const db = new Database(dbPath)
      const user = db
        .prepare("SELECT * FROM User WHERE email = ?")
        .get(where.email)
      db.close()
      return user
    },
    create: async ({ data }: { data: { email: string; name: string } }) => {
      const db = new Database(dbPath)
      const result = db
        .prepare("INSERT INTO User (email, name) VALUES (?, ?)")
        .run(data.email, data.name)
      const user = db
        .prepare("SELECT * FROM User WHERE id = ?")
        .get(result.lastInsertRowid)
      db.close()
      return user
    },
  },
  session: {
    create: async ({ data }: { data: { userId: string; expires: Date } }) => {
      const db = new Database(dbPath)
      const result = db
        .prepare("INSERT INTO Session (userId, expires) VALUES (?, ?)")
        .run(data.userId, data.expires.toISOString())
      const session = db
        .prepare("SELECT * FROM Session WHERE id = ?")
        .get(result.lastInsertRowid)
      db.close()
      return session
    },
    delete: async ({ where }: { where: { sessionToken: string } }) => {
      const db = new Database(dbPath)
      db.prepare("DELETE FROM Session WHERE sessionToken = ?").run(where.sessionToken)
      db.close()
    },
  },
  account: {
    findMany: async ({ where }: { where: { userId: string } }) => {
      const db = new Database(dbPath)
      const accounts = db
        .prepare("SELECT * FROM Account WHERE userId = ?")
        .all(where.userId)
      db.close()
      return accounts
    },
  },
}

// Initialize database tables
export function initializeDatabase() {
  const db = new Database(dbPath)

  db.exec(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      emailVerified TEXT,
      image TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Session (
      id TEXT PRIMARY KEY,
      sessionToken TEXT UNIQUE NOT NULL,
      userId TEXT NOT NULL,
      expires TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Account (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      providerAccountId TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
      UNIQUE(provider, providerAccountId)
    );

    CREATE TABLE IF NOT EXISTS Group (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      createdBy TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (createdBy) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS GroupMember (
      id TEXT PRIMARY KEY,
      groupId TEXT NOT NULL,
      userId TEXT NOT NULL,
      joinedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (groupId) REFERENCES Group(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
      UNIQUE(groupId, userId)
    );

    CREATE TABLE IF NOT EXISTS Expense (
      id TEXT PRIMARY KEY,
      groupId TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      paidBy TEXT NOT NULL,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (groupId) REFERENCES Group(id) ON DELETE CASCADE,
      FOREIGN KEY (paidBy) REFERENCES User(id)
    );
  `)

  db.close()
}

initializeDatabase()
