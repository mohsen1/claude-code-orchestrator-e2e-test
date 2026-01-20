import Database from 'better-sqlite3';

export interface Balance {
  id: string;
  group_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  currency: string;
  updated_at: string;
}

export interface UserBalance {
  user_id: string;
  user_name: string;
  user_email: string;
  owes: number;
  owed: number;
  net_balance: number;
}

/**
 * Database error wrapper
 */
function handleDatabaseError(operation: string, error: unknown): never {
  if (error instanceof Error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error(`Duplicate entry for ${operation}`);
    }
    throw new Error(`Database error during ${operation}: ${error.message}`);
  }
  throw new Error(`Unknown error during ${operation}`);
}

/**
 * Get balance between two users in a group
 */
export function getBalance(db: Database.Database, groupId: string, fromUserId: string, toUserId: string): Balance | null {
  try {
    const stmt = db.prepare(`
      SELECT * FROM balances
      WHERE group_id = ? AND from_user_id = ? AND to_user_id = ?
      LIMIT 1
    `);

    const balance = stmt.get(groupId, fromUserId, toUserId) as Balance | undefined;
    return balance || null;
  } catch (error) {
    handleDatabaseError('getBalance', error);
  }
}

/**
 * Get all balances for a group
 */
export function getGroupBalances(db: Database.Database, groupId: string): Balance[] {
  try {
    const stmt = db.prepare(`
      SELECT * FROM balances
      WHERE group_id = ?
      ORDER BY amount DESC
    `);

    return stmt.all(groupId) as Balance[];
  } catch (error) {
    handleDatabaseError('getGroupBalances', error);
  }
}

/**
 * Get balances for a specific user in a group
 */
export function getUserBalancesInGroup(db: Database.Database, groupId: string, userId: string): Balance[] {
  try {
    const stmt = db.prepare(`
      SELECT * FROM balances
      WHERE group_id = ? AND (from_user_id = ? OR to_user_id = ?)
      ORDER BY amount DESC
    `);

    return stmt.all(groupId, userId, userId) as Balance[];
  } catch (error) {
    handleDatabaseError('getUserBalancesInGroup', error);
  }
}

/**
 * Calculate net balance summary for all users in a group
 */
export function getGroupBalanceSummary(db: Database.Database, groupId: string): UserBalance[] {
  try {
    // Get all members of the group
    const membersStmt = db.prepare(`
      SELECT DISTINCT u.id, u.name, u.email
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
    `);

    const members = membersStmt.all(groupId) as Array<{ id: string; name: string; email: string }>;

    const summary: UserBalance[] = members.map(member => {
      // Calculate total amount this user owes others
      const owesStmt = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM balances
        WHERE group_id = ? AND from_user_id = ?
      `);
      const owesResult = owesStmt.get(groupId, member.id) as { total: number };

      // Calculate total amount others owe this user
      const owedStmt = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM balances
        WHERE group_id = ? AND to_user_id = ?
      `);
      const owedResult = owedStmt.get(groupId, member.id) as { total: number };

      return {
        user_id: member.id,
        user_name: member.name,
        user_email: member.email,
        owes: owesResult.total,
        owed: owedResult.total,
        net_balance: owedResult.total - owesResult.total,
      };
    });

    return summary;
  } catch (error) {
    handleDatabaseError('getGroupBalanceSummary', error);
  }
}

/**
 * Create or update a balance record
 */
export function upsertBalance(db: Database.Database, input: {
  group_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  currency?: string;
}): Balance {
  try {
    const now = new Date().toISOString();
    const existing = getBalance(db, input.group_id, input.from_user_id, input.to_user_id);

    if (existing) {
      // Update existing balance
      const stmt = db.prepare(`
        UPDATE balances
        SET amount = ?, currency = ?, updated_at = ?
        WHERE id = ?
      `);

      stmt.run(input.amount, input.currency || 'USD', now, existing.id);

      return {
        ...existing,
        amount: input.amount,
        currency: input.currency || 'USD',
        updated_at: now,
      };
    } else {
      // Create new balance
      const id = crypto.randomUUID();

      const stmt = db.prepare(`
        INSERT INTO balances (id, group_id, from_user_id, to_user_id, amount, currency, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        input.group_id,
        input.from_user_id,
        input.to_user_id,
        input.amount,
        input.currency || 'USD',
        now
      );

      return {
        id,
        group_id: input.group_id,
        from_user_id: input.from_user_id,
        to_user_id: input.to_user_id,
        amount: input.amount,
        currency: input.currency || 'USD',
        updated_at: now,
      };
    }
  } catch (error) {
    handleDatabaseError('upsertBalance', error);
  }
}

/**
 * Add amount to a balance
 */
export function addToBalance(db: Database.Database, groupId: string, fromUserId: string, toUserId: string, amountToAdd: number, currency?: string): Balance {
  try {
    const existing = getBalance(db, groupId, fromUserId, toUserId);
    const newAmount = (existing?.amount || 0) + amountToAdd;

    return upsertBalance(db, {
      group_id: groupId,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      amount: newAmount,
      currency: currency || existing?.currency || 'USD',
    });
  } catch (error) {
    handleDatabaseError('addToBalance', error);
  }
}

/**
 * Subtract amount from a balance
 */
export function subtractFromBalance(db: Database.Database, groupId: string, fromUserId: string, toUserId: string, amountToSubtract: number, currency?: string): Balance {
  try {
    const existing = getBalance(db, groupId, fromUserId, toUserId);
    const newAmount = Math.max(0, (existing?.amount || 0) - amountToSubtract);

    return upsertBalance(db, {
      group_id: groupId,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      amount: newAmount,
      currency: currency || existing?.currency || 'USD',
    });
  } catch (error) {
    handleDatabaseError('subtractFromBalance', error);
  }
}

/**
 * Delete balance by ID
 */
export function deleteBalance(db: Database.Database, balanceId: string): boolean {
  try {
    const stmt = db.prepare('DELETE FROM balances WHERE id = ?');
    const result = stmt.run(balanceId);
    return result.changes > 0;
  } catch (error) {
    handleDatabaseError('deleteBalance', error);
  }
}

/**
 * Delete all balances for a group
 */
export function deleteGroupBalances(db: Database.Database, groupId: string): number {
  try {
    const stmt = db.prepare('DELETE FROM balances WHERE group_id = ?');
    const result = stmt.run(groupId);
    return result.changes;
  } catch (error) {
    handleDatabaseError('deleteGroupBalances', error);
  }
}

/**
 * Recalculate all balances for a group based on expenses
 * This is a heavy operation that should be used sparingly
 */
export function recalculateGroupBalances(db: Database.Database, groupId: string): Balance[] {
  try {
    // Clear existing balances
    deleteGroupBalances(db, groupId);

    // Get all expenses with splits for the group
    const expensesStmt = db.prepare(`
      SELECT e.*, es.user_id as split_user_id, es.amount as split_amount
      FROM expenses e
      JOIN expense_splits es ON e.id = es.expense_id
      WHERE e.group_id = ?
    `);

    const expenses = expensesStmt.all(groupId) as Array<{
      id: string;
      paid_by: string;
      amount: number;
      currency: string;
      split_user_id: string;
      split_amount: number;
    }>;

    // Calculate and create balances
    const balanceMap = new Map<string, number>();

    for (const expense of expenses) {
      if (expense.paid_by !== expense.split_user_id) {
        const key = `${expense.split_user_id}->${expense.paid_by}`;
        balanceMap.set(key, (balanceMap.get(key) || 0) + expense.split_amount);
      }
    }

    const balances: Balance[] = [];

    for (const [key, amount] of balanceMap.entries()) {
      if (amount > 0) {
        const [fromUserId, toUserId] = key.split('->');
        const balance = upsertBalance(db, {
          group_id: groupId,
          from_user_id: fromUserId,
          to_user_id: toUserId,
          amount,
          currency: expenses[0]?.currency || 'USD',
        });
        balances.push(balance);
      }
    }

    return balances;
  } catch (error) {
    handleDatabaseError('recalculateGroupBalances', error);
  }
}
