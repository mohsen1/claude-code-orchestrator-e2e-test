import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-6xl">
            SplitSync
          </h1>
          <p className="mb-8 text-xl text-slate-600 dark:text-slate-400">
            The smart way to share expenses with friends, family, and roommates.
            Calculate optimal settlements and track shared expenses in real-time.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="text-base">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="text-base">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Everything you need to manage shared expenses
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Powerful features designed to make expense tracking effortless and accurate
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature Card 1 */}
          <Card>
            <CardHeader>
              <CardTitle>Smart Settlements</CardTitle>
              <CardDescription>
                Our algorithm minimizes the number of transactions needed to settle debts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Automatically calculates the optimal payment paths, reducing complexity and ensuring everyone gets paid back fairly.
              </p>
            </CardContent>
          </Card>

          {/* Feature Card 2 */}
          <Card>
            <CardHeader>
              <CardTitle>Real-time Updates</CardTitle>
              <CardDescription>
                Stay synchronized with instant updates across all devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                See expenses appear instantly as group members add them. No more refreshing or waiting for updates.
              </p>
            </CardContent>
          </Card>

          {/* Feature Card 3 */}
          <Card>
            <CardHeader>
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your financial data is encrypted and protected with enterprise-grade security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                All monetary values are stored with precision using integer arithmetic. TLS encryption protects data in transit.
              </p>
            </CardContent>
          </Card>

          {/* Feature Card 4 */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>
                Organize expenses with custom categories and tags
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Categorize expenses by type (groceries, rent, utilities) and add custom tags for better tracking and reporting.
              </p>
            </CardContent>
          </Card>

          {/* Feature Card 5 */}
          <Card>
            <CardHeader>
              <CardTitle>Group Management</CardTitle>
              <CardDescription>
                Create groups for different occasions and manage member roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Set up groups for roommates, trips, or events. Admin controls let you manage members and permissions.
              </p>
            </CardContent>
          </Card>

          {/* Feature Card 6 */}
          <Card>
            <CardHeader>
              <CardTitle>Receipt Attachments</CardTitle>
              <CardDescription>
                Keep proof of purchases by attaching receipts to expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Upload and attach receipt images to expenses. Perfect for business expenses or shared household purchases.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="mx-auto max-w-2xl border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to get started?</CardTitle>
            <CardDescription className="text-base">
              Join thousands of users who trust SplitSync for their expense sharing needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="text-base">
                Create Your First Group
              </Button>
              <Button size="lg" variant="outline" className="text-base">
                View Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © 2026 SplitSync. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50">
                Privacy
              </a>
              <a href="#" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50">
                Terms
              </a>
              <a href="#" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
