import Link from "next/link";
import { Users, Receipt, TrendingUp, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">SplitEase</span>
          </div>
          <nav className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Split Expenses with Ease
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Track shared expenses with friends, calculate balances in real-time, and settle up effortlessly.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-lg font-medium"
            >
              Start Free Today
            </Link>
            <Link
              href="#features"
              className="px-8 py-3 border border-input rounded-lg hover:bg-accent transition-colors text-lg font-medium"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features */}
        <section id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border">
            <Users className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Group Expenses</h3>
            <p className="text-muted-foreground">
              Create groups and split expenses equally among members
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border">
            <Receipt className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Easy Tracking</h3>
            <p className="text-muted-foreground">
              Add expenses quickly and keep track of who owes what
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border">
            <TrendingUp className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real-time Balances</h3>
            <p className="text-muted-foreground">
              See live updates of your balances and settlements
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure Auth</h3>
            <p className="text-muted-foreground">
              Sign in with Google or email/password authentication
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-white dark:bg-slate-900 rounded-2xl p-12 shadow-sm border">
          <h2 className="text-3xl font-bold mb-4">Ready to Simplify Your Expenses?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users who trust SplitEase for managing shared expenses
          </p>
          <Link
            href="/register"
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-lg font-medium inline-block"
          >
            Create Your Account
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>&copy; 2024 SplitEase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
