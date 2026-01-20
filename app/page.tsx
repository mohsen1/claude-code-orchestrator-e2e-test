export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight">
              Split Expenses
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-2">
                With Friends
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              The easiest way to share expenses with anyone. Track who owes whom, settle up, and never fight about money again.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/signup"
                className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started Free
              </a>
              <a
                href="/login"
                className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to split expenses
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, powerful, and designed for real life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Create Groups</h3>
              <p className="text-gray-600">
                Organize expenses by group - roommates, trips, events, or any occasion. Add members and start tracking instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Add Expenses</h3>
              <p className="text-gray-600">
                Log expenses in seconds. Split equally or customize amounts for each person. Track who paid and split automatically.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Track Balances</h3>
              <p className="text-gray-600">
                See exactly who owes whom at a glance. Visual balances and simplified debts minimize transactions and confusion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="bg-gray-50 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white text-xl font-bold rounded-full mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Create a Group</h3>
              <p className="text-gray-600">
                Start a new group for your apartment, trip, or any shared expense scenario.
              </p>
              <div className="hidden md:block absolute top-6 left-[60%] w-[80%] border-t-2 border-dashed border-gray-300"></div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white text-xl font-bold rounded-full mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Add Members</h3>
              <p className="text-gray-600">
                Invite friends or family to join your group with just their email.
              </p>
              <div className="hidden md:block absolute top-6 left-[60%] w-[80%] border-t-2 border-dashed border-gray-300"></div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white text-xl font-bold rounded-full mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Split Expenses</h3>
              <p className="text-gray-600">
                Add expenses and let the app handle the math. Settle up easily when ready.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="bg-white py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Perfect for any situation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Roommates</h3>
              <p className="text-gray-600 text-sm">Split rent, utilities, and groceries fairly</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-4xl mb-4">✈️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Travel</h3>
              <p className="text-gray-600 text-sm">Track trip expenses with travel buddies</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Events</h3>
              <p className="text-gray-600 text-sm">Share party costs and group gifts</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Couples</h3>
              <p className="text-gray-600 text-sm">Manage shared expenses with partners</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to stop stressing about money?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of people who split expenses the easy way.
          </p>
          <a
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-100 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Start Free Today
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">
              © 2025 Splitwise Clone. Built with Next.js, TypeScript, and SQLite.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
