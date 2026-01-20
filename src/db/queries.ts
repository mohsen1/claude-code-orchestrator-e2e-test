import Database from 'better-sqlite3';
import {
  User,
  Group,
  GroupMember,
  Expense,
  ExpenseSplit,
  Settlement,
  Balance
} from './types';

export class DatabaseQueries {
  private db: Database.Database;

  constructor(database: Database.Database) {
    this.db = database;
    this.initializePreparedStatements();
  }

  private initializePreparedStatements() {
    // All prepared statements will be initialized as methods
  }

  // ============================================
  // USER OPERATIONS
  // ============================================

  createUser(email: string, name: string, passwordHash?: string, googleId?: string): User {
    const stmt = this.db.prepare(`
      INSERT INTO users (email, name, password_hash, google_id, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);

    const result = stmt.run(email, name, passwordHash || null, googleId || null);
    return this.getUserById(result.lastInsertRowid as number)!;
  }

  getUserById(id: number): User | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  }

  getUserByEmail(email: string): User | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | undefined;
  }

  getUserByGoogleId(googleId: string): User | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE google_id = ?');
    return stmt.get(googleId) as User | undefined;
  }

  updateUser(id: number, updates: Partial<Pick<User, 'name' | 'email' | 'password_hash' | 'avatar_url'>>): User {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.email) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.password_hash) {
      fields.push('password_hash = ?');
      values.push(updates.password_hash);
    }
    if (updates.avatar_url !== undefined) {
      fields.push('avatar_url = ?');
      values.push(updates.avatar_url);
    }

    values.push(id);
    const stmt = this.db.prepare(`
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.getUserById(id)!;
  }

  deleteUser(id: number): void {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id);
  }

  // ============================================
  // GROUP OPERATIONS
  // ============================================

  createGroup(name: string, description: string | null, createdBy: number): Group {
    const stmt = this.db.prepare(`
      INSERT INTO groups (name, description, created_by, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `);

    const result = stmt.run(name, description, createdBy);
    const groupId = result.lastInsertRowid as number;

    // Add creator as first member
    this.addGroupMember(groupId, createdBy, 'owner');

    return this.getGroupById(groupId)!;
  }

  getGroupById(id: number): Group | undefined {
    const stmt = this.db.prepare('SELECT * FROM groups WHERE id = ?');
    return stmt.get(id) as Group | undefined;
  }

  getGroupsByUserId(userId: number): Group[] {
    const stmt = this.db.prepare(`
      SELECT g.* FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ?
      ORDER BY g.created_at DESC
    `);
    return stmt.all(userId) as Group[];
  }

  updateGroup(id: number, updates: Partial<Pick<Group, 'name' | 'description' | 'avatar_url'>>): Group {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.avatar_url !== undefined) {
      fields.push('avatar_url = ?');
      values.push(updates.avatar_url);
    }

    values.push(id);
    const stmt = this.db.prepare(`
      UPDATE groups
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.getGroupById(id)!;
  }

  deleteGroup(id: number): void {
    const stmt = this.db.prepare('DELETE FROM groups WHERE id = ?');
    stmt.run(id);
  }

  // ============================================
  // GROUP MEMBER OPERATIONS
  // ============================================

  addGroupMember(groupId: number, userId: number, role: 'owner' | 'admin' | 'member' = 'member'): GroupMember {
    const stmt = this.db.prepare(`
      INSERT INTO group_members (group_id, user_id, role, joined_at)
      VALUES (?, ?, ?, datetime('now'))
    `);

    const result = stmt.run(groupId, userId, role);
    return this.getGroupMemberById(result.lastInsertRowid as number)!;
  }

  getGroupMemberById(id: number): GroupMember | undefined {
    const stmt = this.db.prepare('SELECT * FROM group_members WHERE id = ?');
    return stmt.get(id) as GroupMember | undefined;
  }

  getGroupMembers(groupId: number): GroupMember[] {
    const stmt = this.db.prepare(`
      SELECT gm.*, u.name, u.email, u.avatar_url
      FROM group_members gm
      INNER JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
      ORDER BY gm.joined_at ASC
    `);
    return stmt.all(groupId) as GroupMember[];
  }

  getGroupMember(groupId: number, userId: number): GroupMember | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM group_members
      WHERE group_id = ? AND user_id = ?
    `);
    return stmt.get(groupId, userId) as GroupMember | undefined;
  }

  updateGroupMemberRole(id: number, role: 'owner' | 'admin' | 'member'): GroupMember {
    const stmt = this.db.prepare('UPDATE group_members SET role = ? WHERE id = ?');
    stmt.run(role, id);
    return this.getGroupMemberById(id)!;
  }

  removeGroupMember(groupId: number, userId: number): void {
    const stmt = this.db.prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?');
    stmt.run(groupId, userId);
  }

  isGroupMember(groupId: number, userId: number): boolean {
    const stmt = this.db.prepare(`
      SELECT 1 FROM group_members
      WHERE group_id = ? AND user_id = ?
    `);
    return !!stmt.get(groupId, userId);
  }

  // ============================================
  // EXPENSE OPERATIONS
  // ============================================

  createExpense(
    groupId: number,
    description: string,
    amount: number,
    paidBy: number,
    category: string | null,
    date: string
  ): Expense {
    const stmt = this.db.prepare(`
      INSERT INTO expenses (group_id, description, amount, paid_by, category, date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    const result = stmt.run(groupId, description, amount, paidBy, category, date);
    return this.getExpenseById(result.lastInsertRowid as number)!;
  }

  getExpenseById(id: number): Expense | undefined {
    const stmt = this.db.prepare('SELECT * FROM expenses WHERE id = ?');
    return stmt.get(id) as Expense | undefined;
  }

  getExpensesByGroup(groupId: number, limit?: number): Expense[] {
    let query = `
      SELECT e.*, u.name as payer_name
      FROM expenses e
      INNER JOIN users u ON e.paid_by = u.id
      WHERE e.group_id = ?
      ORDER BY e.date DESC, e.created_at DESC
    `;

    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    const stmt = this.db.prepare(query);
    return stmt.all(groupId) as Expense[];
  }

  getExpensesByUser(userId: number): Expense[] {
    const stmt = this.db.prepare(`
      SELECT e.*, g.name as group_name
      FROM expenses e
      INNER JOIN groups g ON e.group_id = g.id
      WHERE e.paid_by = ?
      ORDER BY e.date DESC, e.created_at DESC
    `);
    return stmt.all(userId) as Expense[];
  }

  updateExpense(
    id: number,
    updates: Partial<Pick<Expense, 'description' | 'amount' | 'category' | 'date'>>
  ): Expense {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.description) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.amount) {
      fields.push('amount = ?');
      values.push(updates.amount);
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.date) {
      fields.push('date = ?');
      values.push(updates.date);
    }

    values.push(id);
    const stmt = this.db.prepare(`
      UPDATE expenses
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.getExpenseById(id)!;
  }

  deleteExpense(id: number): void {
    const stmt = this.db.prepare('DELETE FROM expenses WHERE id = ?');
    stmt.run(id);
  }

  // ============================================
  // EXPENSE SPLIT OPERATIONS
  // ============================================

  createExpenseSplit(expenseId: number, userId: number, amount: number, shareType: 'equal' | 'exact' | 'percentage'): ExpenseSplit {
    const stmt = this.db.prepare(`
      INSERT INTO expense_splits (expense_id, user_id, amount, share_type)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(expenseId, userId, amount, shareType);
    return this.getExpenseSplitById(result.lastInsertRowid as number)!;
  }

  getExpenseSplitById(id: number): ExpenseSplit | undefined {
    const stmt = this.db.prepare('SELECT * FROM expense_splits WHERE id = ?');
    return stmt.get(id) as ExpenseSplit | undefined;
  }

  getExpenseSplits(expenseId: number): ExpenseSplit[] {
    const stmt = this.db.prepare(`
      SELECT es.*, u.name, u.email
      FROM expense_splits es
      INNER JOIN users u ON es.user_id = u.id
      WHERE es.expense_id = ?
    `);
    return stmt.all(expenseId) as ExpenseSplit[];
  }

  updateExpenseSplit(id: number, amount: number): ExpenseSplit {
    const stmt = this.db.prepare('UPDATE expense_splits SET amount = ? WHERE id = ?');
    stmt.run(amount, id);
    return this.getExpenseSplitById(id)!;
  }

  deleteExpenseSplit(id: number): void {
    const stmt = this.db.prepare('DELETE FROM expense_splits WHERE id = ?');
    stmt.run(id);
  }

  deleteExpenseSplitsByExpense(expenseId: number): void {
    const stmt = this.db.prepare('DELETE FROM expense_splits WHERE expense_id = ?');
    stmt.run(expenseId);
  }

  // ============================================
  // SETTLEMENT OPERATIONS
  // ============================================

  createSettlement(
    groupId: number,
    fromUserId: number,
    toUserId: number,
    amount: number,
    method: string | null,
    notes: string | null
  ): Settlement {
    const stmt = this.db.prepare(`
      INSERT INTO settlements (group_id, from_user_id, to_user_id, amount, method, notes, settled_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    const result = stmt.run(groupId, fromUserId, toUserId, amount, method, notes);
    return this.getSettlementById(result.lastInsertRowid as number)!;
  }

  getSettlementById(id: number): Settlement | undefined {
    const stmt = this.db.prepare('SELECT * FROM settlements WHERE id = ?');
    return stmt.get(id) as Settlement | undefined;
  }

  getSettlementsByGroup(groupId: number): Settlement[] {
    const stmt = this.db.prepare(`
      SELECT s.*,
        u_from.name as from_user_name,
        u_to.name as to_user_name
      FROM settlements s
      INNER JOIN users u_from ON s.from_user_id = u_from.id
      INNER JOIN users u_to ON s.to_user_id = u_to.id
      WHERE s.group_id = ?
      ORDER BY s.settled_at DESC
    `);
    return stmt.all(groupId) as Settlement[];
  }

  getSettlementsByUser(userId: number): Settlement[] {
    const stmt = this.db.prepare(`
      SELECT s.*,
        u_from.name as from_user_name,
        u_to.name as to_user_name,
        g.name as group_name
      FROM settlements s
      INNER JOIN users u_from ON s.from_user_id = u_from.id
      INNER JOIN users u_to ON s.to_user_id = u_to.id
      INNER JOIN groups g ON s.group_id = g.id
      WHERE s.from_user_id = ? OR s.to_user_id = ?
      ORDER BY s.settled_at DESC
    `);
    return stmt.all(userId, userId) as Settlement[];
  }

  deleteSettlement(id: number): void {
    const stmt = this.db.prepare('DELETE FROM settlements WHERE id = ?');
    stmt.run(id);
  }

  // ============================================
  // BALANCE CALCULATIONS
  // ============================================

  getUserBalanceInGroup(userId: number, groupId: number): Balance {
    // Calculate total paid by user
    const paidStmt = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total_paid
      FROM expenses
      WHERE group_id = ? AND paid_by = ?
    `);
    const paidResult = paidStmt.get(groupId, userId) as { total_paid: number };
    const totalPaid = paidResult.total_paid || 0;

    // Calculate total share of user (what they owe)
    const shareStmt = this.db.prepare(`
      SELECT COALESCE(SUM(es.amount), 0) as total_share
      FROM expense_splits es
      INNER JOIN expenses e ON es.expense_id = e.id
      WHERE e.group_id = ? AND es.user_id = ?
    `);
    const shareResult = shareStmt.get(groupId, userId) as { total_share: number };
    const totalShare = shareResult.total_share || 0;

    // Calculate settled amounts
    const receivedStmt = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total_received
      FROM settlements
      WHERE group_id = ? AND to_user_id = ?
    `);
    const receivedResult = receivedStmt.get(groupId, userId) as { total_received: number };
    const totalReceived = receivedResult.total_received || 0;

    const paidStmt2 = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total_paid
      FROM settlements
      WHERE group_id = ? AND from_user_id = ?
    `);
    const paidResult2 = paidStmt2.get(groupId, userId) as { total_paid: number };
    const totalSettledPaid = paidResult2.total_paid || 0;

    const netBalance = totalPaid - totalShare - totalReceived + totalSettledPaid;

    return {
      user_id: userId,
      group_id: groupId,
      total_paid: totalPaid,
      total_owed: totalShare,
      net_balance: netBalance
    };
  }

  getGroupBalances(groupId: number): Balance[] {
    const membersStmt = this.db.prepare('SELECT user_id FROM group_members WHERE group_id = ?');
    const members = membersStmt.all(groupId) as { user_id: number }[];

    return members.map(member => this.getUserBalanceInGroup(member.user_id, groupId));
  }

  getAllUserBalances(userId: number): Balance[] {
    const groupsStmt = this.db.prepare(`
      SELECT group_id FROM group_members WHERE user_id = ?
    `);
    const groups = groupsStmt.all(userId) as { group_id: number }[];

    return groups.map(group => this.getUserBalanceInGroup(userId, group.group_id));
  }

  // ============================================
  // AGGREGATE QUERIES
  // ============================================

  getTotalGroupExpenses(groupId: number): number {
    const stmt = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE group_id = ?
    `);
    const result = stmt.get(groupId) as { total: number };
    return result.total || 0;
  }

  getUserTotalExpenses(userId: number): number {
    const stmt = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE paid_by = ?
    `);
    const result = stmt.get(userId) as { total: number };
    return result.total || 0;
  }

  getRecentExpenses(groupId: number, limit: number = 10): Expense[] {
    return this.getExpensesByGroup(groupId, limit);
  }

  getGroupSummary(groupId: number) {
    const balances = this.getGroupBalances(groupId);
    const totalExpenses = this.getTotalGroupExpenses(groupId);
    const memberCount = balances.length;

    return {
      group_id: groupId,
      total_expenses: totalExpenses,
      member_count: memberCount,
      balances: balances
    };
  }

  // ============================================
  // SEARCH AND FILTER QUERIES
  // ============================================

  searchExpenses(groupId: number, searchTerm: string): Expense[] {
    const stmt = this.db.prepare(`
      SELECT e.*, u.name as payer_name
      FROM expenses e
      INNER JOIN users u ON e.paid_by = u.id
      WHERE e.group_id = ? AND e.description LIKE ?
      ORDER BY e.date DESC
    `);
    return stmt.all(groupId, `%${searchTerm}%`) as Expense[];
  }

  getExpensesByCategory(groupId: number, category: string): Expense[] {
    const stmt = this.db.prepare(`
      SELECT e.*, u.name as payer_name
      FROM expenses e
      INNER JOIN users u ON e.paid_by = u.id
      WHERE e.group_id = ? AND e.category = ?
      ORDER BY e.date DESC
    `);
    return stmt.all(groupId, category) as Expense[];
  }

  getExpensesByDateRange(groupId: number, startDate: string, endDate: string): Expense[] {
    const stmt = this.db.prepare(`
      SELECT e.*, u.name as payer_name
      FROM expenses e
      INNER JOIN users u ON e.paid_by = u.id
      WHERE e.group_id = ? AND e.date BETWEEN ? AND ?
      ORDER BY e.date DESC
    `);
    return stmt.all(groupId, startDate, endDate) as Expense[];
  }

  // ============================================
  // BATCH OPERATIONS
  // ============================================

  createExpenseWithSplits(
    groupId: number,
    description: string,
    amount: number,
    paidBy: number,
    category: string | null,
    date: string,
    splits: Array<{ userId: number; amount: number; shareType: 'equal' | 'exact' | 'percentage' }>
  ): Expense {
    // Create expense
    const expense = this.createExpense(groupId, description, amount, paidBy, category, date);

    // Create splits
    for (const split of splits) {
      this.createExpenseSplit(expense.id, split.userId, split.amount, split.shareType);
    }

    return expense;
  }

  settleGroupDebts(groupId: number): Settlement[] {
    const balances = this.getGroupBalances(groupId);
    const settlements: Settlement[] = [];

    // Separate debtors and creditors
    const debtors: Balance[] = [];
    const creditors: Balance[] = [];

    for (const balance of balances) {
      if (balance.net_balance < 0) {
        debtors.push(balance);
      } else if (balance.net_balance > 0) {
        creditors.push(balance);
      }
    }

    // Match debtors with creditors
    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];

      const amount = Math.min(Math.abs(debtor.net_balance), creditor.net_balance);

      if (amount > 0.01) { // Only settle if amount is significant
        const settlement = this.createSettlement(
          groupId,
          debtor.user_id,
          creditor.user_id,
          Math.round(amount * 100) / 100,
          null,
          'Auto-settled'
        );
        settlements.push(settlement);
      }

      // Update balances
      debtor.net_balance += amount;
      creditor.net_balance -= amount;

      if (Math.abs(debtor.net_balance) < 0.01) debtorIndex++;
      if (creditor.net_balance < 0.01) creditorIndex++;
    }

    return settlements;
  }

  // ============================================
  // VALIDATION QUERIES
  // ============================================

  canUserAccessExpense(userId: number, expenseId: number): boolean {
    const stmt = this.db.prepare(`
      SELECT 1 FROM expenses e
      INNER JOIN group_members gm ON e.group_id = gm.group_id
      WHERE e.id = ? AND gm.user_id = ?
    `);
    return !!stmt.get(expenseId, userId);
  }

  canUserAccessGroup(userId: number, groupId: number): boolean {
    return this.isGroupMember(groupId, userId);
  }

  isUserGroupAdmin(userId: number, groupId: number): boolean {
    const stmt = this.db.prepare(`
      SELECT 1 FROM group_members
      WHERE group_id = ? AND user_id = ? AND role IN ('owner', 'admin')
    `);
    return !!stmt.get(groupId, userId);
  }

  isUserGroupOwner(userId: number, groupId: number): boolean {
    const stmt = this.db.prepare(`
      SELECT 1 FROM group_members
      WHERE group_id = ? AND user_id = ? AND role = 'owner'
    `);
    return !!stmt.get(groupId, userId);
  }

  // ============================================
  // CLEANUP OPERATIONS
  // ============================================

  deleteAllGroupData(groupId: number): void {
    // Delete expense splits
    const deleteSplitsStmt = this.db.prepare(`
      DELETE FROM expense_splits
      WHERE expense_id IN (SELECT id FROM expenses WHERE group_id = ?)
    `);
    deleteSplitsStmt.run(groupId);

    // Delete expenses
    const deleteExpensesStmt = this.db.prepare('DELETE FROM expenses WHERE group_id = ?');
    deleteExpensesStmt.run(groupId);

    // Delete settlements
    const deleteSettlementsStmt = this.db.prepare('DELETE FROM settlements WHERE group_id = ?');
    deleteSettlementsStmt.run(groupId);

    // Delete group members
    const deleteMembersStmt = this.db.prepare('DELETE FROM group_members WHERE group_id = ?');
    deleteMembersStmt.run(groupId);

    // Delete group
    this.deleteGroup(groupId);
  }
}

// Factory function to create queries instance
export function createQueries(db: Database.Database): DatabaseQueries {
  return new DatabaseQueries(db);
}
