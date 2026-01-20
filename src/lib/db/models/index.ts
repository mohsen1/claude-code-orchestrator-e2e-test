/**
 * Database models for expense sharing app
 *
 * This module exports all database models and balance calculation utilities.
 *
 * @example
 * ```ts
 * import { ExpenseModel, BalanceModel } from '@/lib/db/models';
 *
 * // Create an expense
 * const expense = await ExpenseModel.create({
 *   groupId: 'group-123',
 *   description: 'Grocery shopping',
 *   amount: 100,
 *   paidBy: 'user-123',
 * });
 *
 * // Get group balances
 * const balances = await BalanceModel.calculateGroupBalances('group-123');
 * ```
 */

export { ExpenseModel } from './expense';
export { ExpenseSplitModel } from './expense-split';
export { BalanceModel } from './balances';

export type {
  CreateExpenseInput,
  UpdateExpenseInput,
} from './expense';

export type {
  CreateExpenseSplitInput,
  UpdateExpenseSplitInput,
} from './expense-split';

export type {
  UserBalance,
  GroupBalanceSummary,
  DebtRelationship,
} from './balances';
