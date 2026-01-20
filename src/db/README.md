# Database Access Layer

Complete data access layer with prepared statements and CRUD operations for the expense-sharing application.

## Overview

This module provides a type-safe, performant database interface using `better-sqlite3` with prepared statements. All operations are synchronous and use SQLite's full power.

## Files

- **`types.ts`** - TypeScript interfaces for all entities
- **`queries.ts`** - DatabaseQueries class with all CRUD operations
- **`index.ts`** - Main exports
- **`example.ts`** - Usage examples

## Setup

```typescript
import Database from 'better-sqlite3';
import { createQueries } from '@/db';

// Initialize
const db = new Database('expenses.db');
const queries = createQueries(db);

// Always close when done
// db.close();
```

## Features

### User Operations
- `createUser(email, name, passwordHash?, googleId?)` - Create user
- `getUserById(id)` - Get user by ID
- `getUserByEmail(email)` - Get user by email
- `getUserByGoogleId(googleId)` - Get user by Google ID
- `updateUser(id, updates)` - Update user fields
- `deleteUser(id)` - Delete user

### Group Operations
- `createGroup(name, description, createdBy)` - Create group
- `getGroupById(id)` - Get group by ID
- `getGroupsByUserId(userId)` - Get all user's groups
- `updateGroup(id, updates)` - Update group
- `deleteGroup(id)` - Delete group

### Group Member Operations
- `addGroupMember(groupId, userId, role?)` - Add member
- `getGroupMembers(groupId)` - Get all members
- `getGroupMember(groupId, userId)` - Get specific member
- `updateGroupMemberRole(id, role)` - Update member role
- `removeGroupMember(groupId, userId)` - Remove member
- `isGroupMember(groupId, userId)` - Check membership

### Expense Operations
- `createExpense(groupId, description, amount, paidBy, category?, date)` - Create expense
- `getExpenseById(id)` - Get expense by ID
- `getExpensesByGroup(groupId, limit?)` - Get group expenses
- `getExpensesByUser(userId)` - Get user's expenses
- `updateExpense(id, updates)` - Update expense
- `deleteExpense(id)` - Delete expense

### Expense Split Operations
- `createExpenseSplit(expenseId, userId, amount, shareType)` - Create split
- `getExpenseSplits(expenseId)` - Get all splits for expense
- `updateExpenseSplit(id, amount)` - Update split
- `deleteExpenseSplit(id)` - Delete split

### Settlement Operations
- `createSettlement(groupId, fromUserId, toUserId, amount, method?, notes?)` - Create settlement
- `getSettlementById(id)` - Get settlement by ID
- `getSettlementsByGroup(groupId)` - Get group settlements
- `getSettlementsByUser(userId)` - Get user's settlements
- `deleteSettlement(id)` - Delete settlement

### Balance Calculations
- `getUserBalanceInGroup(userId, groupId)` - Get user's balance in group
- `getGroupBalances(groupId)` - Get all member balances
- `getAllUserBalances(userId)` - Get balances across all groups

### Aggregate Queries
- `getTotalGroupExpenses(groupId)` - Total group expenses
- `getUserTotalExpenses(userId)` - Total expenses paid by user
- `getRecentExpenses(groupId, limit?)` - Recent expenses
- `getGroupSummary(groupId)` - Complete group summary

### Search & Filter
- `searchExpenses(groupId, searchTerm)` - Search expenses
- `getExpensesByCategory(groupId, category)` - Filter by category
- `getExpensesByDateRange(groupId, startDate, endDate)` - Filter by date

### Batch Operations
- `createExpenseWithSplits(...)` - Create expense with splits
- `settleGroupDebts(groupId)` - Auto-settle balances

### Validation
- `canUserAccessExpense(userId, expenseId)` - Check access
- `canUserAccessGroup(userId, groupId)` - Check access
- `isUserGroupAdmin(userId, groupId)` - Check admin status
- `isUserGroupOwner(userId, groupId)` - Check owner status

### Cleanup
- `deleteAllGroupData(groupId)` - Delete group and all related data

## Data Types

### Balance Calculation
- **Positive net_balance**: User is owed money
- **Negative net_balance**: User owes money

### Share Types
- `equal` - Equal split among members
- `exact` - Exact amount specified
- `percentage` - Percentage-based split

### Roles
- `owner` - Full permissions, can delete
- `admin` - Can manage members and expenses
- `member` - Can add expenses, view data

## Example Usage

```typescript
// Create user
const user = queries.createUser('john@example.com', 'John Doe', 'hash');

// Create group
const group = queries.createGroup('Apartment', 'Rent and utilities', user.id);

// Add member
queries.addGroupMember(group.id, otherUserId, 'member');

// Add expense with splits
const expense = queries.createExpenseWithSplits(
  group.id,
  'Rent',
  1200,
  user.id,
  'Housing',
  '2024-01-01',
  [
    { userId: user.id, amount: 600, shareType: 'equal' },
    { userId: otherUserId, amount: 600, shareType: 'equal' }
  ]
);

// Check balances
const balance = queries.getUserBalanceInGroup(user.id, group.id);
console.log(balance.net_balance); // Positive means owed money

// Settle up
queries.createSettlement(
  group.id,
  otherUserId,
  user.id,
  50,
  'Venmo',
  'Monthly settlement'
);
```

## Performance

- All queries use prepared statements for optimal performance
- Prepared statements are cached and reused
- Synchronous operations for predictable performance
- Supports transactions via db.transaction()

## Security

- Parameterized queries prevent SQL injection
- No string concatenation in queries
- Type-safe TypeScript interfaces
- Input validation recommended at application layer

## Best Practices

1. Always close database connection when done
2. Use transactions for multi-step operations
3. Check permissions before modifications
4. Validate inputs at application layer
5. Use batch operations when possible
