import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SplitSync - Expense Sharing Made Simple',
  description: 'Real-time expense sharing application with automatic debt settlement calculations',
  keywords: ['expense sharing', 'split bills', 'group expenses', 'debt settlement'],
  authors: [{ name: 'SplitSync Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://splitsync.app',
    siteName: 'SplitSync',
    title: 'SplitSync - Expense Sharing Made Simple',
    description: 'Real-time expense sharing application with automatic debt settlement calculations',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SplitSync - Expense Sharing Made Simple',
    description: 'Real-time expense sharing application with automatic debt settlement calculations',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
