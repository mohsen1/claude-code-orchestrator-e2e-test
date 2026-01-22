import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SplitSync - Expense Sharing Made Simple',
  description:
    'SplitSync is a real-time expense sharing application that allows groups to track shared expenses, calculate optimal debt settlements, and manage group finances transparently.',
  keywords: ['expense sharing', 'split bills', 'group expenses', 'debt settlement', 'finance tracker'],
  authors: [{ name: 'SplitSync Team' }],
  creator: 'SplitSync',
  publisher: 'SplitSync',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'SplitSync - Expense Sharing Made Simple',
    description:
      'Track shared expenses, calculate optimal debt settlements, and manage group finances transparently.',
    siteName: 'SplitSync',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SplitSync - Expense Sharing Made Simple',
    description:
      'Track shared expenses, calculate optimal debt settlements, and manage group finances transparently.',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
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
        <div className="min-h-screen bg-background font-sans antialiased">
          <main className="relative flex min-h-screen flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
