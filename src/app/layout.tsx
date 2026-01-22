import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'SplitSync - Expense Sharing Made Simple',
    template: '%s | SplitSync',
  },
  description:
    'SplitSync helps you track shared expenses, calculate optimal settlements, and manage group finances with real-time synchronization.',
  keywords: ['expense sharing', 'split bills', 'group expenses', 'settlement calculator'],
  authors: [{ name: 'SplitSync Team' }],
  creator: 'SplitSync',
  publisher: 'SplitSync',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://splitsync.app',
    siteName: 'SplitSync',
    title: 'SplitSync - Expense Sharing Made Simple',
    description:
      'Track shared expenses, calculate optimal settlements, and manage group finances with real-time synchronization.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SplitSync',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SplitSync - Expense Sharing Made Simple',
    description:
      'Track shared expenses, calculate optimal settlements, and manage group finances with real-time synchronization.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
