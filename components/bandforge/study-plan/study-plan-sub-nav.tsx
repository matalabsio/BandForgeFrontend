"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Today", href: "/study-plan/today" },
  { label: "Full Plan", href: "/study-plan" },
] as const;

export function StudyPlanSubNav() {
  const pathname = usePathname();

  return (
    <nav
      className="mb-6 flex gap-1 rounded-xl border border-border-soft bg-white p-1"
      aria-label="Study plan views"
    >
      {TABS.map((tab) => {
        const active =
          tab.href === "/study-plan"
            ? pathname === "/study-plan"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors",
              active
                ? "bg-cyan text-white"
                : "text-muted hover:bg-ink/5 hover:text-navy",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
