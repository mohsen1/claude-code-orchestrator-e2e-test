import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket } from '../server';
import { SocketEvents, ExpenseCreatedPayload, ExpenseUpdatedPayload, ExpenseDeletedPayload, AckResponse } from '../events';
import { broadcastToGroup } from '../server';

/**
 * Register expense-related event handlers
 */
export function registerExpenseHandlers(io: SocketIOServer, socket: AuthenticatedSocket) {
  // Expense created
  socket.on(
    'expense:create',
    async (data: {
      groupId: string;
      description: string;
      amount: number;
      paidBy: string;
      date: string;
      splitEqually?: boolean;
    }, callback?: (response: AckResponse) => void) => {
      try {
        const userId = socket.data.user.id;
        const { groupId, description, amount, paidBy, date, splitEqually = true } = data;

        // Verify user is member of the group
        if (!socket.data.groups.has(groupId)) {
          throw new Error('User is not a member of this group');
        }

        // TODO: Create expense in database
        // const expense = await createExpense({
        //   groupId,
        //   description,
        //   amount,
        //   paidBy,
        //   date,
        //   createdBy: userId,
        // });

        // Placeholder expense data
        const expense = {
          id: `expense_${Date.now()}`,
          groupId,
          description,
          amount,
          paidBy,
          date,
          createdAt: Date.now(),
        };

        // TODO: Calculate splits based on group members
        // const members = await getGroupMembers(groupId);
        // const splitAmount = amount / members.length;
        // const splits = members.map(member => ({
        //   userId: member.id,
        //   amount: splitAmount,
        // }));

        // Placeholder splits
        const splits = [
          {
            userId: paidBy,
            amount: 0,
          },
        ];

        // TODO: Update balances in database
        // await updateBalances(groupId, expense, splits);

        // Broadcast to all group members
        const payload: ExpenseCreatedPayload = {
          expense,
          splits,
          timestamp: Date.now(),
        };

        broadcastToGroup(io, groupId, SocketEvents.EXPENSE_CREATED, payload);

        // Trigger balance update
        broadcastBalanceUpdate(io, groupId);

        callback?.({
          success: true,
          data: { expense, splits },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create expense';
        callback?.({
          success: false,
          error: message,
        });
      }
    }
  );

  // Expense updated
  socket.on(
    'expense:update',
    async (data: {
      expenseId: string;
      groupId: string;
      description?: string;
      amount?: number;
      paidBy?: string;
      date?: string;
    }, callback?: (response: AckResponse) => void) => {
      try {
        const userId = socket.data.user.id;
        const { expenseId, groupId, description, amount, paidBy, date } = data;

        // Verify user is member of the group
        if (!socket.data.groups.has(groupId)) {
          throw new Error('User is not a member of this group');
        }

        // TODO: Update expense in database
        // const expense = await updateExpense(expenseId, {
        //   description,
        //   amount,
        //   paidBy,
        //   date,
        //   updatedBy: userId,
        // });

        // Placeholder expense data
        const expense = {
          id: expenseId,
          groupId,
          description: description || 'Updated expense',
          amount: amount || 0,
          paidBy: paidBy || userId,
          date: date || new Date().toISOString(),
          updatedAt: Date.now(),
        };

        // TODO: Recalculate splits
        // const splits = await recalculateExpenseSplits(expenseId);

        // Placeholder splits
        const splits = [
          {
            userId: expense.paidBy,
            amount: 0,
          },
        ];

        // TODO: Update balances
        // await updateBalances(groupId, expense, splits);

        // Broadcast to all group members
        const payload: ExpenseUpdatedPayload = {
          expense,
          splits,
          timestamp: Date.now(),
        };

        broadcastToGroup(io, groupId, SocketEvents.EXPENSE_UPDATED, payload);

        // Trigger balance update
        broadcastBalanceUpdate(io, groupId);

        callback?.({
          success: true,
          data: { expense, splits },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update expense';
        callback?.({
          success: false,
          error: message,
        });
      }
    }
  );

  // Expense deleted
  socket.on(
    'expense:delete',
    async (data: { expenseId: string; groupId: string }, callback?: (response: AckResponse) => void) => {
      try {
        const userId = socket.data.user.id;
        const { expenseId, groupId } = data;

        // Verify user is member of the group
        if (!socket.data.groups.has(groupId)) {
          throw new Error('User is not a member of this group');
        }

        // TODO: Delete expense from database
        // await deleteExpense(expenseId);

        // TODO: Recalculate balances
        // await recalculateGroupBalances(groupId);

        // Broadcast to all group members
        const payload: ExpenseDeletedPayload = {
          expenseId,
          groupId,
          timestamp: Date.now(),
        };

        broadcastToGroup(io, groupId, SocketEvents.EXPENSE_DELETED, payload);

        // Trigger balance update
        broadcastBalanceUpdate(io, groupId);

        callback?.({
          success: true,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete expense';
        callback?.({
          success: false,
          error: message,
        });
      }
    }
  );

  // Request expenses for a group
  socket.on(
    'expense:list',
    async (groupId: string, callback?: (response: AckResponse) => void) => {
      try {
        const userId = socket.data.user.id;

        // Verify user is member of the group
        if (!socket.data.groups.has(groupId)) {
          throw new Error('User is not a member of this group');
        }

        // TODO: Fetch expenses from database
        // const expenses = await getGroupExpenses(groupId);

        // Placeholder data
        const expenses = [];

        callback?.({
          success: true,
          data: { expenses },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch expenses';
        callback?.({
          success: false,
          error: message,
        });
      }
    }
  );

  // Request single expense details
  socket.on(
    'expense:get',
    async (data: { expenseId: string; groupId: string }, callback?: (response: AckResponse) => void) => {
      try {
        const userId = socket.data.user.id;
        const { expenseId, groupId } = data;

        // Verify user is member of the group
        if (!socket.data.groups.has(groupId)) {
          throw new Error('User is not a member of this group');
        }

        // TODO: Fetch expense from database
        // const expense = await getExpense(expenseId);
        // const splits = await getExpenseSplits(expenseId);

        // Placeholder data
        const expense = {
          id: expenseId,
          groupId,
          description: 'Sample expense',
          amount: 100,
          paidBy: userId,
          date: new Date().toISOString(),
          createdAt: Date.now(),
        };

        const splits = [
          {
            userId: userId,
            amount: 100,
          },
        ];

        callback?.({
          success: true,
          data: { expense, splits },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch expense';
        callback?.({
          success: false,
          error: message,
        });
      }
    }
  );
}

/**
 * Broadcast balance update to group
 */
async function broadcastBalanceUpdate(io: SocketIOServer, groupId: string) {
  try {
    // TODO: Calculate balances from database
    // const balances = await calculateGroupBalances(groupId);

    // Placeholder balances
    const balances = [];

    io.to(`group:${groupId}`).emit(SocketEvents.BALANCE_UPDATED, {
      groupId,
      balances,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Failed to broadcast balance update:', error);
  }
}
