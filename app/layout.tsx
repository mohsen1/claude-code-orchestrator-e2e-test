import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Splitwise Clone - Expense Sharing',
  description: 'Split expenses easily with friends and family',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
