import { getDatabaseClient } from './client';
import { v4 as uuidv4 } from 'uuid';

export async function createExampleData() {
  const dbClient = getDatabaseClient();
  const db = dbClient.getDatabase();

  const userId1 = uuidv4();
  const userId2 = uuidv4();
  const userId3 = uuidv4();
  const groupId = uuidv4();

  dbClient.transaction((db) => {
    const userStmt = db.prepare(
      'INSERT INTO users (id, email, name) VALUES (?, ?, ?)'
    );

    userStmt.run(userId1, 'alice@example.com', 'Alice');
    userStmt.run(userId2, 'bob@example.com', 'Bob');
    userStmt.run(userId3, 'charlie@example.com', 'Charlie');

    const groupStmt = db.prepare(
      'INSERT INTO groups (id, name, description, created_by) VALUES (?, ?, ?, ?)'
    );
    groupStmt.run(groupId, 'Roommate Expenses', 'Shared apartment costs', userId1);

    const memberStmt = db.prepare(
      'INSERT INTO group_members (id, group_id, user_id) VALUES (?, ?, ?)'
    );
    memberStmt.run(uuidv4(), groupId, userId1);
    memberStmt.run(uuidv4(), groupId, userId2);
    memberStmt.run(uuidv4(), groupId, userId3);

    const expenseId = uuidv4();
    const expenseStmt = db.prepare(
      'INSERT INTO expenses (id, group_id, description, amount, paid_by) VALUES (?, ?, ?, ?, ?)'
    );
    expenseStmt.run(expenseId, groupId, 'Groceries', 150.00, userId1);

    const splitStmt = db.prepare(
      'INSERT INTO expense_splits (id, expense_id, user_id, amount, percentage) VALUES (?, ?, ?, ?, ?)'
    );
    const splitAmount = 150.00 / 3;
    splitStmt.run(uuidv4(), expenseId, userId1, splitAmount, 33.33);
    splitStmt.run(uuidv4(), expenseId, userId2, splitAmount, 33.33);
    splitStmt.run(uuidv4(), expenseId, userId3, splitAmount, 33.34);
  });

  console.log('Example data created successfully');
}

export function getGroupBalances(groupId: string) {
  const db = getDatabaseClient().getDatabase();

  const balances = db.prepare(`
    SELECT
      u.id as user_id,
      u.name as user_name,
      SUM(CASE WHEN e.paid_by = u.id THEN e.amount ELSE 0 END) as paid,
      COALESCE(SUM(es.amount), 0) as owes,
      SUM(CASE WHEN e.paid_by = u.id THEN e.amount ELSE 0 END) - COALESCE(SUM(es.amount), 0) as balance
    FROM users u
    JOIN group_members gm ON u.id = gm.user_id
    LEFT JOIN expenses e ON e.group_id = gm.group_id
    LEFT JOIN expense_splits es ON es.expense_id = e.id AND es.user_id = u.id
    WHERE gm.group_id = ?
    GROUP BY u.id
  `).all(groupId);

  return balances;
}

export function calculateSettlements(groupId: string) {
  const db = getDatabaseClient().getDatabase();

  const balances = db.prepare(`
    SELECT
      user_id,
      SUM(CASE WHEN paid_by = user_id THEN amount ELSE 0 END) - COALESCE(SUM(es.amount), 0) as balance
    FROM (
      SELECT user_id FROM group_members WHERE group_id = ?
    ) members
    LEFT JOIN expenses ON expenses.group_id = ?
    LEFT JOIN expense_splits es ON es.expense_id = expenses.id AND es.user_id = members.user_id
    GROUP BY user_id
  `).all(groupId, groupId) as Array<{ user_id: string; balance: number }>;

  const debtors: Array<{ user_id: string; balance: number }> = [];
  const creditors: Array<{ user_id: string; balance: number }> = [];

  for (const balance of balances) {
    if (balance.balance < -0.01) {
      debtors.push(balance);
    } else if (balance.balance > 0.01) {
      creditors.push(balance);
    }
  }

  const settlements: Array<{
    from: string;
    to: string;
    amount: number;
  }> = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(-debtor.balance, creditor.balance);

    if (amount > 0.01) {
      settlements.push({
        from: debtor.user_id,
        to: creditor.user_id,
        amount: Math.round(amount * 100) / 100,
      });
    }

    debtor.balance += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance) < 0.01) i++;
    if (creditor.balance < 0.01) j++;
  }

  return settlements;
}

export function getUserGroups(userId: string) {
  const db = getDatabaseClient().getDatabase();

  const groups = db.prepare(`
    SELECT
      g.*,
      COUNT(DISTINCT gm.user_id) as member_count
    FROM groups g
    JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = ?
    GROUP BY g.id
  `).all(userId);

  return groups;
}

export function getGroupExpenses(groupId: string, limit = 50) {
  const db = getDatabaseClient().getDatabase();

  const expenses = db.prepare(`
    SELECT
      e.*,
      u.name as paid_by_name,
      u.avatar_url as paid_by_avatar
    FROM expenses e
    JOIN users u ON e.paid_by = u.id
    WHERE e.group_id = ?
    ORDER BY e.expense_date DESC
    LIMIT ?
  `).all(groupId, limit);

  return expenses;
}

export function getExpenseSplits(expenseId: string) {
  const db = getDatabaseClient().getDatabase();

  const splits = db.prepare(`
    SELECT
      es.*,
      u.name as user_name,
      u.avatar_url as user_avatar
    FROM expense_splits es
    JOIN users u ON es.user_id = u.id
    WHERE es.expense_id = ?
  `).all(expenseId);

  return splits;
}

export function createSettlement(
  groupId: string,
  fromUserId: string,
  toUserId: string,
  amount: number
) {
  const dbClient = getDatabaseClient();
  const db = dbClient.getDatabase();

  const settlementId = uuidv4();

  const stmt = db.prepare(`
    INSERT INTO settlements (id, group_id, from_user_id, to_user_id, amount, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `);

  stmt.run(settlementId, groupId, fromUserId, toUserId, amount);

  return settlementId;
}

export function settleUp(settlementId: string) {
  const dbClient = getDatabaseClient();
  const db = dbClient.getDatabase();

  const stmt = db.prepare(`
    UPDATE settlements
    SET status = 'completed', settled_at = strftime('%s', 'now')
    WHERE id = ?
  `);

  stmt.run(settlementId);
}

export function cleanupExpiredSessions() {
  const dbClient = getDatabaseClient();
  const db = dbClient.getDatabase();

  const now = Math.floor(Date.now() / 1000);

  const stmt = db.prepare('DELETE FROM sessions WHERE expires < ?');

  const result = stmt.run(now);

  return result.changes;
}

export function getUserByEmail(email: string) {
  const db = getDatabaseClient().getDatabase();

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  return user;
}

export function getUserGroupsSummary(userId: string) {
  const db = getDatabaseClient().getDatabase();

  const summary = db.prepare(`
    SELECT
      g.id,
      g.name,
      g.currency,
      (
        SELECT SUM(CASE WHEN e.paid_by = ? THEN e.amount ELSE -es.amount END)
        FROM expenses e
        LEFT JOIN expense_splits es ON e.id = es.expense_id AND es.user_id = ?
        WHERE e.group_id = g.id
      ) as my_balance,
      COUNT(DISTINCT gm.user_id) as member_count
    FROM groups g
    JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = ?
    GROUP BY g.id
  `).all(userId, userId, userId);

  return summary;
}
