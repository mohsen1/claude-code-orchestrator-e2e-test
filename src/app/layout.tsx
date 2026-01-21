import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SplitSync - Expense Sharing Made Simple',
  description: 'Split expenses with friends and family easily. Track, manage, and settle group expenses in real-time.',
  keywords: ['expense sharing', 'split bills', 'group expenses', 'settlement tracker'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
