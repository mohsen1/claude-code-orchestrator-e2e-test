/**
 * Common types used across the application
 */

export type UserRole = "admin" | "member";

export type Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "JPY" | "INR";

export type SplitType = "EQUAL" | "CUSTOM";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  currency: string;
  createdBy: string;
  createdAt: Date;
}

export interface GroupMember {
  groupId: string;
  userId: string;
  role: UserRole;
  joinedAt: Date;
}

export interface Expense {
  id: string;
  groupId: string;
  payerId: string;
  amount: number; // Stored in cents
  description: string;
  date: Date;
  createdAt: Date;
}

export interface ExpenseSplit {
  expenseId: string;
  userId: string;
  amount: number; // Stored in cents
}

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number; // Stored in cents
  notes?: string | null;
  date: Date;
  createdAt: Date;
}

export interface ExpenseWithSplits extends Expense {
  splits: Array<ExpenseSplit & { user: Pick<User, "id" | "name" | "image"> }>;
  payer: Pick<User, "id" | "name" | "image">>;
}

export interface GroupWithMembers extends Group {
  members: Array<GroupMember & { user: User }>;
}

export interface NetBalance {
  userId: string;
  userName: string;
  balance: number; // Positive = owed money, negative = owes money
}

export interface SimplifiedDebt {
  from: User;
  to: User;
  amount: number; // In cents
}

export interface SocketEventData {
  type: "expense_added" | "expense_updated" | "expense_deleted" | "settlement_added";
  groupId: string;
  data: unknown;
}
