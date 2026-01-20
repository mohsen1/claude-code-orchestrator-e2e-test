export interface User {
  id: string;
  name: string;
  email: string;
}

export interface GroupMember {
  userId: string;
  groupId: string;
  role: 'owner' | 'member';
  joinedAt: Date;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidByUserId: string;
  splitType: 'equal' | 'custom' | 'percentage';
  date: Date;
  createdAt: Date;
}

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amount: number;
  percentage?: number;
}

export interface Payment {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  date: Date;
  createdAt: Date;
}

export interface Balance {
  userId: string;
  groupId: string;
  balance: number;
  totalPaid: number;
  totalOwed: number;
}

export interface Debt {
  fromUserId: string;
  toUserId: string;
  amount: number;
  groupId: string;
}

export interface GroupBalanceSummary {
  groupId: string;
  balances: Map<string, number>; // userId -> balance
  debts: Debt[];
  totalExpenses: number;
  totalPayments: number;
}

export interface ExpenseSplitResult {
  expenseId: string;
  splits: Map<string, number>; // userId -> amount owed
}

export interface UserBalanceDetail {
  user: User;
  balance: number;
  totalPaid: number;
  totalOwed: number;
  owesTo: Array<{ userId: string; userName: string; amount: number }>;
  owedBy: Array<{ userId: string; userName: string; amount: number }>;
}

export interface SettlementSuggestion {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
}

export type SplitType = 'equal' | 'custom' | 'percentage';

export interface SplitConfig {
  type: SplitType;
  splits: Array<{
    userId: string;
    amount?: number;
    percentage?: number;
  }>;
}
