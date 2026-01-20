# Database Schema & Migration System

A robust SQLite database system using `better-sqlite3` with migrations, type safety, and CLI utilities.

## Features

- **Migration System**: Version-controlled schema changes with up/down migrations
- **Type Safety**: Full TypeScript interfaces for all tables
- **Foreign Keys**: Cascading deletes and data integrity
- **Performance**: Indexes on commonly queried columns
- **WAL Mode**: Write-Ahead Logging for better concurrency
- **CLI Tools**: Easy database management from command line

## Database Schema

### Core Tables

#### `users`
User accounts and profiles
- `id` (TEXT, PK)
- `email` (TEXT, UNIQUE)
- `name` (TEXT)
- `avatar_url` (TEXT, optional)

#### `groups`
Expense-sharing groups
- `id` (TEXT, PK)
- `name` (TEXT)
- `description` (TEXT, optional)
- `currency` (TEXT, default: 'USD')
- `created_by` (FK → users)

#### `group_members`
Group membership tracking
- `id` (TEXT, PK)
- `group_id` (FK → groups)
- `user_id` (FK → users)
- `joined_at` (INTEGER)

#### `expenses`
Individual expenses
- `id` (TEXT, PK)
- `group_id` (FK → groups)
- `description` (TEXT)
- `amount` (REAL)
- `currency` (TEXT)
- `paid_by` (FK → users)
- `category` (TEXT, optional)
- `expense_date` (INTEGER)

#### `expense_splits`
How expenses are split among members
- `id` (TEXT, PK)
- `expense_id` (FK → expenses)
- `user_id` (FK → users)
- `amount` (REAL)
- `percentage` (REAL)

#### `settlements`
Payment settlements between users
- `id` (TEXT, PK)
- `group_id` (FK → groups)
- `from_user_id` (FK → users)
- `to_user_id` (FK → users)
- `amount` (REAL)
- `status` ('pending' | 'completed')
- `settled_at` (INTEGER, optional)

### NextAuth Tables

#### `accounts`
OAuth account linking
- `id` (TEXT, PK)
- `provider` (TEXT)
- `provider_account_id` (TEXT)
- `user_id` (FK → users)
- OAuth tokens (optional)

#### `sessions`
User sessions
- `id` (TEXT, PK)
- `session_token` (TEXT, UNIQUE)
- `user_id` (FK → users)
- `expires` (INTEGER)

#### `verification_tokens`
Email verification tokens
- `identifier` (TEXT)
- `token` (TEXT, UNIQUE)
- `expires` (INTEGER)

## Usage

### Basic Setup

```typescript
import { initializeDatabase } from '@/db';

// Initialize with migrations
const db = await initializeDatabase();

// Initialize without migrations (fresh schema)
const db = await initializeDatabase(undefined, false);

// Custom database path
const db = await initializeDatabase('./custom/path/app.db');
```

### Direct Database Access

```typescript
import { getDatabaseClient } from '@/db';

const dbClient = getDatabaseClient();
const db = dbClient.getDatabase();

// Query example
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
```

### Transactions

```typescript
import { getDatabaseClient } from '@/db';

const dbClient = getDatabaseClient();

const result = dbClient.transaction((db) => {
  const stmt = db.prepare('INSERT INTO groups (id, name, created_by) VALUES (?, ?, ?)');
  stmt.run(groupId, name, userId);
  return groupId;
});
```

## Migrations

### Creating a Migration

Create a new file in `src/db/migrations/`:

```typescript
// src/db/migrations/002_add_user_preferences.ts
import Database from 'better-sqlite3';

export const version = 2;
export const name = 'add_user_preferences';

export function up(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id TEXT PRIMARY KEY,
      theme TEXT DEFAULT 'light',
      currency TEXT DEFAULT 'USD',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

export function down(db: Database.Database): void {
  db.exec('DROP TABLE IF EXISTS user_preferences');
}
```

### Running Migrations

```bash
# Run pending migrations
npm run db migrate

# Rollback last migration
npm run db rollback

# Rollback multiple migrations
npm run db rollback 3

# Check migration status
npm run db status

# View migration history
npm run db history
```

## CLI Commands

```bash
# Migration commands
npm run db migrate              # Run pending migrations
npm run db rollback [n]         # Rollback N migrations
npm run db status               # Show migration status
npm run db history              # Show migration history
npm run db reset                # Reset database (deletes all data)
npm run db backup [path]        # Create backup

# Examples
npm run db rollback 2
npm run db backup ./backups/before-changes.db
```

## Advanced Usage

### Backup & Restore

```typescript
import { getDatabaseClient } from '@/db';

const dbClient = getDatabaseClient();

// Create backup
dbClient.backup('./backups/backup.db');

// Restore (manual)
const fs = require('fs');
fs.copyFileSync('./backups/backup.db', './data/expense-sharing.db');
```

### Migration Runner API

```typescript
import { getDatabaseClient } from '@/db';

const runner = getDatabaseClient().getMigrationRunner();

// Get current version
const version = runner.getCurrentVersion();

// Get migration status
const status = await runner.status();
console.log(status.current, status.latest, status.pending);

// Run specific migration
await runner.migrate(5);

// Rollback
await runner.rollback(2);

// Get history
const history = runner.getMigrationHistory();
```

## Database Configuration

The database is configured with:

- **WAL Mode**: Better concurrency (Write-Ahead Logging)
- **Foreign Keys**: Enabled with CASCADE deletes
- **Synchronous**: NORMAL mode (performance balance)

## Best Practices

1. **Always use transactions** for multi-step operations
2. **Create migrations** for all schema changes
3. **Test rollback procedures** before deploying
4. **Backup before major changes**
5. **Use parameterized queries** to prevent SQL injection
6. **Close connections** in serverless environments

## Example Queries

```typescript
// Get user's groups
const groups = db.prepare(`
  SELECT g.* FROM groups g
  JOIN group_members gm ON g.id = gm.group_id
  WHERE gm.user_id = ?
`).get(userId);

// Calculate user's balance in a group
const balance = db.prepare(`
  SELECT
    COALESCE(SUM(e.amount), 0) as paid,
    COALESCE(SUM(es.amount), 0) as owes
  FROM expenses e
  LEFT JOIN expense_splits es ON e.id = es.expense_id AND es.user_id = ?
  WHERE e.group_id = ?
`).get(userId, groupId);

// Get pending settlements
const settlements = db.prepare(`
  SELECT s.*, u_from.name as from_name, u_to.name as to_name
  FROM settlements s
  JOIN users u_from ON s.from_user_id = u_from.id
  JOIN users u_to ON s.to_user_id = u_to.id
  WHERE s.group_id = ? AND s.status = 'pending'
`).all(groupId);
```

## Troubleshooting

### Database Locked

```typescript
// Use WAL mode (enabled by default)
db.pragma('journal_mode = WAL');

// Check for long-running transactions
db.pragma('busy_timeout = 5000');
```

### Migration Conflicts

```bash
# Check current status
npm run db status

# Rollback to before conflict
npm run db rollback

# Fix migration, then re-run
npm run db migrate
```

### Performance Issues

```typescript
// Analyze query performance
db.pragma('optimize');

// Check indexes
const indexes = db.prepare(`
  SELECT name FROM sqlite_master
  WHERE type = 'index' AND name LIKE 'idx_%'
`).all();
```

## File Structure

```
src/db/
├── schema.ts              # Schema definitions & types
├── client.ts              # Database client setup
├── index.ts               # Exports
├── migrations/
│   ├── 001_initial_schema.ts
│   ├── 002_*.ts
│   └── migration_runner.ts
└── README.md

data/
└── expense-sharing.db     # SQLite database file (created at runtime)
```
