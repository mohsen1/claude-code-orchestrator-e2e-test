import Database from 'better-sqlite3';
import { getDatabase } from './index';

export interface ExpenseSplit {
  id: number;
  expense_id: number;
  user_id: number;
  amount: number;
  percentage?: number;
  created_at: string;
}

export interface CreateExpenseSplitInput {
  expense_id: number;
  user_id: number;
  amount: number;
  percentage?: number;
}

/**
 * Create a new expense split
 */
export function createExpenseSplit(input: CreateExpenseSplitInput): ExpenseSplit {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO expense_splits (expense_id, user_id, amount, percentage)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(
    input.expense_id,
    input.user_id,
    input.amount,
    input.percentage || null
  );

  const split = getExpenseSplitById(result.lastInsertRowid as number);
  if (!split) {
    throw new Error('Failed to create expense split');
  }

  return split;
}

/**
 * Get expense split by ID
 */
export function getExpenseSplitById(id: number): ExpenseSplit | null {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM expense_splits WHERE id = ?
  `);

  return stmt.get(id) as ExpenseSplit | null;
}

/**
 * Get all splits for a specific expense
 */
export function getExpenseSplitsByExpenseId(expenseId: number): Array<ExpenseSplit & { user_name: string; user_email: string }> {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      es.*,
      u.name as user_name,
      u.email as user_email
    FROM expense_splits es
    JOIN users u ON es.user_id = u.id
    WHERE es.expense_id = ?
    ORDER BY es.amount DESC
  `);

  return stmt.all(expenseId) as Array<ExpenseSplit & { user_name: string; user_email: string }>;
}

/**
 * Get all splits for a specific group
 */
export function getExpenseSplitsByGroupId(groupId: number): Array<ExpenseSplit & {
  expense_id: number
  expense_description: string
  expense_date: string
  payer_id: number
  payer_name: string
}> {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      es.*,
      es.expense_id,
      e.description as expense_description,
      e.expense_date,
      e.payer_id,
      payer.name as payer_name
    FROM expense_splits es
    JOIN expenses e ON es.expense_id = e.id
    JOIN users payer ON e.payer_id = payer.id
    WHERE e.group_id = ?
    ORDER BY e.expense_date DESC, e.created_at DESC
  `);

  return stmt.all(groupId) as Array<ExpenseSplit & {
    expense_id: number
    expense_description: string
    expense_date: string
    payer_id: number
    payer_name: string
  }>;
}

/**
 * Calculate balances for all users in a group
 * Returns array of { user_id, user_name, user_email, balance }
 * Positive balance = user is owed money
 * Negative balance = user owes money
 */
export function getBalancesForGroup(groupId: number): Array<{
  user_id: number;
  user_name: string;
  user_email: string;
  balance: number;
  total_paid: number;
  total_owed: number;
}> {
  const db = getDatabase();

  // Get all members of the group
  const membersStmt = db.prepare(`
    SELECT u.id, u.name, u.email
    FROM users u
    JOIN group_members gm ON u.id = gm.user_id
    WHERE gm.group_id = ?
  `);

  const members = membersStmt.all(groupId) as Array<{ id: number; name: string; email: string }>;

  const balances = members.map(member => {
    // Calculate total paid by this user
    const paidStmt = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE group_id = ? AND payer_id = ?
    `);
    const paidResult = paidStmt.get(groupId, member.id) as { total: number };
    const totalPaid = paidResult.total;

    // Calculate total owed by this user (their share of expenses)
    const owedStmt = db.prepare(`
      SELECT COALESCE(SUM(es.amount), 0) as total
      FROM expense_splits es
      JOIN expenses e ON es.expense_id = e.id
      WHERE e.group_id = ? AND es.user_id = ?
    `);
    const owedResult = owedStmt.get(groupId, member.id) as { total: number };
    const totalOwed = owedResult.total;

    const balance = totalPaid - totalOwed;

    return {
      user_id: member.id,
      user_name: member.name,
      user_email: member.email,
      balance,
      total_paid: totalPaid,
      total_owed: totalOwed,
    };
  });

  return balances;
}

/**
 * Get detailed breakdown of who owes whom in a group
 * Simplified debt calculation to minimize transactions
 */
export function getDebtsForGroup(groupId: number): Array<{
  from_user_id: number;
  from_user_name: string;
  to_user_id: number;
  to_user_name: string;
  amount: number;
}> {
  const balances = getBalancesForGroup(groupId);

  // Separate into creditors (positive balance) and debtors (negative balance)
  const creditors = balances.filter(b => b.balance > 0);
  const debtors = balances.filter(b => b.balance < 0);

  const debts: Array<{
    from_user_id: number;
    from_user_name: string;
    to_user_id: number;
    to_user_name: string;
    amount: number;
  }> = [];

  // Match debtors to creditors
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const amount = Math.min(-debtor.balance, creditor.balance);

    if (amount > 0.01) { // Only include significant amounts
      debts.push({
        from_user_id: debtor.user_id,
        from_user_name: debtor.user_name,
        to_user_id: creditor.user_id,
        to_user_name: creditor.user_name,
        amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
      });
    }

    // Update balances
    debtor.balance += amount;
    creditor.balance -= amount;

    // Move to next debtor or creditor if their balance is settled
    if (Math.abs(debtor.balance) < 0.01) {
      debtorIndex++;
    }
    if (creditor.balance < 0.01) {
      creditorIndex++;
    }
  }

  return debts;
}

/**
 * Create expense splits for an expense with equal split among group members
 */
export function createEqualSplitsForExpense(
  expenseId: number,
  groupId: number,
  excludeUserId?: number
): ExpenseSplit[] {
  const db = getDatabase();

  // Get the expense
  const expenseStmt = db.prepare(`
    SELECT amount FROM expenses WHERE id = ?
  `);
  const expense = expenseStmt.get(expenseId) as { amount: number } | undefined;

  if (!expense) {
    throw new Error('Expense not found');
  }

  // Get group members (optionally exclude one user, like the payer)
  let memberQuery = `
    SELECT user_id FROM group_members
    WHERE group_id = ?
  `;

  const memberParams: any[] = [groupId];

  if (excludeUserId) {
    memberQuery += ' AND user_id != ?';
    memberParams.push(excludeUserId);
  }

  const membersStmt = db.prepare(memberQuery);
  const members = membersStmt.all(...memberParams) as Array<{ user_id: number }>;

  if (members.length === 0) {
    throw new Error('No members to split expense with');
  }

  // Calculate equal split
  const splitAmount = expense.amount / members.length;

  // Create splits
  const splits: ExpenseSplit[] = [];
  for (const member of members) {
    const split = createExpenseSplit({
      expense_id: expenseId,
      user_id: member.user_id,
      amount: Math.round(splitAmount * 100) / 100, // Round to 2 decimal places
      percentage: 100 / members.length,
    });
    splits.push(split);
  }

  return splits;
}

/**
 * Delete all splits for an expense
 */
export function deleteExpenseSplits(expenseId: number): boolean {
  const db = getDatabase();

  const stmt = db.prepare(`
    DELETE FROM expense_splits WHERE expense_id = ?
  `);

  const result = stmt.run(expenseId);
  return result.changes > 0;
}

/**
 * Update an expense split
 */
export function updateExpenseSplit(
  id: number,
  updates: Partial<Omit<CreateExpenseSplitInput, 'expense_id'>>
): ExpenseSplit | null {
  const db = getDatabase();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.amount !== undefined) {
    fields.push('amount = ?');
    values.push(updates.amount);
  }

  if (updates.percentage !== undefined) {
    fields.push('percentage = ?');
    values.push(updates.percentage);
  }

  if (updates.user_id !== undefined) {
    fields.push('user_id = ?');
    values.push(updates.user_id);
  }

  if (fields.length === 0) {
    return getExpenseSplitById(id);
  }

  const stmt = db.prepare(`
    UPDATE expense_splits
    SET ${fields.join(', ')}
    WHERE id = ?
  `);

  values.push(id);
  stmt.run(...values);

  return getExpenseSplitById(id);
}
