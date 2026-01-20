import Link from "next/link"
import { Users, Receipt, TrendingUp, Shield } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-6 w-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">Splitwise</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Split expenses with friends,
            <span className="text-emerald-600"> hassle-free</span>
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Track shared expenses, calculate balances, and settle debts easily.
            Perfect for roommates, travel groups, and shared households.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              Start Free
            </Link>
            <Link
              href="/login"
              className="bg-white text-slate-700 px-8 py-4 rounded-lg hover:bg-slate-50 transition-colors font-semibold text-lg border border-slate-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center text-slate-900 mb-12">
          Everything you need to manage shared expenses
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <h4 className="text-xl font-semibold text-slate-900 mb-2">
              Create Groups
            </h4>
            <p className="text-slate-600">
              Organize expenses by group - roommates, trips, or any shared activity
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Receipt className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="text-xl font-semibold text-slate-900 mb-2">
              Track Expenses
            </h4>
            <p className="text-slate-600">
              Add expenses and automatically split them equally among group members
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="text-xl font-semibold text-slate-900 mb-2">
              Real-time Balances
            </h4>
            <p className="text-slate-600">
              See who owes whom and how much, updated in real-time
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
            <h4 className="text-xl font-semibold text-slate-900 mb-2">
              Easy Settlement
            </h4>
            <p className="text-slate-600">
              Settle up with friends and clear debts with a single click
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to simplify your shared expenses?
          </h3>
          <p className="text-emerald-100 text-lg mb-8">
            Join thousands of users who trust Splitwise to manage their group finances
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-emerald-600 px-8 py-4 rounded-lg hover:bg-slate-50 transition-colors font-semibold text-lg"
          >
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Receipt className="h-5 w-5 text-emerald-400" />
              <span className="font-semibold text-white">Splitwise</span>
            </div>
            <p className="text-sm">
              © 2024 Splitwise. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
