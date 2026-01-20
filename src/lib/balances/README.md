# Balance Calculation Engine

A comprehensive expense-sharing and balance calculation system for tracking group expenses, debts, and payments.

## Features

- **Multiple Split Types**: Support for equal, custom, and percentage-based expense splitting
- **Automatic Balance Calculation**: Track who owes whom with optimal debt minimization
- **Payment Tracking**: Record and validate payments between group members
- **Settlement Suggestions**: Get recommendations for the most efficient way to settle debts
- **Validation**: Comprehensive validation for splits, payments, and debt amounts

## Installation

```bash
npm install
```

## Quick Start

```typescript
import {
  calculateGroupBalances,
  calculateExpenseSplit,
  createExpenseSplitRecords,
  validateSplitConfig
} from '@/lib/balances';

// Calculate group balances
const summary = calculateGroupBalances(
  expenses,
  expenseSplits,
  payments,
  memberIds
);

console.log(summary.balances); // Map<userId, balance>
console.log(summary.debts);    // Optimized debt list
```

## Core Concepts

### Balances

- **Positive balance**: User is owed money (others owe them)
- **Negative balance**: User owes money
- **Zero balance**: User is settled up

Example:
```typescript
// Alice paid $100 for a group of 3 (equal split)
// Alice's balance: +$66.67
// Bob's balance: -$33.33
// Carol's balance: -$33.33
```

### Expense Splitting

Three types of splits are supported:

#### 1. Equal Split (Default)
```typescript
const splitResult = calculateExpenseSplit(
  {
    id: 'expense-1',
    amount: 100,
    paidByUserId: 'user-alice',
    // ... other fields
  },
  ['user-alice', 'user-bob', 'user-carol']
);

// Each person (except payer): $33.33
```

#### 2. Custom Amounts
```typescript
const splitConfig = {
  type: 'custom',
  splits: [
    { userId: 'user-bob', amount: 40 },
    { userId: 'user-carol', amount: 60 }
  ]
};

const splitResult = calculateExpenseSplit(expense, memberIds, splitConfig);
```

#### 3. Percentage-Based
```typescript
const splitConfig = {
  type: 'percentage',
  splits: [
    { userId: 'user-bob', percentage: 40 },
    { userId: 'user-carol', percentage: 60 }
  ]
};

const splitResult = calculateExpenseSplit(expense, memberIds, splitConfig);
```

### Debt Optimization

The engine automatically calculates the optimal way to settle debts, minimizing the number of transactions:

```typescript
const debts = summary.debts;
// [
//   { fromUserId: 'bob', toUserId: 'alice', amount: 33.33 },
//   { fromUserId: 'carol', toUserId: 'alice', amount: 33.33 }
// ]
```

## API Reference

### Balance Calculations

#### `calculateGroupBalances(expenses, expenseSplits, payments, memberIds)`

Calculate complete balance summary for a group.

**Parameters:**
- `expenses`: Array of Expense objects
- `expenseSplits`: Array of ExpenseSplit objects
- `payments`: Array of Payment objects
- `memberIds`: Array of group member user IDs

**Returns:** `GroupBalanceSummary`

```typescript
interface GroupBalanceSummary {
  groupId: string;
  balances: Map<string, number>;  // userId -> balance
  debts: Debt[];
  totalExpenses: number;
  totalPayments: number;
}
```

#### `calculateOptimalDebts(balances)`

Calculate minimal transaction set to settle all debts.

**Parameters:**
- `balances`: Map of userId -> balance

**Returns:** `Debt[]`

#### `calculateUserBalanceDetail(userId, groupId, allUsers, summary)`

Get detailed balance information for a specific user.

**Returns:** `UserBalanceDetail`

```typescript
interface UserBalanceDetail {
  user: User;
  balance: number;
  totalPaid: number;
  totalOwed: number;
  owesTo: Array<{ userId, userName, amount }>;
  owedBy: Array<{ userId, userName, amount }>;
}
```

### Expense Splitting

#### `calculateExpenseSplit(expense, memberIds, splitConfig?)`

Calculate how an expense should be split.

**Parameters:**
- `expense`: Expense object
- `memberIds`: Array of group member IDs
- `splitConfig`: Optional split configuration

**Returns:** `ExpenseSplitResult`

#### `createExpenseSplitRecords(expense, memberIds, splitConfig?)`

Create database-ready expense split records.

**Returns:** `ExpenseSplit[]`

#### `validateSplitConfig(config, totalAmount, memberIds)`

Validate a split configuration before applying.

**Returns:** `{ valid: boolean; error?: string }`

### Debt Management

#### `getUserDebts(userId, summary)`

Get all debts for a specific user.

**Returns:**
```typescript
{
  owes: Debt[];        // Debts user owes to others
  owed: Debt[];        // Debts others owe to user
  totalOwes: number;
  totalOwed: number;
}
```

#### `validatePayment(fromUserId, toUserId, amount, summary)`

Validate a payment before recording.

**Returns:** `{ valid: boolean; error?: string }`

#### `getSettlementSuggestions(summary, userNames)`

Get human-readable settlement suggestions.

**Returns:** Array of settlement suggestions with user names.

#### `createPaymentFromDebt(debt, groupId)`

Create a payment record from a debt.

**Returns:** `Payment`

## Usage Examples

### Example 1: Track Group Expenses

```typescript
import {
  calculateGroupBalances,
  createExpenseSplitRecords
} from '@/lib/balances';

// 1. Create an expense
const expense = {
  id: 'exp-1',
  groupId: 'group-1',
  description: 'Dinner at Restaurant',
  amount: 120,
  paidByUserId: 'user-alice',
  splitType: 'equal',
  date: new Date(),
  createdAt: new Date()
};

// 2. Calculate splits
const memberIds = ['user-alice', 'user-bob', 'user-carol', 'user-dave'];
const splits = createExpenseSplitRecords(expense, memberIds);

// 3. Save to database
await db.expenses.create(expense);
await db.expenseSplits.createMany(splits);

// 4. Calculate updated balances
const allExpenses = await db.expenses.findMany({ groupId: 'group-1' });
const allSplits = await db.expenseSplits.findMany({ groupId: 'group-1' });
const payments = await db.payments.findMany({ groupId: 'group-1' });

const summary = calculateGroupBalances(
  allExpenses,
  allSplits,
  payments,
  memberIds
);

console.log('Balances:', Object.fromEntries(summary.balances));
// Balances: {
//   'user-alice': 90,
//   'user-bob': -30,
//   'user-carol': -30,
//   'user-dave': -30
// }
```

### Example 2: Process a Payment

```typescript
import {
  validatePayment,
  createPaymentFromDebt
} from '@/lib/balances';

// 1. Validate payment
const validation = validatePayment(
  'user-bob',
  'user-alice',
  30,
  summary
);

if (!validation.valid) {
  throw new Error(validation.error);
}

// 2. Create payment record
const debt = summary.debts.find(
  d => d.fromUserId === 'user-bob' && d.toUserId === 'user-alice'
);

const payment = createPaymentFromDebt(debt, 'group-1');

// 3. Save to database
await db.payments.create(payment);

// 4. Recalculate balances
const newSummary = calculateGroupBalances(
  allExpenses,
  allSplits,
  [...payments, payment],
  memberIds
);
```

### Example 3: Custom Split

```typescript
import {
  calculateExpenseSplit,
  validateSplitConfig
} from '@/lib/balances';

const splitConfig = {
  type: 'custom',
  splits: [
    { userId: 'user-bob', amount: 50 },
    { userId: 'user-carol', amount: 30 },
    { userId: 'user-dave', amount: 40 }
  ]
};

// Validate first
const validation = validateSplitConfig(
  splitConfig,
  120, // total expense amount
  memberIds
);

if (!validation.valid) {
  throw new Error(validation.error);
}

// Calculate splits
const expense = { /* ... */ };
const result = calculateExpenseSplit(expense, memberIds, splitConfig);
```

## Data Models

### Expense
```typescript
interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidByUserId: string;
  splitType: 'equal' | 'custom' | 'percentage';
  date: Date;
  createdAt: Date;
}
```

### ExpenseSplit
```typescript
interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amount: number;
  percentage?: number;
}
```

### Payment
```typescript
interface Payment {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  date: Date;
  createdAt: Date;
}
```

### Debt
```typescript
interface Debt {
  fromUserId: string;
  toUserId: string;
  amount: number;
  groupId: string;
}
```

## Testing

```typescript
import {
  calculateGroupBalances,
  calculateExpenseSplit
} from '@/lib/balances';

describe('Balance Calculations', () => {
  test('equal split expense', () => {
    const expense = {
      id: 'exp-1',
      amount: 100,
      paidByUserId: 'alice',
      splitType: 'equal',
      // ... other fields
    };

    const result = calculateExpenseSplit(
      expense,
      ['alice', 'bob', 'carol']
    );

    expect(result.splits.get('bob')).toBe(33.33);
    expect(result.splits.get('carol')).toBe(33.33);
    expect(result.splits.get('alice')).toBe(0);
  });
});
```

## Best Practices

1. **Always validate splits** before applying them to expenses
2. **Use transactions** when saving expenses and splits together
3. **Recalculate balances** after any expense or payment change
4. **Validate payments** against current debts before processing
5. **Handle rounding** - the engine automatically adjusts for penny rounding errors
6. **Use settlement suggestions** to minimize transactions when settling up

## License

MIT
