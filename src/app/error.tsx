'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container flex max-w-lg flex-col items-center gap-8 px-4 py-16 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Something went wrong!</CardTitle>
            <CardDescription>An unexpected error occurred while processing your request.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error.message && (
              <p className="text-sm text-muted-foreground">
                Error: {error.message}
              </p>
            )}
            <div className="flex gap-4 justify-center">
              <Button onClick={reset}>Try Again</Button>
              <Button variant="outline" asChild>
                <a href="/">Go Home</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
