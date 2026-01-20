'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign, Calendar } from 'lucide-react'

interface GroupCardProps {
  id: string
  name: string
  description: string
  memberCount: number
  totalExpenses: number
  createdAt: string
}

export function GroupCard({
  id,
  name,
  description,
  memberCount,
  totalExpenses,
  createdAt,
}: GroupCardProps) {
  return (
    <Link href={`/dashboard/groups/${id}`}>
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            {name}
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Member Count */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-slate-700 dark:text-slate-300">
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
              </span>
            </div>

            {/* Total Expenses */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-slate-700 dark:text-slate-300">
                ${totalExpenses.toFixed(2)} total expenses
              </span>
            </div>

            {/* Created Date */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-slate-700 dark:text-slate-300">
                Created {new Date(createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
