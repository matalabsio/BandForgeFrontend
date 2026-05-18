import Link from "next/link";
import type { ReactNode } from "react";
import {
  CandidateMobileNav,
  CandidateSidebar,
} from "@/components/dashboard/candidate-nav";
import { SiteNavigation } from "@/components/layout/site-navigation";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: ReactNode;
  className?: string;
};

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className={cn("app-surface min-h-dvh pb-20 lg:pb-0", className)}>
      <header className="sticky top-0 z-40 border-b border-border bg-navy text-white shadow-[var(--shadow-soft)]">
        <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="text-body font-semibold tracking-tight transition-opacity duration-200 hover:opacity-90"
          >
            BandForge
          </Link>
          <div className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
            <SiteNavigation variant="dark" />
          </div>
          <span className="rounded-full bg-teal/20 px-3 py-1 text-meta font-medium text-teal-light">
            Band 6.5
          </span>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-6 sm:px-6 sm:py-8">
        <CandidateSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <CandidateMobileNav />
    </div>
  );
}
