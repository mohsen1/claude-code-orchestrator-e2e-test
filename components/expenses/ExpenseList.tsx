"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, User, Calendar, DollarSign } from "lucide-react"

export interface Expense {
  id: string
  description: string
  amount: number
  date: string
  paidBy: {
    id: string
    name: string
    email: string
  }
  splitAmong: {
    id: string
    name: string
    email: string
  }[]
}

interface ExpenseListProps {
  groupId: string
  expenses: Expense[]
  onDelete?: (expenseId: string) => void
}

export function ExpenseList({ groupId, expenses, onDelete }: ExpenseListProps) {
  const [localExpenses, setLocalExpenses] = useState<Expense[]>(expenses)

  useEffect(() => {
    setLocalExpenses(expenses)
  }, [expenses])

  const handleDelete = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return
    }

    try {
      const response = await fetch(`/api/groups/${groupId}/expenses/${expenseId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete expense")
      }

      setLocalExpenses(localExpenses.filter((exp) => exp.id !== expenseId))
      onDelete?.(expenseId)
    } catch (error) {
      console.error("Error deleting expense:", error)
      alert("Failed to delete expense. Please try again.")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (localExpenses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">No expenses yet</p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Add your first expense to get started
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {localExpenses.map((expense) => (
        <Card key={expense.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{expense.description}</h3>
                  <Badge variant="secondary" className="font-semibold">
                    {formatCurrency(expense.amount)}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Paid by {expense.paidBy.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(expense.date)}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Split among:</p>
                  <div className="flex flex-wrap gap-2">
                    {expense.splitAmong.map((member) => (
                      <Badge key={member.id} variant="outline" className="text-xs">
                        {member.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">
                    Each person pays:{" "}
                    <span className="text-primary">
                      {formatCurrency(expense.amount / expense.splitAmong.length)}
                    </span>
                  </p>
                </div>
              </div>

              {onDelete && (
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="ml-4 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  aria-label="Delete expense"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
