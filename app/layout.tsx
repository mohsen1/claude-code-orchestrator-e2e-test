import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "SplitSync - Expense Sharing Made Simple",
    template: "%s | SplitSync"
  },
  description: "Real-time expense sharing application with intelligent debt settlement calculation. Track shared expenses, calculate optimal settlements, and manage group finances transparently.",
  keywords: ["expense sharing", "split bills", "group expenses", "debt settlement", "money tracking"],
  authors: [{ name: "SplitSync Team" }],
  creator: "SplitSync",
  publisher: "SplitSync",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "SplitSync - Expense Sharing Made Simple",
    description: "Real-time expense sharing application with intelligent debt settlement calculation.",
    siteName: "SplitSync",
  },
  twitter: {
    card: "summary_large_image",
    title: "SplitSync - Expense Sharing Made Simple",
    description: "Real-time expense sharing application with intelligent debt settlement calculation.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 container py-6">
              {children}
            </main>
            <footer className="border-t py-6 md:py-0">
              <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} SplitSync. All rights reserved.
                </p>
                <p className="text-sm text-muted-foreground">
                  Built with Next.js 16 + TypeScript
                </p>
              </div>
            </footer>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
