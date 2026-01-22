import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Receipt, ArrowRight, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-6xl">
            SplitSync
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Expense sharing made simple. Track, split, and settle payments with friends and family in real-time.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/auth/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Group Management</CardTitle>
              <CardDescription>
                Create groups and invite friends with shareable links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Unlimited groups
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Easy invite links
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Member management
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <Receipt className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Expense Tracking</CardTitle>
              <CardDescription>
                Log expenses and split them equally among group members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Equal splitting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Category tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Payment history
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <ArrowRight className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Smart Settlements</CardTitle>
              <CardDescription>
                Automatic debt simplification to minimize transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Optimized payments
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Real-time updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Balance tracking
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="text-center space-y-4 pt-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                1
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                Create a Group
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Start a new group and invite your friends
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                2
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                Add Expenses
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Log shared expenses with your group
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                3
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                Settle Up
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                See optimized settlements and get paid back
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
