import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Welcome to <span className="text-primary">SplitSync</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            The real-time expense sharing application that makes tracking shared expenses,
            calculating optimal settlements, and managing group finances simple and transparent.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/signin">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
