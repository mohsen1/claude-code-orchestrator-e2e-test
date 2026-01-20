'use client'

import { useMemo } from 'react'

interface Balance {
  from_user: number
  from_user_name: string
  to_user: number
  to_user_name: string
  amount: number
}

interface BalanceChartProps {
  balances: Balance[]
  currentUserId?: number
}

export default function BalanceChart({ balances, currentUserId }: BalanceChartProps) {
  const chartData = useMemo(() => {
    if (balances.length === 0) return null

    const nodes = new Map<number, { name: string; owes: number; owed: number }>()
    const edges: Array<{ from: number; to: number; amount: number }> = []

    balances.forEach(balance => {
      // Add nodes if they don't exist
      if (!nodes.has(balance.from_user)) {
        nodes.set(balance.from_user, {
          name: balance.from_user_name,
          owes: 0,
          owed: 0,
        })
      }
      if (!nodes.has(balance.to_user)) {
        nodes.set(balance.to_user, {
          name: balance.to_user_name,
          owes: 0,
          owed: 0,
        })
      }

      // Update amounts
      const fromNode = nodes.get(balance.from_user)!
      const toNode = nodes.get(balance.to_user)!
      fromNode.owes += balance.amount
      toNode.owed += balance.amount

      edges.push({
        from: balance.from_user,
        to: balance.to_user,
        amount: balance.amount,
      })
    })

    return { nodes: Array.from(nodes.entries()), edges }
  }, [balances])

  const filteredBalances = useMemo(() => {
    if (!currentUserId) return balances
    return balances.filter(
      b => b.from_user === currentUserId || b.to_user === currentUserId
    )
  }, [balances, currentUserId])

  const yourNetBalance = useMemo(() => {
    if (!currentUserId) return null
    return balances.reduce((net, balance) => {
      if (balance.to_user === currentUserId) {
        return net + balance.amount // You're owed
      } else if (balance.from_user === currentUserId) {
        return net - balance.amount // You owe
      }
      return net
    }, 0)
  }, [balances, currentUserId])

  if (balances.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Balances</h2>
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-2">All settled up! No pending balances.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Balances</h2>

      {yourNetBalance !== null && (
        <div className={`mb-6 p-4 rounded-lg ${
          yourNetBalance > 0
            ? 'bg-green-100 border border-green-300 text-green-800'
            : yourNetBalance < 0
            ? 'bg-red-100 border border-red-300 text-red-800'
            : 'bg-gray-100 border border-gray-300 text-gray-800'
        }`}>
          <p className="text-lg font-semibold">
            {yourNetBalance > 0
              ? `You are owed $${yourNetBalance.toFixed(2)}`
              : yourNetBalance < 0
              ? `You owe $${Math.abs(yourNetBalance).toFixed(2)}`
              : "You're all settled up!"}
          </p>
        </div>
      )}

      {/* Visual Flow Chart */}
      {chartData && chartData.edges.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Payment Flow</h3>
          <div className="flex flex-col gap-3">
            {chartData.edges.map((edge, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className="font-medium flex-1 text-right">
                  {chartData.nodes.find(n => n[0] === edge.from)?.[1]?.name || 'Unknown'}
                </span>
                <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 rounded-full">
                  <span className="text-blue-700 font-semibold">
                    ${edge.amount.toFixed(2)}
                  </span>
                  <svg
                    className="w-4 h-4 text-blue-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
                <span className="font-medium flex-1">
                  {chartData.nodes.find(n => n[0] === edge.to)?.[1]?.name || 'Unknown'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed List */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Details</h3>
        <div className="space-y-2">
          {filteredBalances.length > 0 ? filteredBalances.map((balance, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                balance.to_user === currentUserId
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  balance.to_user === currentUserId
                    ? 'bg-green-200 text-green-700'
                    : 'bg-red-200 text-red-700'
                }`}>
                  {balance.to_user === currentUserId ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  )}
                </div>
                <div>
                  {balance.to_user === currentUserId ? (
                    <p className="font-medium text-green-800">
                      {balance.from_user_name} owes you
                    </p>
                  ) : balance.from_user === currentUserId ? (
                    <p className="font-medium text-red-800">
                      You owe {balance.to_user_name}
                    </p>
                  ) : (
                    <p className="font-medium text-gray-800">
                      {balance.from_user_name} owes {balance.to_user_name}
                    </p>
                  )}
                </div>
              </div>
              <span className={`text-lg font-bold ${
                balance.to_user === currentUserId
                  ? 'text-green-700'
                  : balance.from_user === currentUserId
                  ? 'text-red-700'
                  : 'text-gray-700'
              }`}>
                ${balance.amount.toFixed(2)}
              </span>
            </div>
          )) : (
            <p className="text-gray-500 text-center py-4">
              {currentUserId ? "You don't have any pending balances" : 'No pending balances'}
            </p>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {chartData && chartData.nodes.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-3">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {chartData.nodes.map(([id, node]) => (
              <div key={id} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-800">{node.name}</p>
                <div className="flex gap-4 text-sm mt-1">
                  <span className="text-red-600">
                    Owes: ${node.owes.toFixed(2)}
                  </span>
                  <span className="text-green-600">
                    Owed: ${node.owed.toFixed(2)}
                  </span>
                </div>
                <p className={`text-sm font-semibold mt-1 ${
                  (node.owed - node.owes) >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  Net: ${(node.owed - node.owes).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
