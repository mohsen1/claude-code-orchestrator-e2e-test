import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SplitSync - Expense Sharing Made Simple",
  description: "Split expenses easily with friends and family. Track, share, and settle payments in real-time.",
  keywords: ["expense sharing", "split bills", "money tracking", "settlement"],
  authors: [{ name: "SplitSync Team" }],
  openGraph: {
    title: "SplitSync - Expense Sharing Made Simple",
    description: "Split expenses easily with friends and family",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}
