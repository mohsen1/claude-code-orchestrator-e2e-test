'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Member {
  id: number
  name: string
  email: string
}

interface Balance {
  from_user: string
  to_user: string
  amount: number
}

interface Expense {
  id: number
  description: string
  amount: number
  paid_by: string
  date: string
}

export default function GroupDetail() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string

  const [group, setGroup] = useState<{ id: number; name: string } | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string } | null>(null)

  useEffect(() => {
    fetchGroupData()
    fetchCurrentUser()
  }, [groupId])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err)
    }
  }

  const fetchGroupData = async () => {
    try {
      setIsLoading(true)

      // Fetch group details
      const groupRes = await fetch(`/api/groups/${groupId}`)
      if (!groupRes.ok) {
        throw new Error('Group not found')
      }
      const groupData = await groupRes.json()
      setGroup(groupData.group)

      // Fetch members
      const membersRes = await fetch(`/api/groups/${groupId}/members`)
      if (membersRes.ok) {
        const membersData = await membersRes.json()
        setMembers(membersData.members || [])
      }

      // Fetch balances
      const balancesRes = await fetch(`/api/groups/${groupId}/balances`)
      if (balancesRes.ok) {
        const balancesData = await balancesRes.json()
        setBalances(balancesData.balances || [])
      }

      // Fetch expenses
      const expensesRes = await fetch(`/api/groups/${groupId}/expenses`)
      if (expensesRes.ok) {
        const expensesData = await expensesRes.json()
        setExpenses(expensesData.expenses || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettleDebt = async (fromUser: string, toUser: string, amount: number) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_user: fromUser, to_user: toUser, amount }),
      })

      if (!response.ok) {
        throw new Error('Failed to settle debt')
      }

      // Refresh balances and expenses
      fetchGroupData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to settle debt')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading group...</p>
        </div>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg">
          {error || 'Group not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-blue-600">{group.name}</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Members Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Members ({members.length})</h2>
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  {currentUser?.id === member.id && (
                    <span className="text-xs text-blue-600 font-medium">You</span>
                  )}
                </div>
              ))}
            </div>

            {/* Add Member Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const email = formData.get('email') as string

                try {
                  const res = await fetch(`/api/groups/${groupId}/members`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                  })

                  if (!res.ok) {
                    const data = await res.json()
                    throw new Error(data.error || 'Failed to add member')
                  }

                  e.currentTarget.reset()
                  fetchGroupData()
                } catch (err) {
                  alert(err instanceof Error ? err.message : 'Failed to add member')
                }
              }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <h3 className="text-sm font-medium text-gray-700 mb-2">Add Member</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter email"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  Add
                </button>
              </div>
            </form>
          </div>

          {/* Balances Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Balances</h2>
            {balances.length === 0 ? (
              <p className="text-gray-500 text-center py-8">All settled up! 🎉</p>
            ) : (
              <div className="space-y-3">
                {balances.map((balance, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-gray-700">
                        <span className="font-medium">{balance.from_user}</span> owes{' '}
                        <span className="font-medium">{balance.to_user}</span>
                      </p>
                      <p className="font-bold text-green-600">${balance.amount.toFixed(2)}</p>
                    </div>
                    {(currentUser?.name === balance.from_user ||
                      currentUser?.name === balance.to_user) && (
                      <button
                        onClick={() =>
                          handleSettleDebt(balance.from_user, balance.to_user, balance.amount)
                        }
                        className="w-full mt-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                      >
                        Settle Up
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expenses Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Expenses</h2>
            {expenses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No expenses yet</p>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div key={expense.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{expense.description}</p>
                        <p className="text-sm text-gray-500">
                          Paid by {expense.paid_by} • {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900">${expense.amount.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Expense Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const description = formData.get('description') as string
                const amount = parseFloat(formData.get('amount') as string)

                try {
                  const res = await fetch(`/api/groups/${groupId}/expenses`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description, amount }),
                  })

                  if (!res.ok) {
                    throw new Error('Failed to add expense')
                  }

                  e.currentTarget.reset()
                  fetchGroupData()
                } catch (err) {
                  alert('Failed to add expense')
                }
              }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <h3 className="text-sm font-medium text-gray-700 mb-2">Add Expense</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  name="description"
                  required
                  placeholder="Description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <input
                  type="number"
                  name="amount"
                  required
                  step="0.01"
                  min="0.01"
                  placeholder="Amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
