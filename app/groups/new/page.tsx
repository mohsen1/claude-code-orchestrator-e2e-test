'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GroupForm from '@/components/GroupForm'

export default function NewGroup() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/login')
        }
      } catch (err) {
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-blue-600">Splitwise Clone</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create New Group</h2>
          <p className="text-gray-600 mt-1">Start sharing expenses with friends and family</p>
        </div>

        <GroupForm />

        <div className="mt-8 max-w-md mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Choose a descriptive name for your group</li>
              <li>• Add members by their email address</li>
              <li>• Create expenses and track who owes what</li>
              <li>• Settle up easily when you're ready</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
