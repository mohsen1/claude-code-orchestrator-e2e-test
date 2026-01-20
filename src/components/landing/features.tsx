import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Users,
  Calculator,
  Bell,
  Smartphone,
  Lock,
  BarChart3,
  CreditCard,
  Globe,
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Group Expenses',
    description: 'Create groups with friends, family, or roommates and track shared expenses together.',
  },
  {
    icon: Calculator,
    title: 'Smart Splitting',
    description: 'Automatically split expenses equally or customize amounts. No more manual calculations.',
  },
  {
    icon: Bell,
    title: 'Real-time Updates',
    description: 'Get instant notifications when expenses are added or balances change.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Friendly',
    description: 'Access your expenses anywhere with our responsive design that works on all devices.',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'Your financial data is encrypted and secure. We never sell your information.',
  },
  {
    icon: BarChart3,
    title: 'Balance Tracking',
    description: 'See exactly who owes whom and how much. Clear balances at any time.',
  },
  {
    icon: CreditCard,
    title: 'Easy Settlement',
    description: 'Settle up with one click. Record payments and update balances automatically.',
  },
  {
    icon: Globe,
    title: 'Multi-currency',
    description: 'Support for multiple currencies makes it perfect for international groups.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Everything you need to
            <span className="text-primary"> split expenses</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features to make sharing expenses simple, fair, and stress-free.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* How it Works Section */}
        <div id="how-it-works" className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4 mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create a Group</h3>
              <p className="text-muted-foreground">
                Set up a group and invite your friends with a simple link.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4 mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Add Expenses</h3>
              <p className="text-muted-foreground">
                Record who paid, how much, and who should share the cost.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4 mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Settle Up</h3>
              <p className="text-muted-foreground">
                See who owes what and settle debts with one click.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="rounded-lg border bg-background p-8 sm:p-12 max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to stop stressing about shared expenses?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of users who have simplified their shared finances.
              Get started in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto text-base">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
