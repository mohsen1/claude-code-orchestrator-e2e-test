import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            Split Expenses Easily
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Track shared expenses with friends, family, or roommates
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
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
            <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-50">
              Create Groups
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Organize expenses by groups with friends, family, or roommates
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-50">
              Track Expenses
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Add expenses and automatically split them among group members
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-50">
              View Balances
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              See who owes whom and settle up easily
            </p>
          </div>
        </div>

        <div className="space-x-4">
          <Link
            href="/auth/signin"
            className="inline-block bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 px-8 py-3 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/auth/signup"
            className="inline-block bg-transparent border-2 border-slate-900 dark:border-slate-50 text-slate-900 dark:text-slate-50 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
