import Database from 'better-sqlite3';
import { getDatabase } from './index';

export interface Settlement {
  id: number;
  group_id: number;
  from_user_id: number;
  to_user_id: number;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  paid_at?: string;
}

export interface CreateSettlementInput {
  group_id: number;
  from_user_id: number;
  to_user_id: number;
  amount: number;
}

/**
 * Create a new settlement
 */
export function createSettlement(input: CreateSettlementInput): Settlement {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO settlements (group_id, from_user_id, to_user_id, amount, status)
    VALUES (?, ?, ?, ?, 'pending')
  `);

  const result = stmt.run(
    input.group_id,
    input.from_user_id,
    input.to_user_id,
    input.amount
  );

  const settlement = getSettlementById(result.lastInsertRowid as number);
  if (!settlement) {
    throw new Error('Failed to create settlement');
  }

  return settlement;
}

/**
 * Get settlement by ID
 */
export function getSettlementById(id: number): Settlement | null {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM settlements WHERE id = ?
  `);

  return stmt.get(id) as Settlement | null;
}

/**
 * Get all settlements for a group
 */
export function getSettlementsByGroupId(groupId: number): Array<Settlement & {
  from_user_name: string;
  from_user_email: string;
  to_user_name: string;
  to_user_email: string;
}> {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      s.*,
      from_user.name as from_user_name,
      from_user.email as from_user_email,
      to_user.name as to_user_name,
      to_user.email as to_user_email
    FROM settlements s
    JOIN users from_user ON s.from_user_id = from_user.id
    JOIN users to_user ON s.to_user_id = to_user.id
    WHERE s.group_id = ?
    ORDER BY s.created_at DESC
  `);

  return stmt.all(groupId) as Array<Settlement & {
    from_user_name: string;
    from_user_email: string;
    to_user_name: string;
    to_user_email: string;
  }>;
}

/**
 * Get pending settlements for a group
 */
export function getPendingSettlementsByGroupId(groupId: number): Array<Settlement & {
  from_user_name: string;
  from_user_email: string;
  to_user_name: string;
  to_user_email: string;
}> {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      s.*,
      from_user.name as from_user_name,
      from_user.email as from_user_email,
      to_user.name as to_user_name,
      to_user.email as to_user_email
    FROM settlements s
    JOIN users from_user ON s.from_user_id = from_user.id
    JOIN users to_user ON s.to_user_id = to_user.id
    WHERE s.group_id = ? AND s.status = 'pending'
    ORDER BY s.created_at DESC
  `);

  return stmt.all(groupId) as Array<Settlement & {
    from_user_name: string;
    from_user_email: string;
    to_user_name: string;
    to_user_email: string;
  }>;
}

/**
 * Get all pending settlements for a specific user (where they owe money or are owed)
 */
export function getPendingSettlementsByUserId(userId: number): Array<Settlement & {
  group_name: string;
  from_user_name: string;
  from_user_email: string;
  to_user_name: string;
  to_user_email: string;
}> {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      s.*,
      g.name as group_name,
      from_user.name as from_user_name,
      from_user.email as from_user_email,
      to_user.name as to_user_name,
      to_user.email as to_user_email
    FROM settlements s
    JOIN groups g ON s.group_id = g.id
    JOIN users from_user ON s.from_user_id = from_user.id
    JOIN users to_user ON s.to_user_id = to_user.id
    WHERE (s.from_user_id = ? OR s.to_user_id = ?)
      AND s.status = 'pending'
    ORDER BY s.created_at DESC
  `);

  return stmt.all(userId, userId) as Array<Settlement & {
    group_name: string;
    from_user_name: string;
    from_user_email: string;
    to_user_name: string;
    to_user_email: string;
  }>;
}

/**
 * Mark a settlement as paid
 */
export function markSettlementAsPaid(id: number): Settlement | null {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE settlements
    SET status = 'paid', paid_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(id);

  return getSettlementById(id);
}

/**
 * Cancel a settlement
 */
export function cancelSettlement(id: number): Settlement | null {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE settlements
    SET status = 'cancelled'
    WHERE id = ?
  `);

  stmt.run(id);

  return getSettlementById(id);
}

/**
 * Update settlement amount
 */
export function updateSettlementAmount(id: number, amount: number): Settlement | null {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE settlements
    SET amount = ?
    WHERE id = ? AND status = 'pending'
  `);

  stmt.run(amount, id);

  return getSettlementById(id);
}

/**
 * Delete a settlement (only if pending)
 */
export function deleteSettlement(id: number): boolean {
  const db = getDatabase();

  const stmt = db.prepare(`
    DELETE FROM settlements WHERE id = ? AND status = 'pending'
  `);

  const result = stmt.run(id);
  return result.changes > 0;
}

/**
 * Get total amount a user owes in pending settlements
 */
export function getTotalOwedByUser(userId: number): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM settlements
    WHERE from_user_id = ? AND status = 'pending'
  `);

  const result = stmt.get(userId) as { total: number };
  return result.total;
}

/**
 * Get total amount a user is owed in pending settlements
 */
export function getTotalToReceiveByUser(userId: number): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM settlements
    WHERE to_user_id = ? AND status = 'pending'
  `);

  const result = stmt.get(userId) as { total: number };
  return result.total;
}

/**
 * Get settlements between two users in a group
 */
export function getSettlementsBetweenUsers(
  groupId: number,
  fromUserId: number,
  toUserId: number
): Array<Settlement & {
  from_user_name: string;
  from_user_email: string;
  to_user_name: string;
  to_user_email: string;
}> {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      s.*,
      from_user.name as from_user_name,
      from_user.email as from_user_email,
      to_user.name as to_user_name,
      to_user.email as to_user_email
    FROM settlements s
    JOIN users from_user ON s.from_user_id = from_user.id
    JOIN users to_user ON s.to_user_id = to_user.id
    WHERE s.group_id = ?
      AND s.from_user_id = ?
      AND s.to_user_id = ?
      AND s.status = 'pending'
    ORDER BY s.created_at DESC
  `);

  return stmt.all(groupId, fromUserId, toUserId) as Array<Settlement & {
    from_user_name: string;
    from_user_email: string;
    to_user_name: string;
    to_user_email: string;
  }>;
}

/**
 * Check if a pending settlement already exists between two users
 */
export function hasPendingSettlement(
  groupId: number,
  fromUserId: number,
  toUserId: number
): boolean {
  const settlements = getSettlementsBetweenUsers(groupId, fromUserId, toUserId);
  return settlements.length > 0;
}

/**
 * Auto-create suggested settlements based on group balances
 */
export function createSuggestedSettlements(groupId: number): Settlement[] {
  const { getDebtsForGroup } = require('./expense-splits');
  const debts = getDebtsForGroup(groupId);

  const settlements: Settlement[] = [];

  for (const debt of debts) {
    // Check if a pending settlement already exists for this debt
    const existing = hasPendingSettlement(groupId, debt.from_user_id, debt.to_user_id);

    if (!existing) {
      const settlement = createSettlement({
        group_id: groupId,
        from_user_id: debt.from_user_id,
        to_user_id: debt.to_user_id,
        amount: debt.amount,
      });
      settlements.push(settlement);
    }
  }

  return settlements;
}
