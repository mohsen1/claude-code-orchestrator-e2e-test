import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, DollarSign, Calculator, Shield, CheckCircle, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-8 w-8 text-emerald-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              SplitEase
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
            <Zap className="h-4 w-4" />
            Simple expense sharing for everyone
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Split expenses{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              effortlessly
            </span>{' '}
            with friends
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Track shared expenses, calculate balances, and settle up with your group.
            No more awkward money conversations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-lg px-8"
              >
                Start for Free
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to manage shared expenses
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Powerful features designed to make splitting expenses simple and fair
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Groups</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Set up groups for friends, roommates, or travel companions and invite members easily.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Expenses</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Log expenses and split them equally among group members automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Balances</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  See who owes whom and how much, calculated automatically in real-time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Settle Up</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Record settlements and clear debts with just a few clicks.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Live Updates</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Get instant updates when expenses are added or settlements are made.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Auth</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Sign in securely with Google OAuth or email/password authentication.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Create a Group',
                description: 'Set up a group for your friends, family, or roommates and give it a name.',
              },
              {
                step: '2',
                title: 'Invite Members',
                description: 'Share the group link or invite members directly to join your expense group.',
              },
              {
                step: '3',
                title: 'Add Expenses',
                description: 'Log shared expenses and assign them to the group. We\'ll split them automatically.',
              },
              {
                step: '4',
                title: 'Settle Up',
                description: 'See balances at a glance and settle debts with just a few clicks.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to simplify your shared expenses?
          </h2>
          <p className="text-xl mb-8 text-emerald-100">
            Join thousands of users who trust SplitEase for managing group expenses.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 bg-white text-emerald-600 hover:bg-slate-100"
            >
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-6 w-6 text-emerald-600" />
              <span className="text-lg font-bold">SplitEase</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              © 2024 SplitEase. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
