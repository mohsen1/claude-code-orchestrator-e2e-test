export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
}

export interface Group {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  members: GroupMember[];
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  user: User;
  balance: number;
  joinedAt: Date;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: string;
  paidByUser: User;
  date: Date;
  splits: ExpenseSplit[];
}

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  user: User;
  amount: number;
}

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  fromUser: User;
  toUserId: string;
  toUser: User;
  amount: number;
  createdAt: Date;
}
