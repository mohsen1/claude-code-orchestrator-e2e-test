"use client"

import { signOut } from "next-auth/react"

export function SignOutButton() {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
    >
      Sign out
    </button>
  )
}
