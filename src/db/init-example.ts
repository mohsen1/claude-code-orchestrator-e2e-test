// Database initialization examples

import Database from 'better-sqlite3';
import {
  createQueries,
  initializeSchema,
  createDatabaseWithPath,
  createInMemoryDatabase,
  resetDatabase,
  getDatabaseInfo,
  backupDatabase,
  vacuumDatabase
} from './index';

// ============================================
// INITIALIZATION METHODS
// ============================================

// Method 1: Create database with schema (recommended for production)
const db = createDatabaseWithPath('./expenses.db');
const queries = createQueries(db);

// Method 2: Create in-memory database (for testing)
const memoryDb = createInMemoryDatabase();
const memoryQueries = createQueries(memoryDb);

// Method 3: Manual initialization
const manualDb = new Database('./custom-expenses.db');
initializeSchema(manualDb);
const manualQueries = createQueries(manualDb);

// ============================================
// DATABASE INFORMATION
// ============================================

// Get database information
const info = getDatabaseInfo(db);
console.log('Database Info:', {
  version: info.version,
  tables: info.tables,
  indexes: info.indexes
});

// ============================================
// BACKUP AND MAINTENANCE
// ============================================

// Backup database
backupDatabase(db, './backup/expenses-backup.db');

// Optimize database (run periodically)
vacuumDatabase(db);

// Reset database (WARNING: deletes all data)
// resetDatabase(db);

// ============================================
// USING TRANSACTIONS
// ============================================

// Example: Create expense with splits in a transaction
function createExpenseWithSplitsTransaction(
  groupId: number,
  description: string,
  amount: number,
  paidBy: number,
  splits: Array<{ userId: number; amount: number; shareType: 'equal' | 'exact' | 'percentage' }>
) {
  const transaction = db.transaction(() => {
    const expense = queries.createExpense(groupId, description, amount, paidBy, null, new Date().toISOString().split('T')[0]);

    for (const split of splits) {
      queries.createExpenseSplit(expense.id, split.userId, split.amount, split.shareType);
    }

    return expense;
  });

  return transaction();
}

// Example: Bulk insert users
function bulkCreateUsers(users: Array<{ email: string; name: string; password_hash?: string }>) {
  const transaction = db.transaction(() => {
    return users.map(user =>
      queries.createUser(user.email, user.name, user.password_hash)
    );
  });

  return transaction();
}

// Example: Settle all debts atomically
function settleAllDebtsAtomically(groupId: number) {
  const transaction = db.transaction(() => {
    const settlements = queries.settleGroupDebts(groupId);
    const balances = queries.getGroupBalances(groupId);

    return { settlements, balances };
  });

  return transaction();
}

// ============================================
// ERROR HANDLING
// ============================================

// Example: Safe database operation with error handling
function safeCreateGroup(name: string, description: string, userId: number) {
  try {
    const group = queries.createGroup(name, description, userId);
    return { success: true, data: group };
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific SQLite errors
      if (error.message.includes('UNIQUE constraint')) {
        return { success: false, error: 'Duplicate entry' };
      }
      if (error.message.includes('FOREIGN KEY constraint')) {
        return { success: false, error: 'Invalid reference' };
      }
    }
    return { success: false, error: 'Unknown error' };
  }
}

// ============================================
// CLEANUP
// ============================================

// Always close connections when done
process.on('exit', () => {
  db.close();
  memoryDb.close();
  manualDb.close();
});

// Or use explicit cleanup
function cleanup() {
  db.close();
  memoryDb.close();
  manualDb.close();
}

// ============================================
// TESTING EXAMPLE
// ============================================

// Create a test database with sample data
function createTestDatabase() {
  const testDb = createInMemoryDatabase();
  const testQueries = createQueries(testDb);

  // Create test users
  const user1 = testQueries.createUser('user1@test.com', 'Alice', 'hash1');
  const user2 = testQueries.createUser('user2@test.com', 'Bob', 'hash2');
  const user3 = testQueries.createUser('user3@test.com', 'Charlie', 'hash3');

  // Create test group
  const group = testQueries.createGroup('Test Group', 'A test expense group', user1.id);
  testQueries.addGroupMember(group.id, user2.id, 'member');
  testQueries.addGroupMember(group.id, user3.id, 'member');

  // Add test expenses
  const expense1 = testQueries.createExpenseWithSplits(
    group.id,
    'Pizza',
    30,
    user1.id,
    'Food',
    '2024-01-01',
    [
      { userId: user1.id, amount: 10, shareType: 'equal' },
      { userId: user2.id, amount: 10, shareType: 'equal' },
      { userId: user3.id, amount: 10, shareType: 'equal' }
    ]
  );

  const expense2 = testQueries.createExpenseWithSplits(
    group.id,
    'Movie tickets',
    45,
    user2.id,
    'Entertainment',
    '2024-01-02',
    [
      { userId: user1.id, amount: 15, shareType: 'equal' },
      { userId: user2.id, amount: 15, shareType: 'equal' },
      { userId: user3.id, amount: 15, shareType: 'equal' }
    ]
  );

  // Check balances
  const balances = testQueries.getGroupBalances(group.id);
  console.log('Test balances:', balances);

  // Settle up
  const settlements = testQueries.settleGroupDebts(group.id);
  console.log('Test settlements:', settlements);

  return { testDb, testQueries, user1, user2, user3, group };
}

// Run test database
// const testData = createTestDatabase();

export {
  db,
  queries,
  memoryDb,
  memoryQueries,
  manualDb,
  manualQueries,
  createExpenseWithSplitsTransaction,
  bulkCreateUsers,
  settleAllDebtsAtomically,
  safeCreateGroup,
  createTestDatabase,
  cleanup
};
