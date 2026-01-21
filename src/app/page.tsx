import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl w-full mx-4 text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            SplitSync
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Expense sharing made simple. Track, split, and settle with ease.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            icon="👥"
            title="Group Management"
            description="Create groups and invite friends with shareable invite links"
          />
          <FeatureCard
            icon="💰"
            title="Easy Splitting"
            description="Split expenses equally or customize shares. We handle the math."
          />
          <FeatureCard
            icon="⚡"
            title="Real-time Updates"
            description="See changes instantly with Socket.io-powered live updates"
          />
        </div>

        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/signin">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/demo">View Demo</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
