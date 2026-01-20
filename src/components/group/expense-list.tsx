'use client';

import { ExpenseCard } from '@/components/group/expense-card';
import { Card, CardContent } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

interface ExpenseSplit {
  userId: string;
  name: string;
  amount: number;
}

interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  date: string;
  splits: ExpenseSplit[];
}

interface ExpenseListProps {
  expenses: Expense[];
  groupId: string;
}

export function ExpenseList({ expenses, groupId }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Receipt className="h-12 w-12 text-slate-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-400 text-center">
            No expenses yet. Add your first expense to start tracking!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedExpenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          groupId={groupId}
        />
      ))}
    </div>
  );
}
