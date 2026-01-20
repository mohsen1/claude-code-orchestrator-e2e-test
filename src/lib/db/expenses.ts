import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'data', 'expenses.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export interface Expense {
  id: number;
  group_id: number;
  description: string;
  amount: number;
  currency: string;
  paid_by: number;
  category?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseParticipant {
  id: number;
  expense_id: number;
  user_id: number;
  amount_owed: number;
  amount_paid: number;
}

export interface ExpenseWithParticipants extends Expense {
  participants: ExpenseParticipant[];
}

export interface CreateExpenseInput {
  group_id: number;
  description: string;
  amount: number;
  currency?: string;
  paid_by: number;
  category?: string;
  date?: string;
  participant_ids: number[];
}

export interface UpdateExpenseInput {
  description?: string;
  amount?: number;
  currency?: string;
  category?: string;
  date?: string;
}

/**
 * Create a new expense with participants
 */
export function createExpense(input: CreateExpenseInput): ExpenseWithParticipants {
  const {
    group_id,
    description,
    amount,
    currency = 'USD',
    paid_by,
    category,
    date = new Date().toISOString(),
    participant_ids,
  } = input;

  // Calculate equal split
  const amountPerPerson = amount / participant_ids.length;

  // Start transaction
  const createExpense = db.prepare(`
    INSERT INTO expenses (group_id, description, amount, currency, paid_by, category, date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const createParticipant = db.prepare(`
    INSERT INTO expense_participants (expense_id, user_id, amount_owed, amount_paid)
    VALUES (?, ?, ?, 0)
  `);

  const insertMany = db.transaction((expense) => {
    const result = createExpense.run(
      expense.group_id,
      expense.description,
      expense.amount,
      expense.currency,
      expense.paid_by,
      expense.category,
      expense.date
    );

    const expenseId = result.lastInsertRowid as number;

    // Add participants
    expense.participant_ids.forEach((userId) => {
      createParticipant.run(expenseId, userId, amountPerPerson);
    });

    return expenseId;
  });

  const expenseId = insertMany({
    group_id,
    description,
    amount,
    currency,
    paid_by,
    category,
    date,
    participant_ids,
  });

  return getExpenseById(expenseId)!;
}

/**
 * Get expense by ID with participants
 */
export function getExpenseById(id: number): ExpenseWithParticipants | null {
  const expense = db
    .prepare('SELECT * FROM expenses WHERE id = ?')
    .get(id) as Expense | undefined;

  if (!expense) {
    return null;
  }

  const participants = db
    .prepare('SELECT * FROM expense_participants WHERE expense_id = ?')
    .all(id) as ExpenseParticipant[];

  return {
    ...expense,
    participants,
  };
}

/**
 * Get all expenses for a group
 */
export function getExpensesByGroupId(groupId: number): ExpenseWithParticipants[] {
  const expenses = db
    .prepare('SELECT * FROM expenses WHERE group_id = ? ORDER BY date DESC')
    .all(groupId) as Expense[];

  return expenses.map((expense) => {
    const participants = db
      .prepare('SELECT * FROM expense_participants WHERE expense_id = ?')
      .all(expense.id) as ExpenseParticipant[];

    return {
      ...expense,
      participants,
    };
  });
}

/**
 * Get expenses paid by a user
 */
export function getExpensesByUserId(userId: number): ExpenseWithParticipants[] {
  const expenses = db
    .prepare('SELECT * FROM expenses WHERE paid_by = ? ORDER BY date DESC')
    .all(userId) as Expense[];

  return expenses.map((expense) => {
    const participants = db
      .prepare('SELECT * FROM expense_participants WHERE expense_id = ?')
      .all(expense.id) as ExpenseParticipant[];

    return {
      ...expense,
      participants,
    };
  });
}

/**
 * Update an expense
 */
export function updateExpense(
  id: number,
  input: UpdateExpenseInput
): ExpenseWithParticipants | null {
  const existing = getExpenseById(id);
  if (!existing) {
    return null;
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (input.description !== undefined) {
    updates.push('description = ?');
    values.push(input.description);
  }
  if (input.amount !== undefined) {
    updates.push('amount = ?');
    values.push(input.amount);
  }
  if (input.currency !== undefined) {
    updates.push('currency = ?');
    values.push(input.currency);
  }
  if (input.category !== undefined) {
    updates.push('category = ?');
    values.push(input.category);
  }
  if (input.date !== undefined) {
    updates.push('date = ?');
    values.push(input.date);
  }

  if (updates.length === 0) {
    return existing;
  }

  updates.push('updated_at = datetime("now")');
  values.push(id);

  const query = `UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`;
  db.prepare(query).run(...values);

  // If amount changed, redistribute to participants
  if (input.amount !== undefined) {
    const amountPerPerson = input.amount / existing.participants.length;
    db.prepare('UPDATE expense_participants SET amount_owed = ? WHERE expense_id = ?').run(
      amountPerPerson,
      id
    );
  }

  return getExpenseById(id);
}

/**
 * Delete an expense
 */
export function deleteExpense(id: number): boolean {
  const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  return result.changes > 0;
}

/**
 * Get balance summary for a group
 */
export interface UserBalance {
  user_id: number;
  total_owed: number;
  total_paid: number;
  balance: number;
}

export function getGroupBalance(groupId: number): UserBalance[] {
  // Get all unique users in the group's expenses
  const users = db
    .prepare(`
      SELECT DISTINCT paid_by as user_id FROM expenses WHERE group_id = ?
      UNION
      SELECT DISTINCT user_id FROM expense_participants
      WHERE expense_id IN (SELECT id FROM expenses WHERE group_id = ?)
    `)
    .all(groupId, groupId) as { user_id: number }[];

  return users.map(({ user_id }) => {
    // Total amount this user paid (expenses they created)
    const paidResult = db
      .prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE paid_by = ? AND group_id = ?')
      .get(user_id, groupId) as { total: number };

    // Total amount this user owes (from being a participant)
    const owedResult = db
      .prepare(`
        SELECT COALESCE(SUM(ep.amount_owed), 0) as total
        FROM expense_participants ep
        JOIN expenses e ON ep.expense_id = e.id
        WHERE ep.user_id = ? AND e.group_id = ?
      `)
      .get(user_id, groupId) as { total: number };

    const totalPaid = paidResult.total;
    const totalOwed = owedResult.total;
    const balance = totalPaid - totalOwed;

    return {
      user_id,
      total_owed: totalOwed,
      total_paid: totalPaid,
      balance,
    };
  });
}

/**
 * Settle up a payment between users in a group
 */
export interface Settlement {
  id: number;
  group_id: number;
  from_user_id: number;
  to_user_id: number;
  amount: number;
  date: string;
  created_at: string;
}

export function createSettlement(
  groupId: number,
  fromUserId: number,
  toUserId: number,
  amount: number
): Settlement {
  const stmt = db.prepare(`
    INSERT INTO settlements (group_id, from_user_id, to_user_id, amount, date)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(groupId, fromUserId, toUserId, amount, new Date().toISOString());

  return {
    id: result.lastInsertRowid as number,
    group_id: groupId,
    from_user_id: fromUserId,
    to_user_id: toUserId,
    amount,
    date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
}

/**
 * Get all settlements for a group
 */
export function getSettlementsByGroupId(groupId: number): Settlement[] {
  return db
    .prepare('SELECT * FROM settlements WHERE group_id = ? ORDER BY date DESC')
    .all(groupId) as Settlement[];
}

/**
 * Get settlements for a specific user
 */
export function getSettlementsByUserId(userId: number): Settlement[] {
  return db
    .prepare(`
      SELECT * FROM settlements
      WHERE from_user_id = ? OR to_user_id = ?
      ORDER BY date DESC
    `)
    .all(userId, userId) as Settlement[];
}

/**
 * Calculate suggested settlements for a group
 * Returns a list of who should pay whom to settle all debts
 */
export interface SuggestedSettlement {
  from_user_id: number;
  to_user_id: number;
  amount: number;
}

export function calculateSuggestedSettlements(groupId: number): SuggestedSettlement[] {
  const balances = getGroupBalance(groupId);

  // Separate debtors and creditors
  const debtors: Array<{ user_id: number; balance: number }> = [];
  const creditors: Array<{ user_id: number; balance: number }> = [];

  balances.forEach((b) => {
    if (b.balance < 0) {
      debtors.push({ user_id: b.user_id, balance: Math.abs(b.balance) });
    } else if (b.balance > 0) {
      creditors.push({ user_id: b.user_id, balance: b.balance });
    }
  });

  const settlements: SuggestedSettlement[] = [];

  // Match debtors with creditors
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const amount = Math.min(debtor.balance, creditor.balance);

    if (amount > 0.01) {
      // Only add settlement if amount is significant
      settlements.push({
        from_user_id: debtor.user_id,
        to_user_id: creditor.user_id,
        amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
      });
    }

    debtor.balance -= amount;
    creditor.balance -= amount;

    if (debtor.balance < 0.01) {
      debtorIndex++;
    }
    if (creditor.balance < 0.01) {
      creditorIndex++;
    }
  }

  return settlements;
}

export default db;
