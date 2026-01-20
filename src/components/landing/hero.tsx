import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, TrendingUp, Shield } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center rounded-full border bg-background px-4 py-1.5 text-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            Now with real-time updates
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Split expenses
            <span className="block text-primary">with friends</span>
            <span className="block">effortlessly</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground mb-10">
            Track shared expenses, calculate balances, and settle up with your friends.
            No more awkward money conversations or forgotten debts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto text-base">
                Start Splitting Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Stats/Social Proof */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">10K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">$2M+</div>
              <div className="text-sm text-muted-foreground">Expenses Tracked</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
