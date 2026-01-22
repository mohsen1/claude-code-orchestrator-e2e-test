"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileNavProps {
  navigation: Array<{ name: string; href: string }>;
}

export function MobileNav({ navigation }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>
            Quick links to navigate the app
          </SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-8">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-lg font-medium transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
