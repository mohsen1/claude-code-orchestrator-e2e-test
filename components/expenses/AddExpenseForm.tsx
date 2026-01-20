"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, DollarSign } from "lucide-react"

interface GroupMember {
  id: string
  name: string
  email: string
}

interface AddExpenseFormProps {
  groupId: string
  members: GroupMember[]
  currentUserId: string
  onExpenseAdded?: () => void
}

export function AddExpenseForm({
  groupId,
  members,
  currentUserId,
  onExpenseAdded,
}: AddExpenseFormProps) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [paidById, setPaidById] = useState(currentUserId)
  const [splitAmong, setSplitAmong] = useState<string[]>(members.map((m) => m.id))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim() || !amount || parseFloat(amount) <= 0) {
      alert("Please fill in all required fields")
      return
    }

    if (splitAmong.length === 0) {
      alert("Please select at least one person to split the expense with")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/groups/${groupId}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description.trim(),
          amount: parseFloat(amount),
          paidById,
          splitAmong,
          notes: notes.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add expense")
      }

      // Reset form
      setDescription("")
      setAmount("")
      setNotes("")
      setPaidById(currentUserId)
      setSplitAmong(members.map((m) => m.id))

      onExpenseAdded?.()
    } catch (error) {
      console.error("Error adding expense:", error)
      alert("Failed to add expense. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleSplitMember = (memberId: string) => {
    setSplitAmong((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    )
  }

  const selectAllMembers = () => {
    setSplitAmong(members.map((m) => m.id))
  }

  const clearAllMembers = () => {
    setSplitAmong([])
  }

  const splitAmount = splitAmong.length > 0 ? parseFloat(amount || "0") / splitAmong.length : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Expense
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Input
              id="description"
              placeholder="e.g., Dinner at restaurant"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount (USD) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Paid By */}
          <div className="space-y-2">
            <Label htmlFor="paidBy">
              Paid By <span className="text-destructive">*</span>
            </Label>
            <Select value={paidById} onValueChange={setPaidById} disabled={isSubmitting}>
              <SelectTrigger id="paidBy">
                <SelectValue placeholder="Select who paid" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Split Among */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Split Among <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={selectAllMembers}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearAllMembers}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleSplitMember(member.id)}
                  disabled={isSubmitting}
                  className={`
                    p-3 rounded-lg border-2 text-left transition-all
                    ${
                      splitAmong.includes(member.id)
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/50"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{member.name}</span>
                    <div
                      className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${
                          splitAmong.includes(member.id)
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }
                      `}
                    >
                      {splitAmong.includes(member.id) && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {splitAmong.length > 0 && amount && (
              <p className="text-sm text-muted-foreground mt-2">
                Each person pays:{" "}
                <span className="font-semibold text-foreground">
                  ${splitAmount.toFixed(2)}
                </span>
              </p>
            )}
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !description.trim() || !amount || splitAmong.length === 0}
          >
            {isSubmitting ? "Adding Expense..." : "Add Expense"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
