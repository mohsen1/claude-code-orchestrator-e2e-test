import { Server as SocketIOServer } from 'socket.io';
import {
  CreateExpensePayload,
  UpdateExpensePayload,
  DeleteExpensePayload,
  ExpenseData,
  SettleUpPayload,
  SettlementData,
} from '../events';

interface Database {
  prepare(sql: string): Statement;
  exec(sql: string): void;
}

interface Statement {
  run(...params: any[]): { lastInsertRowid: number };
  get(...params: any[]): any;
  all(...params: any[]): any[];
}

export class ExpenseHandler {
  constructor(
    private io: SocketIOServer,
    private db: Database
  ) {}

  /**
   * Handle creating a new expense
   */
  handleCreateExpense(socket: any): void {
    socket.on(
      'create_expense',
      async (payload: CreateExpensePayload) => {
        try {
          const userId = (socket as any).userId;

          // Verify user is a member of the group
          const member = this.db
            .prepare(
              'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?'
            )
            .get(payload.groupId, userId);

          if (!member) {
            socket.emit('error', {
              message: 'You are not a member of this group',
            });
            return;
          }

          // Create the expense
          const result = this.db
            .prepare(
              `INSERT INTO expenses (group_id, description, amount, paid_by, date, category)
               VALUES (?, ?, ?, ?, ?, ?)`
            )
            .run(
              payload.groupId,
              payload.description,
              payload.amount,
              payload.paidBy,
              payload.date.toISOString(),
              payload.category || null
            );

          const expenseId = String(result.lastInsertRowid);

          // Get the created expense with user details
          const expense = this.db
            .prepare(
              `SELECT e.*, u.name as payer_name, u.email as payer_email
               FROM expenses e
               JOIN users u ON e.paid_by = u.id
               WHERE e.id = ?`
            )
            .get(expenseId);

          // Calculate split amount
          const memberCount = this.db
            .prepare('SELECT COUNT(*) as count FROM group_members WHERE group_id = ?')
            .get(payload.groupId).count;

          const splitAmount = Math.round((expense.amount / memberCount) * 100) / 100;

          const expenseData: ExpenseData = {
            id: expense.id,
            groupId: expense.group_id,
            description: expense.description,
            amount: expense.amount,
            paidBy: {
              id: expense.paid_by,
              name: expense.payer_name,
              email: expense.payer_email,
            },
            date: new Date(expense.date),
            category: expense.category,
            splitAmount,
          };

          // Notify all members in the group
          this.io.to(payload.groupId).emit('expense_created', expenseData);

          // Recalculate and send updated balances
          await this.updateAndSendBalances(payload.groupId);

          console.log(`Expense created: ${expenseId} in group ${payload.groupId}`);
        } catch (error) {
          console.error('Error creating expense:', error);
          socket.emit('error', {
            message: 'Failed to create expense',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    );
  }

  /**
   * Handle updating an existing expense
   */
  handleUpdateExpense(socket: any): void {
    socket.on(
      'update_expense',
      async (payload: UpdateExpensePayload) => {
        try {
          const userId = (socket as any).userId;

          // Get the expense and verify permissions
          const expense = this.db
            .prepare('SELECT * FROM expenses WHERE id = ?')
            .get(payload.expenseId);

          if (!expense) {
            socket.emit('error', {
              message: 'Expense not found',
            });
            return;
          }

          // Verify user is a member of the group
          const member = this.db
            .prepare(
              'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?'
            )
            .get(expense.group_id, userId);

          if (!member) {
            socket.emit('error', {
              message: 'You are not a member of this group',
            });
            return;
          }

          // Build update query dynamically
          const updates: string[] = [];
          const values: any[] = [];

          if (payload.description !== undefined) {
            updates.push('description = ?');
            values.push(payload.description);
          }
          if (payload.amount !== undefined) {
            updates.push('amount = ?');
            values.push(payload.amount);
          }
          if (payload.category !== undefined) {
            updates.push('category = ?');
            values.push(payload.category);
          }

          if (updates.length === 0) {
            socket.emit('error', {
              message: 'No fields to update',
            });
            return;
          }

          values.push(payload.expenseId);
          this.db
            .prepare(`UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`)
            .run(...values);

          // Get the updated expense with user details
          const updatedExpense = this.db
            .prepare(
              `SELECT e.*, u.name as payer_name, u.email as payer_email
               FROM expenses e
               JOIN users u ON e.paid_by = u.id
               WHERE e.id = ?`
            )
            .get(payload.expenseId);

          // Calculate split amount
          const memberCount = this.db
            .prepare('SELECT COUNT(*) as count FROM group_members WHERE group_id = ?')
            .get(expense.group_id).count;

          const splitAmount = Math.round((updatedExpense.amount / memberCount) * 100) / 100;

          const expenseData: ExpenseData = {
            id: updatedExpense.id,
            groupId: updatedExpense.group_id,
            description: updatedExpense.description,
            amount: updatedExpense.amount,
            paidBy: {
              id: updatedExpense.paid_by,
              name: updatedExpense.payer_name,
              email: updatedExpense.payer_email,
            },
            date: new Date(updatedExpense.date),
            category: updatedExpense.category,
            splitAmount,
          };

          // Notify all members in the group
          this.io.to(expense.group_id).emit('expense_updated', expenseData);

          // Recalculate and send updated balances
          await this.updateAndSendBalances(expense.group_id);

          console.log(`Expense updated: ${payload.expenseId}`);
        } catch (error) {
          console.error('Error updating expense:', error);
          socket.emit('error', {
            message: 'Failed to update expense',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    );
  }

  /**
   * Handle deleting an expense
   */
  handleDeleteExpense(socket: any): void {
    socket.on(
      'delete_expense',
      async (payload: DeleteExpensePayload) => {
        try {
          const userId = (socket as any).userId;

          // Get the expense and verify permissions
          const expense = this.db
            .prepare('SELECT * FROM expenses WHERE id = ?')
            .get(payload.expenseId);

          if (!expense) {
            socket.emit('error', {
              message: 'Expense not found',
            });
            return;
          }

          // Verify user is a member of the group
          const member = this.db
            .prepare(
              'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?'
            )
            .get(expense.group_id, userId);

          if (!member) {
            socket.emit('error', {
              message: 'You are not a member of this group',
            });
            return;
          }

          const groupId = expense.group_id;

          // Delete the expense
          this.db
            .prepare('DELETE FROM expenses WHERE id = ?')
            .run(payload.expenseId);

          // Notify all members in the group
          this.io.to(groupId).emit('expense_deleted', {
            expenseId: payload.expenseId,
            groupId,
          });

          // Recalculate and send updated balances
          await this.updateAndSendBalances(groupId);

          console.log(`Expense deleted: ${payload.expenseId}`);
        } catch (error) {
          console.error('Error deleting expense:', error);
          socket.emit('error', {
            message: 'Failed to delete expense',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    );
  }

  /**
   * Handle settling up between users
   */
  handleSettleUp(socket: any): void {
    socket.on('settle_up', async (payload: SettleUpPayload) => {
      try {
        const userId = (socket as any).userId;

        // Verify user is a member of the group
        const member = this.db
          .prepare(
            'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?'
          )
          .get(payload.groupId, userId);

        if (!member) {
          socket.emit('error', {
            message: 'You are not a member of this group',
          });
          return;
        }

        // Get user names
        const fromUser = this.db
          .prepare('SELECT name FROM users WHERE id = ?')
          .get(payload.fromUserId);
        const toUser = this.db
          .prepare('SELECT name FROM users WHERE id = ?')
          .get(payload.toUserId);

        if (!fromUser || !toUser) {
          socket.emit('error', {
            message: 'User not found',
          });
          return;
        }

        // Create settlement record
        const result = this.db
          .prepare(
            `INSERT INTO settlements (group_id, from_user_id, to_user_id, amount, created_at)
             VALUES (?, ?, ?, ?, ?)`
          )
          .run(
            payload.groupId,
            payload.fromUserId,
            payload.toUserId,
            payload.amount,
            new Date().toISOString()
          );

        const settlementId = String(result.lastInsertRowid);

        const settlementData: SettlementData = {
          id: settlementId,
          groupId: payload.groupId,
          fromUserId: payload.fromUserId,
          fromUserName: fromUser.name,
          toUserId: payload.toUserId,
          toUserName: toUser.name,
          amount: payload.amount,
          createdAt: new Date(),
        };

        // Notify all members in the group
        this.io.to(payload.groupId).emit('settlement_created', settlementData);

        // Recalculate and send updated balances
        await this.updateAndSendBalances(payload.groupId);

        console.log(
          `Settlement created: ${settlementId} from ${payload.fromUserId} to ${payload.toUserId}`
        );
      } catch (error) {
        console.error('Error settling up:', error);
        socket.emit('error', {
          message: 'Failed to settle up',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });
  }

  /**
   * Recalculate balances and send to all group members
   */
  private async updateAndSendBalances(groupId: string): Promise<void> {
    try {
      const members = this.db
        .prepare(
          `SELECT DISTINCT u.id, u.name
           FROM users u
           INNER JOIN group_members gm ON u.id = gm.user_id
           WHERE gm.group_id = ?`
        )
        .all(groupId);

      const balances: any[] = [];

      for (const member of members) {
        const paid = this.db
          .prepare(
            'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE group_id = ? AND paid_by = ?'
          )
          .get(groupId, member.id);

        const settledAsCreditor = this.db
          .prepare(
            'SELECT COALESCE(SUM(amount), 0) as total FROM settlements WHERE group_id = ? AND to_user_id = ?'
          )
          .get(groupId, member.id);

        const settledAsDebtor = this.db
          .prepare(
            'SELECT COALESCE(SUM(amount), 0) as total FROM settlements WHERE group_id = ? AND from_user_id = ?'
          )
          .get(groupId, member.id);

        const totalExpenses = this.db
          .prepare(
            'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE group_id = ?'
          )
          .get(groupId);

        const memberCount = members.length;
        const share = totalExpenses.total / memberCount;

        // Balance = (paid - share) + (received in settlements - paid in settlements)
        const balance =
          paid.total - share + settledAsCreditor.total - settledAsDebtor.total;

        balances.push({
          userId: member.id,
          userName: member.name,
          balance: Math.round(balance * 100) / 100,
          owes: [],
          owedBy: [],
        });
      }

      // Calculate who owes whom
      const debtors = balances.filter((b) => b.balance < 0);
      const creditors = balances.filter((b) => b.balance > 0);

      for (const debtor of debtors) {
        for (const creditor of creditors) {
          if (debtor.balance < 0 && creditor.balance > 0) {
            const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
            if (amount > 0.01) {
              debtor.owes.push({
                userId: creditor.userId,
                userName: creditor.userName,
                amount: Math.round(amount * 100) / 100,
              });
              creditor.owedBy.push({
                userId: debtor.userId,
                userName: debtor.userName,
                amount: Math.round(amount * 100) / 100,
              });
              debtor.balance += amount;
              creditor.balance -= amount;
            }
          }
        }
      }

      // Send to all members in the group
      this.io.to(groupId).emit('balances_updated', balances);
    } catch (error) {
      console.error('Error updating balances:', error);
    }
  }
}
