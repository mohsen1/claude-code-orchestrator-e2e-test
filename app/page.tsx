import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calculator,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle2
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: Users,
      title: "Group Management",
      description: "Create and manage expense sharing groups with secure invite links and role-based member management."
    },
    {
      icon: Calculator,
      title: "Smart Settlements",
      description: "Automatic calculation of optimal debt settlements to minimize transactions between group members."
    },
    {
      icon: Zap,
      title: "Real-time Sync",
      description: "Live expense updates across all group members with instant balance recalculation."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "End-to-end encryption, secure authentication, and GDPR-compliant data handling."
    },
    {
      icon: TrendingUp,
      title: "Expense Tracking",
      description: "Detailed expense history with categories, tags, and receipt attachments."
    },
    {
      icon: CheckCircle2,
      title: "Settlement Tracking",
      description: "Mark and track settlements with complete audit trail and payment verification."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Create a Group",
      description: "Set up a new expense sharing group and invite members with a secure link."
    },
    {
      number: "02",
      title: "Add Expenses",
      description: "Record expenses with description, amount, and automatic equal split calculation."
    },
    {
      number: "03",
      title: "Settle Up",
      description: "View optimized settlement suggestions and mark payments as complete."
    }
  ];

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 pt-12 pb-8">
        <div className="inline-block rounded-lg bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          ✨ Real-time Expense Sharing
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Split Expenses{" "}
          <span className="text-primary">
            Effortlessly
          </span>
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          Track shared expenses with your group, calculate optimal settlements automatically,
          and manage finances transparently. All in real-time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Button asChild size="lg" className="text-base">
            <Link href="/auth/signup">
              Get Started Free
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base">
            <Link href="/auth/signin">
              Sign In
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything You Need
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features to manage group finances with ease
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get started in three simple steps
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-muted" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container max-w-4xl">
        <Card className="bg-primary text-primary-foreground border-0">
          <CardHeader className="text-center py-12">
            <CardTitle className="text-3xl md:text-4xl mb-4">
              Ready to Simplify Your Group Expenses?
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 text-lg">
              Join thousands of users who trust SplitSync for transparent expense tracking
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="text-base"
              >
                <Link href="/auth/signup">
                  Create Free Account
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base border-primary-foreground/20 hover:bg-primary-foreground/10"
              >
                <Link href="/demo">
                  View Demo
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </section>

      {/* Tech Stack Section */}
      <section className="container max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Built with Modern Technology
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <div className="rounded-lg border px-4 py-2">Next.js 16</div>
          <div className="rounded-lg border px-4 py-2">TypeScript</div>
          <div className="rounded-lg border px-4 py-2">SQLite + Drizzle ORM</div>
          <div className="rounded-lg border px-4 py-2">Socket.io</div>
          <div className="rounded-lg border px-4 py-2">Tailwind CSS</div>
          <div className="rounded-lg border px-4 py-2">NextAuth.js</div>
        </div>
      </section>
    </div>
  );
}
