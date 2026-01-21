import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SplitSync - Expense Sharing App',
  description: 'Split expenses easily with friends and family',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
