// Example usage of the DatabaseQueries class

import Database from 'better-sqlite3';
import { createQueries } from './queries';
import type { User, Group, Expense } from './types';

// Initialize database connection
const db = new Database('expenses.db');
const queries = createQueries(db);

// ============================================
// USER EXAMPLES
// ============================================

// Create a new user with email/password
const user1: User = queries.createUser(
  'john@example.com',
  'John Doe',
  'hashedpassword123'
);

// Create a new user with Google OAuth
const user2: User = queries.createUser(
  'jane@example.com',
  'Jane Smith',
  undefined,
  'google_12345'
);

// Get user by email
const foundUser = queries.getUserByEmail('john@example.com');

// Update user
queries.updateUser(user1.id, { name: 'John Updated', avatar_url: 'https://example.com/avatar.jpg' });

// ============================================
// GROUP EXAMPLES
// ============================================

// Create a new group
const group: Group = queries.createGroup(
  'Apartment Expenses',
  'Shared apartment expenses for 2024',
  user1.id
);

// Get all groups for a user
const userGroups = queries.getGroupsByUserId(user1.id);

// Add members to the group
queries.addGroupMember(group.id, user2.id, 'member');

// Get all group members
const members = queries.getGroupMembers(group.id);

// Update group
queries.updateGroup(group.id, {
  name: 'Apartment Expenses 2024',
  description: 'Updated description'
});

// ============================================
// EXPENSE EXAMPLES
// ============================================

// Create a new expense
const expense: Expense = queries.createExpense(
  group.id,
  'Monthly Rent',
  1200.00,
  user1.id,
  'Housing',
  '2024-01-01'
);

// Create expense with splits
const expenseWithSplits = queries.createExpenseWithSplits(
  group.id,
  'Groceries',
  150.00,
  user2.id,
  'Food',
  '2024-01-02',
  [
    { userId: user1.id, amount: 75.00, shareType: 'equal' },
    { userId: user2.id, amount: 75.00, shareType: 'equal' }
  ]
);

// Get expenses for a group
const groupExpenses = queries.getExpensesByGroup(group.id);

// Get recent expenses (limited)
const recentExpenses = queries.getRecentExpenses(group.id, 10);

// Search expenses
const searchResults = queries.searchExpenses(group.id, 'Rent');

// Filter by category
const foodExpenses = queries.getExpensesByCategory(group.id, 'Food');

// Filter by date range
const januaryExpenses = queries.getExpensesByDateRange(
  group.id,
  '2024-01-01',
  '2024-01-31'
);

// Update expense
queries.updateExpense(expense.id, {
  description: 'Monthly Rent - Updated',
  amount: 1300.00
});

// ============================================
// BALANCE EXAMPLES
// ============================================

// Get user's balance in a group
const balance = queries.getUserBalanceInGroup(user1.id, group.id);
console.log(`User ${user1.id} balance in group ${group.id}:`, balance.net_balance);

// Get all balances for a group
const groupBalances = queries.getGroupBalances(group.id);

// Get all balances across all user's groups
const allUserBalances = queries.getAllUserBalances(user1.id);

// Get group summary
const summary = queries.getGroupSummary(group.id);
console.log('Group summary:', summary);

// ============================================
// SETTLEMENT EXAMPLES
// ============================================

// Create a manual settlement
const settlement = queries.createSettlement(
  group.id,
  user1.id,
  user2.id,
  50.00,
  'Venmo',
  'Paying back for groceries'
);

// Get settlements for a group
const groupSettlements = queries.getSettlementsByGroup(group.id);

// Get settlements for a user
const userSettlements = queries.getSettlementsByUser(user1.id);

// Auto-settle group debts
const autoSettlements = queries.settleGroupDebts(group.id);

// ============================================
// VALIDATION EXAMPLES
// ============================================

// Check if user is a group member
const isMember = queries.isGroupMember(group.id, user1.id);

// Check if user is an admin
const isAdmin = queries.isUserGroupAdmin(user1.id, group.id);

// Check if user is the owner
const isOwner = queries.isUserGroupOwner(user1.id, group.id);

// Check if user can access an expense
const canAccess = queries.canUserAccessExpense(user1.id, expense.id);

// ============================================
// AGGREGATE QUERIES
// ============================================

// Get total expenses for a group
const totalGroupExpenses = queries.getTotalGroupExpenses(group.id);

// Get total expenses paid by a user
const totalUserExpenses = queries.getUserTotalExpenses(user1.id);

// ============================================
// DELETE OPERATIONS (USE WITH CAUTION)
// ============================================

// Delete a single expense
// queries.deleteExpense(expense.id);

// Remove a group member
// queries.removeGroupMember(group.id, user2.id);

// Delete a group (and all related data)
// queries.deleteAllGroupData(group.id);

// ============================================
// CLEANUP
// ============================================

// Always close the database connection when done
// db.close();

export { queries, db };
