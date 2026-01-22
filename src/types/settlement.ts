import type { CurrencyCode } from './expense';

// Settlement types
export type SettlementStatus = 'pending' | 'completed' | 'cancelled';

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string; // User who owes money
  toUserId: string; // User who is owed money
  amount: number; // Cents
  currency: CurrencyCode;
  status: SettlementStatus;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettlementWithUsers extends Settlement {
  fromUser: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  toUser: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface SettlementPlan {
  groupId: string;
  currency: CurrencyCode;
  settlements: Array<{
    fromUserId: string;
    toUserId: string;
    amount: number;
  }>;
  totalTransactions: number;
  totalAmount: number;
  timestamp: Date;
}

// Settlement DTOs
export interface CreateSettlementInput {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number; // Will be converted to cents
}

export interface UpdateSettlementInput {
  amount?: number;
  status?: SettlementStatus;
}

export interface SettlementSummary {
  totalSettlements: number;
  pendingSettlements: number;
  completedSettlements: number;
  totalAmountSettled: number;
  youOwe: number;
  youAreOwed: number;
}

// Debt graph for settlement calculation
export interface DebtNode {
  userId: string;
  balance: number; // Positive = owed money, negative = owes money
}

export interface DebtEdge {
  from: string; // User ID who owes
  to: string; // User ID who is owed
  amount: number; // Cents
}

export interface DebtGraph {
  nodes: Map<string, DebtNode>;
  edges: DebtEdge[];
}

// Settlement calculation result
export interface SettlementCalculation {
  optimalSettlements: Array<{
    fromUserId: string;
    toUserId: string;
    amount: number;
  }];
  minimizedTransactions: boolean;
  totalAmount: number;
  timestamp: Date;
}

// Settlement validation
export function validateSettlementAmount(amount: number): boolean {
  return amount > 0 && amount <= 100000000; // Max $1,000,000
}

export function validateSettlementUsers(fromUserId: string, toUserId: string): boolean {
  return fromUserId !== toUserId;
}

export function canMarkSettlementPaid(
  userId: string,
  fromUserId: string,
  toUserId: string,
  userRole: 'admin' | 'member'
): boolean {
  // Only the payer (fromUser) or an admin can mark as paid
  return userId === fromUserId || userRole === 'admin';
}

export function canCancelSettlement(
  userId: string,
  fromUserId: string,
  toUserId: string,
  userRole: 'admin' | 'member'
): boolean {
  // Only the payer, payee, or an admin can cancel
  return userId === fromUserId || userId === toUserId || userRole === 'admin';
}

// Settlement algorithms
export interface BalanceSheet {
  [userId: string]: number; // Positive = owed money, negative = owes money
}

/**
 * Simplifies debts to minimize the number of transactions.
 * Uses a greedy algorithm to settle debts efficiently.
 */
export function simplifyDebts(balances: BalanceSheet): Array<{ from: string; to: string; amount: number }> {
  const settlements: Array<{ from: string; to: string; amount: number }> = [];
  const debtors: Array<{ userId: string; amount: number }> = [];
  const creditors: Array<{ userId: string; amount: number }> = [];

  // Separate debtors and creditors
  for (const [userId, balance] of Object.entries(balances)) {
    if (balance < -1) {
      // User owes money (with rounding tolerance)
      debtors.push({ userId, amount: -balance });
    } else if (balance > 1) {
      // User is owed money (with rounding tolerance)
      creditors.push({ userId, amount: balance });
    }
  }

  // Sort by amount (descending) for optimal matching
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  // Match debtors with creditors
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const settlementAmount = Math.min(debtor.amount, creditor.amount);

    if (settlementAmount > 0) {
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: settlementAmount,
      });
    }

    debtor.amount -= settlementAmount;
    creditor.amount -= settlementAmount;

    if (debtor.amount < 1) {
      debtorIndex++;
    }
    if (creditor.amount < 1) {
      creditorIndex++;
    }
  }

  return settlements;
}

/**
 * Calculates individual balances from a list of expenses and existing settlements.
 */
export function calculateBalances(
  expenses: Array<{
    paidBy: string;
    amount: number;
    splits: Array<{ userId: string; amount: number }>;
  }>,
  settlements: Array<{ fromUserId: string; toUserId: string; amount: number; status: string }>
): BalanceSheet {
  const balances: BalanceSheet = {};

  // Initialize balances from expenses
  for (const expense of expenses) {
    // Payer is owed the full amount
    balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;

    // Each debtor owes their split amount
    for (const split of expense.splits) {
      if (split.userId !== expense.paidBy) {
        balances[split.userId] = (balances[split.userId] || 0) - split.amount;
      }
    }
  }

  // Apply completed settlements
  for (const settlement of settlements) {
    if (settlement.status === 'completed') {
      balances[settlement.fromUserId] = (balances[settlement.fromUserId] || 0) + settlement.amount;
      balances[settlement.toUserId] = (balances[settlement.toUserId] || 0) - settlement.amount;
    }
  }

  return balances;
}

/**
 * Generates the optimal settlement plan for a group.
 */
export function generateSettlementPlan(
  expenses: Array<{
    paidBy: string;
    amount: number;
    splits: Array<{ userId: string; amount: number }>;
  }>,
  settlements: Array<{ fromUserId: string; toUserId: string; amount: number; status: string }>,
  groupId: string,
  currency: CurrencyCode
): SettlementPlan {
  const balances = calculateBalances(expenses, settlements);
  const simplifiedDebts = simplifyDebts(balances);

  return {
    groupId,
    currency,
    settlements: simplifiedDebts.map((debt) => ({
      fromUserId: debt.from,
      toUserId: debt.to,
      amount: debt.amount,
    })),
    totalTransactions: simplifiedDebts.length,
    totalAmount: simplifiedDebts.reduce((sum, debt) => sum + debt.amount, 0),
    timestamp: new Date(),
  };
}
