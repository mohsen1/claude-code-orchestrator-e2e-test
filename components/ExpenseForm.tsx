'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ExpenseFormProps {
  groupId: string
  members: Array<{ id: number; name: string; email: string }>
  currentUserId: number
  onExpenseAdded?: () => void
}

export default function ExpenseForm({ groupId, members, currentUserId, onExpenseAdded }: ExpenseFormProps) {
  const router = useRouter()
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(currentUserId.toString())
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal')
  const [customSplits, setCustomSplits] = useState<Record<number, string>>({})
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set(members.map(m => m.id)))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleMemberToggle = (memberId: number) => {
    const newSelected = new Set(selectedMembers)
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId)
    } else {
      newSelected.add(memberId)
    }
    setSelectedMembers(newSelected)
  }

  const handleCustomSplitChange = (memberId: number, value: string) => {
    setCustomSplits(prev => ({ ...prev, [memberId]: value }))
  }

  const validateCustomSplits = (): boolean => {
    const totalAmount = parseFloat(amount)
    if (isNaN(totalAmount) || totalAmount <= 0) return false

    let splitsTotal = 0
    selectedMembers.forEach(memberId => {
      const splitAmount = parseFloat(customSplits[memberId] || '0')
      splitsTotal += splitAmount
    })

    // Allow small rounding errors
    return Math.abs(splitsTotal - totalAmount) < 0.01
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!description.trim()) {
      setError('Description is required')
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (selectedMembers.size === 0) {
      setError('Please select at least one member to split with')
      return
    }

    if (splitType === 'custom' && !validateCustomSplits()) {
      setError('Custom splits must equal the total amount')
      return
    }

    setLoading(true)

    try {
      const splits: Array<{ user_id: number; amount: number }> = []

      if (splitType === 'equal') {
        const splitAmount = amountNum / selectedMembers.size
        selectedMembers.forEach(memberId => {
          splits.push({ user_id: memberId, amount: splitAmount })
        })
      } else {
        selectedMembers.forEach(memberId => {
          const splitAmount = parseFloat(customSplits[memberId] || '0')
          splits.push({ user_id: memberId, amount: splitAmount })
        })
      }

      const response = await fetch(`/api/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          amount: amountNum,
          paid_by: parseInt(paidBy),
          splits,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add expense')
      }

      // Reset form
      setDescription('')
      setAmount('')
      setCustomSplits({})
      setSelectedMembers(new Set(members.map(m => m.id)))

      if (onExpenseAdded) {
        onExpenseAdded()
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Add Expense</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Dinner at restaurant"
            required
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount ($)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700 mb-1">
            Paid by
          </label>
          <select
            id="paidBy"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Split Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="equal"
                checked={splitType === 'equal'}
                onChange={(e) => setSplitType(e.target.value as 'equal' | 'custom')}
                className="mr-2"
              />
              Equal Split
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="custom"
                checked={splitType === 'custom'}
                onChange={(e) => setSplitType(e.target.value as 'equal' | 'custom')}
                className="mr-2"
              />
              Custom Amounts
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Split with
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <label className="flex items-center flex-1">
                  <input
                    type="checkbox"
                    checked={selectedMembers.has(member.id)}
                    onChange={() => handleMemberToggle(member.id)}
                    className="mr-2"
                  />
                  <span>{member.name}</span>
                </label>
                {splitType === 'custom' && selectedMembers.has(member.id) && (
                  <input
                    type="number"
                    value={customSplits[member.id] || ''}
                    onChange={(e) => handleCustomSplitChange(member.id, e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="0.00"
                  />
                )}
              </div>
            ))}
          </div>
          {splitType === 'custom' && amount && (
            <p className="text-sm text-gray-600 mt-2">
              Total splits: ${selectedMembers.toArray().reduce((sum, id) =>
                sum + parseFloat(customSplits[id] || '0'), 0
              ).toFixed(2)} / ${parseFloat(amount).toFixed(2)}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding Expense...' : 'Add Expense'}
        </button>
      </form>
    </div>
  )
}
