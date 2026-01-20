'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ExpenseForm from '@/components/ExpenseForm'
import BalanceChart from '@/components/BalanceChart'

interface Member {
  id: number
  name: string
  email: string
}

interface Expense {
  id: number
  description: string
  amount: number
  paid_by: number
  paid_by_name: string
  created_at: string
  splits: Array<{
    user_id: number
    user_name: string
    amount: number
  }>
}

interface Balance {
  from_user: number
  from_user_name: string
  to_user: number
  to_user_name: string
  amount: number
}

interface SettleForm {
  from_user: number
  to_user: number
  amount: number
}

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string

  const [group, setGroup] = useState<any>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showSettleForm, setShowSettleForm] = useState(false)
  const [settleLoading, setSettleLoading] = useState(false)
  const [settleForm, setSettleForm] = useState<SettleForm>({
    from_user: 0,
    to_user: 0,
    amount: 0,
  })

  useEffect(() => {
    fetchData()
  }, [groupId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch current user
      const userRes = await fetch('/api/auth/me')
      if (!userRes.ok) {
        router.push('/login')
        return
      }
      const userData = await userRes.json()
      setCurrentUser(userData.user)

      // Fetch group details
      const groupRes = await fetch(`/api/groups/${groupId}`)
      if (!groupRes.ok) {
        throw new Error('Failed to fetch group')
      }
      const groupData = await groupRes.json()
      setGroup(groupData)
      setMembers(groupData.members || [])

      // Fetch expenses
      const expensesRes = await fetch(`/api/groups/${groupId}/expenses`)
      if (expensesRes.ok) {
        const expensesData = await expensesRes.json()
        setExpenses(expensesData.expenses || [])
      }

      // Fetch balances
      const balancesRes = await fetch(`/api/groups/${groupId}/balances`)
      if (balancesRes.ok) {
        const balancesData = await balancesRes.json()
        setBalances(balancesData.balances || [])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load group data')
    } finally {
      setLoading(false)
    }
  }

  const handleSettleDebt = async (e: React.FormEvent) => {
    e.preventDefault()
    setSettleLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/groups/${groupId}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settleForm),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to settle debt')
      }

      setShowSettleForm(false)
      setSettleForm({ from_user: 0, to_user: 0, amount: 0 })
      fetchData() // Refresh all data
    } catch (err: any) {
      setError(err.message || 'Failed to settle debt')
    } finally {
      setSettleLoading(false)
    }
  }

  const quickSettle = (from_user: number, to_user: number, amount: number) => {
    setSettleForm({ from_user, to_user, amount })
    setShowSettleForm(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading group...</p>
        </div>
      </div>
    )
  }

  if (error && !group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{group?.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {members.length} member{members.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balances */}
            <BalanceChart balances={balances} currentUserId={currentUser?.id} />

            {/* Settlement Actions */}
            {balances.length > 0 && currentUser && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Settle Up</h2>
                <p className="text-gray-600 mb-4">Record a payment to settle a debt.</p>

                <div className="space-y-2">
                  {balances
                    .filter(b =>
                      currentUser &&
                      (b.from_user === currentUser.id || b.to_user === currentUser.id)
                    )
                    .map((balance, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          {balance.to_user === currentUser.id ? (
                            <p>
                              <span className="font-medium">{balance.from_user_name}</span>
                              {' '}owes you{' '}
                              <span className="font-bold text-green-700">
                                ${balance.amount.toFixed(2)}
                              </span>
                            </p>
                          ) : (
                            <p>
                              You owe{' '}
                              <span className="font-medium">{balance.to_user_name}</span>
                              {' '}
                              <span className="font-bold text-red-700">
                                ${balance.amount.toFixed(2)}
                              </span>
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            quickSettle(balance.from_user, balance.to_user, balance.amount)
                          }
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                        >
                          Settle
                        </button>
                      </div>
                    ))}
                </div>

                {balances.filter(b =>
                  currentUser &&
                  (b.from_user === currentUser.id || b.to_user === currentUser.id)
                ).length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    You don't have any pending balances to settle.
                  </p>
                )}

                <button
                  onClick={() => setShowSettleForm(!showSettleForm)}
                  className="w-full mt-4 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  {showSettleForm ? 'Cancel' : 'Record Custom Payment'}
                </button>

                {showSettleForm && (
                  <form onSubmit={handleSettleDebt} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From (who paid)
                      </label>
                      <select
                        value={settleForm.from_user}
                        onChange={(e) =>
                          setSettleForm({ ...settleForm, from_user: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select member</option>
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To (who received payment)
                      </label>
                      <select
                        value={settleForm.to_user}
                        onChange={(e) =>
                          setSettleForm({ ...settleForm, to_user: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select member</option>
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount ($)
                      </label>
                      <input
                        type="number"
                        value={settleForm.amount || ''}
                        onChange={(e) =>
                          setSettleForm({ ...settleForm, amount: parseFloat(e.target.value) || 0 })
                        }
                        step="0.01"
                        min="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={settleLoading}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {settleLoading ? 'Recording...' : 'Record Payment'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Expenses List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Expenses</h2>
                <button
                  onClick={() => setShowExpenseForm(!showExpenseForm)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {showExpenseForm ? 'Cancel' : '+ Add Expense'}
                </button>
              </div>

              {showExpenseForm && currentUser && (
                <div className="mb-6">
                  <ExpenseForm
                    groupId={groupId}
                    members={members}
                    currentUserId={currentUser.id}
                    onExpenseAdded={fetchData}
                  />
                </div>
              )}

              {expenses.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-2">No expenses yet. Add one to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {expense.description}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Paid by <span className="font-medium">{expense.paid_by_name}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(expense.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            ${expense.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {expense.splits && expense.splits.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-2">Split between:</p>
                          <div className="flex flex-wrap gap-2">
                            {expense.splits.map((split) => (
                              <span
                                key={split.user_id}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                              >
                                {split.user_name}: ${split.amount.toFixed(2)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Members */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Members</h2>
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      member.id === currentUser?.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                    {member.id === currentUser?.id && (
                      <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                        You
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Group Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Group Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Expenses</span>
                  <span className="font-semibold">{expenses.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-semibold">
                    ${expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending Balances</span>
                  <span className="font-semibold">{balances.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
