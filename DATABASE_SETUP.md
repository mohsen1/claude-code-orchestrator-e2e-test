# Database Quick Reference

## Initialization

```typescript
import { initializeDatabase } from '@/db';

// Auto-run migrations on startup
const db = await initializeDatabase();
```

## Common Queries

### Get User
```typescript
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
```

### Create Group
```typescript
const stmt = db.prepare('INSERT INTO groups (id, name, created_by) VALUES (?, ?, ?)');
stmt.run(groupId, name, userId);
```

### Add Group Member
```typescript
const stmt = db.prepare('INSERT INTO group_members (id, group_id, user_id) VALUES (?, ?, ?)');
stmt.run(memberId, groupId, userId);
```

### Create Expense with Splits
```typescript
db.transaction(() => {
  // Create expense
  const expenseStmt = db.prepare(`
    INSERT INTO expenses (id, group_id, description, amount, paid_by)
    VALUES (?, ?, ?, ?, ?)
  `);
  expenseStmt.run(expenseId, groupId, description, amount, paidBy);

  // Create splits
  const splitStmt = db.prepare(`
    INSERT INTO expense_splits (id, expense_id, user_id, amount, percentage)
    VALUES (?, ?, ?, ?, ?)
  `);

  splits.forEach(split => {
    splitStmt.run(uuidv4(), expenseId, split.userId, split.amount, split.percentage);
  });
})();
```

## CLI Commands

```bash
npm run db:migrate      # Run migrations
npm run db:rollback     # Rollback last migration
npm run db:status       # Check status
npm run db:history      # View migration history
npm run db:reset        # Reset database (⚠️ deletes all data)
npm run db:backup       # Create backup
```

## File Locations

- Database: `data/expense-sharing.db` (created at runtime)
- Migrations: `src/db/migrations/`
- Schema: `src/db/schema.ts`
- Client: `src/db/client.ts`
