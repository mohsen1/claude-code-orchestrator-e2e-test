import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Book Library Management System',
  description: 'Manage your book library with ease',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
