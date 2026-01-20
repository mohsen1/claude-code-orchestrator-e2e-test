'use client'

import { GroupCard } from '@/components/dashboard/group-card'

// Mock data for UI demonstration - replace with actual API calls
const mockGroups = [
  {
    id: '1',
    name: 'Roommates',
    description: 'Monthly rent and utilities',
    memberCount: 4,
    totalExpenses: 2450.00,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Office Lunch',
    description: 'Friday team lunches',
    memberCount: 8,
    totalExpenses: 320.50,
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    name: 'Beach House',
    description: 'Summer vacation rental',
    memberCount: 6,
    totalExpenses: 1800.00,
    createdAt: '2024-01-05',
  },
  {
    id: '4',
    name: 'Family Dinner',
    description: 'Weekly family meals',
    memberCount: 5,
    totalExpenses: 450.75,
    createdAt: '2023-12-20',
  },
]

export function GroupList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockGroups.map((group) => (
        <GroupCard
          key={group.id}
          id={group.id}
          name={group.name}
          description={group.description}
          memberCount={group.memberCount}
          totalExpenses={group.totalExpenses}
          createdAt={group.createdAt}
        />
      ))}

      {/* Empty state - shown when no groups exist */}
      {mockGroups.length === 0 && (
        <div className="col-span-full">
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-slate-400 dark:text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              No groups yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm mb-6">
              Create your first group to start sharing expenses with friends and family.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
