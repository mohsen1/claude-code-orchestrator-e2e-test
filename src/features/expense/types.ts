// Core expense interfaces and types for the expense-sharing application

export interface Expense {
  id: string;
  groupId: string;
  amount: number;
  description: string;
  paidBy: string; // user ID
  splitType: SplitType;
  splits: ExpenseSplit[];
  category?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type SplitType = 'equal' | 'exact' | 'percentage' | 'custom';

export interface ExpenseSplit {
  userId: string;
  amount: number;
  percentage?: number; // for percentage-based splits
}

export interface ExpenseGroup {
  id: string;
  name: string;
  description?: string;
  createdBy: string; // user ID
  members: GroupMember[];
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface Balance {
  userId: string;
  groupId: string;
  amountOwed: number; // positive = owes money, negative = owed money
  lastUpdated: Date;
}

export interface Settlement {
  id: string;
  groupId: string;
  from: string; // user ID who pays
  to: string; // user ID who receives
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
}

export interface ExpenseCreateInput {
  groupId: string;
  amount: number;
  description: string;
  paidBy: string;
  splitType: SplitType;
  splits: Omit<ExpenseSplit, 'amount'>[] & { amount?: number };
  category?: string;
  date?: Date;
}

export interface ExpenseUpdateInput {
  amount?: number;
  description?: string;
  splitType?: SplitType;
  splits?: Omit<ExpenseSplit, 'amount'>[] & { amount?: number };
  category?: string;
}

export interface ExpenseGroupCreateInput {
  name: string;
  description?: string;
  currency?: string;
  memberIds: string[];
}

export interface ExpenseGroupUpdateInput {
  name?: string;
  description?: string;
  currency?: string;
}

// Expense filter types
export interface ExpenseFilter {
  groupId?: string;
  userId?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  paidBy?: string;
  splitType?: SplitType;
  search?: string; // search in description
}

export interface ExpenseQueryOptions {
  filter?: ExpenseFilter;
  sort?: ExpenseSortOptions;
  pagination?: PaginationOptions;
}

export type ExpenseSortField = 'date' | 'amount' | 'description' | 'createdAt';

export type SortOrder = 'asc' | 'desc';

export interface ExpenseSortOptions {
  field: ExpenseSortField;
  order: SortOrder;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedExpenses {
  expenses: Expense[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Balance calculation types
export interface GroupBalanceSummary {
  groupId: string;
  balances: UserBalance[];
  totalExpenses: number;
  totalSettled: number;
  lastUpdated: Date;
}

export interface UserBalance {
  userId: string;
  amountOwed: number;
  amountToReceive: number;
  netBalance: number; // positive = owed money, negative = owes money
}

export interface SettlementSuggestion {
  from: string; // user ID
  to: string; // user ID
  amount: number;
  description: string;
}

// Statistics types
export interface ExpenseStatistics {
  totalExpenses: number;
  totalAmount: number;
  averageExpenseAmount: number;
  expensesByCategory: CategoryStatistics[];
  expensesByUser: UserExpensesStatistics[];
  period: DateRange;
}

export interface CategoryStatistics {
  category: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface UserExpensesStatistics {
  userId: string;
  totalPaid: number;
  totalOwed: number;
  expenseCount: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

// Validation result types
export interface ValidationResult<T = any> {
  isValid: boolean;
  errors: ValidationError[];
  data?: T;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Real-time event types
export interface ExpenseEvent {
  type: 'expense_created' | 'expense_updated' | 'expense_deleted' | 'settlement_created' | 'settlement_completed';
  groupId: string;
  data: Expense | Settlement;
  timestamp: Date;
}

export interface BalanceUpdateEvent {
  type: 'balance_updated';
  groupId: string;
  balances: Balance[];
  timestamp: Date;
}
