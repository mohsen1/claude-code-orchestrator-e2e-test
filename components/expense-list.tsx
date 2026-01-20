"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Expense {
  id: string
  description: string
  amount: number
  paidBy: string
  paidByName: string
  date: string
  notes?: string
}

interface ExpenseListProps {
  expenses?: Expense[]
}

export function ExpenseList({ expenses = defaultExpenses }: ExpenseListProps) {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Expenses</span>
          <Badge variant="secondary">
            Total: ${totalExpenses.toFixed(2)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No expenses yet. Add your first expense!
            </p>
          ) : (
            expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {expense.paidByName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">
                      Paid by {expense.paidByName} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                    {expense.notes && (
                      <p className="text-sm text-muted-foreground italic">
                        {expense.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">
                    ${expense.amount.toFixed(2)}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Split equally
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Mock data for UI demonstration
const defaultExpenses: Expense[] = [
  {
    id: "1",
    description: "Grocery shopping",
    amount: 150.50,
    paidBy: "user1",
    paidByName: "John Doe",
    date: "2024-01-15",
    notes: "Weekly groceries from Walmart"
  },
  {
    id: "2",
    description: "Electric bill",
    amount: 89.00,
    paidBy: "user2",
    paidByName: "Jane Smith",
    date: "2024-01-14",
  },
  {
    id: "3",
    description: "Internet service",
    amount: 59.99,
    paidBy: "user1",
    paidByName: "John Doe",
    date: "2024-01-13",
    notes: "Monthly fiber internet"
  },
  {
    id: "4",
    description: "Pizza dinner",
    amount: 45.00,
    paidBy: "user3",
    paidByName: "Bob Johnson",
    date: "2024-01-12",
  }
]
