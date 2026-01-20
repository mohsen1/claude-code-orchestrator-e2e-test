'use client'

import Link from 'next/link'

interface GroupCardProps {
  id: number
  name: string
  memberCount?: number
  balance?: number
}

export default function GroupCard({ id, name, memberCount = 0, balance = 0 }: GroupCardProps) {
  const balanceColor = balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'
  const balanceText = balance > 0 ? `You are owed $${balance.toFixed(2)}`
                     : balance < 0 ? `You owe $${Math.abs(balance).toFixed(2)}`
                     : 'Settled up'

  return (
    <Link href={`/groups/${id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{name}</h3>
            <p className="text-sm text-gray-500">
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${balanceColor}`}>
              {balanceText}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
