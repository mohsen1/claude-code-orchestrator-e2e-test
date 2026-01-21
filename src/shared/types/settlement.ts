export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number; // Stored in cents (integer)
  status: 'pending' | 'completed';
  createdAt: Date;
  completedAt?: Date | null;
}

export interface Balance {
  userId: string;
  balance: number; // Positive = owed money, Negative = owes money
}

export interface SimplifiedDebt {
  from: string; // User ID who owes
  to: string; // User ID who is owed
  amount: number; // Amount in cents (integer)
}

export interface SettlementPlan {
  groupId: string;
  debts: SimplifiedDebt[];
  totalAmount: number; // Total unsettled amount in cents
  createdAt: Date;
}

export type CreateSettlementInput = {
  fromUserId: string;
  toUserId: string;
  amount: number; // In cents (integer)
  groupId: string;
};

export type UpdateSettlementInput = {
  status: Settlement['status'];
};
