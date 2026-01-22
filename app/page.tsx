import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="container flex max-w-4xl flex-col items-center justify-center space-y-8 px-4 py-16 text-center">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">SplitSync</h1>
        </div>

        {/* Headline */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Expense Sharing
            <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              {' '}
              Made Simple
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Track shared expenses with your group, calculate optimal debt settlements, and manage
            finances transparently in real-time.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/auth/signin"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Get Started
          </Link>
          <Link
            href="/about"
            className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Learn More
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 pt-8 sm:grid-cols-3">
          <div className="flex flex-col items-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Group Management</h3>
            <p className="text-center text-sm text-muted-foreground">
              Create and manage expense sharing groups with secure invite links
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Expense Tracking</h3>
            <p className="text-center text-sm text-muted-foreground">
              Record expenses with automatic equal split calculations across members
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Smart Settlements</h3>
            <p className="text-center text-sm text-muted-foreground">
              Calculate optimal debt settlements to minimize total transactions
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="pt-8 text-sm text-muted-foreground">
          <p>Real-time synchronization • Secure authentication • Financial accuracy guaranteed</p>
        </div>
      </div>
    </div>
  );
}
