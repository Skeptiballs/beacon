"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_CONFIG, NAV_LINKS } from "@/config/app";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog";
import { Radar } from "lucide-react";

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-xl items-center px-4 sm:px-6 lg:px-8">
        {/* Logo and app name */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Radar className="h-6 w-6 text-emerald-500" />
          <span className="font-bold text-lg">{APP_CONFIG.name}</span>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-6 text-sm flex-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === link.href
                  ? "text-foreground font-medium"
                  : "text-foreground/60"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Feedback and Join Waitlist buttons */}
        <div className="flex items-center gap-2">
          <FeedbackDialog />
          <Button asChild variant="default" size="sm">
            <Link href="/waitlist">Join Waitlist</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

