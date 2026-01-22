import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <div className="mb-8 inline-flex items-center justify-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 dark:bg-blue-900 dark:text-blue-100">
          ✨ Real-time Expense Sharing
        </div>

        <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
          SplitSync
        </h1>

        <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
          Track shared expenses with your group, calculate optimal debt settlements, and manage
          finances transparently — all in real-time.
        </p>

        <div className="mb-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-3 text-4xl">💸</div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Track Expenses</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Record expenses with automatic equal splits across group members
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-3 text-4xl">🧮</div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Smart Settlements</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Calculate optimal payment paths to minimize transactions
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-3 text-4xl">⚡</div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Real-time Updates</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Live synchronization across all group members
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Get Started
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-8 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            View Demo
          </Link>
        </div>

        <div className="mt-16 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong className="font-semibold">Tech Stack:</strong> Next.js 16 • TypeScript • SQLite •
            Drizzle ORM • Socket.io • Tailwind CSS • shadcn/ui
          </p>
        </div>
      </div>
    </div>
  );
}
