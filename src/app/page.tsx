import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container flex max-w-5xl flex-col items-center gap-8 px-4 py-16 text-center">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-6xl md:text-7xl">
            SplitSync
          </h1>
          <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-400 sm:text-xl md:text-2xl">
            Share expenses effortlessly with friends, family, and roommates. Track spending, calculate
            settlements, and keep everyone on the same page.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="text-base">
            <Link href="/auth/signup">Get Started Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>

        {/* Features Section */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                See expense changes instantly across all devices. No refreshing required.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Smart Settlements</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Our algorithm minimizes the number of transactions needed to settle up debts.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Multi-Currency</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Support for 14+ currencies makes it perfect for international groups.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Organize spending with categories like food, travel, entertainment, and more.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secure Invites</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate secure, time-limited invite links to add members to your groups.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                View spending patterns, balances, and settlement history for each group.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Footer Section */}
        <div className="mt-12 text-sm text-slate-500 dark:text-slate-500">
          <p>Built with Next.js 16, TypeScript, and SQLite.</p>
        </div>
      </div>
    </main>
  );
}
