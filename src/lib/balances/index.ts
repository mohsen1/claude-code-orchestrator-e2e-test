/**
 * Balance Calculation Engine
 *
 * This module provides comprehensive functionality for:
 * - Tracking shared expenses among group members
 * - Calculating who owes whom
 * - Handling various expense splitting methods (equal, custom, percentage)
 * - Managing payments and settlements
 * - Generating balance summaries and debt reports
 *
 * Main exports:
 * - calculateGroupBalances: Core balance calculation
 * - calculateExpenseSplit: Expense splitting logic
 * - calculateOptimalDebts: Minimize transactions for settlement
 * - Various utilities for balances, debts, and payments
 */

// Type definitions
export type {
  User,
  GroupMember,
  Expense,
  ExpenseSplit,
  Payment,
  Balance,
  Debt,
  GroupBalanceSummary,
  ExpenseSplitResult,
  UserBalanceDetail,
  SettlementSuggestion,
  SplitType,
  SplitConfig,
} from './types';

// Balance calculations
export {
  calculateGroupBalances,
  calculateOptimalDebts,
  calculateUserBalanceDetail,
  isGroupSettled,
  getTotalOwedToUser,
  getTotalOwedByUser,
  getSimplifiedBalances,
} from './calculate';

// Expense splitting
export {
  calculateExpenseSplit,
  createExpenseSplitRecords,
  validateSplitConfig,
  getDefaultSplitConfig,
} from './expenses';

// Debt management
export {
  createPaymentFromDebt,
  validatePaymentAmount,
  validatePayment,
  getUserDebts,
  getSettlementSuggestions,
  hasDebt,
  getDebtAmount,
  createPartialPayment,
  calculateRemainingDebt,
  getInvolvedUsers,
  formatDebt,
  canSettleGroup,
  getPaymentHistory,
} from './debts';
