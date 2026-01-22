"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { UserNav } from "@/components/layout/user-nav";
import { MobileNav } from "@/components/layout/mobile-nav";

export function Header() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserNav user={session.user} />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </>
          )}

          <MobileNav navigation={navigation} />
        </div>
      </div>
    </header>
  );
}
