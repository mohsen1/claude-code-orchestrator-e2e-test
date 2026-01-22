import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container flex max-w-lg flex-col items-center gap-8 px-4 py-16 text-center">
        <h1 className="text-9xl font-bold text-slate-900 dark:text-slate-50">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">Page Not Found</h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Button asChild size="lg">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </main>
  );
}
