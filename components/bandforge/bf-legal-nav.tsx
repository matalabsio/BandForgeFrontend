"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { legalLinks } from "@/components/bandforge/bf-legal-links";
import { cn } from "@/lib/utils";

export function BfLegalNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Legal documents"
      className="inline-flex max-w-full flex-wrap gap-1 rounded-full border border-border-soft bg-white p-1 shadow-[var(--shadow-soft)]"
    >
      {legalLinks.map((link) => {
        const active = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            prefetch
            aria-current={active ? "page" : undefined}
            className={cn(
              "cursor-pointer rounded-full px-4 py-2 text-meta font-semibold transition-colors duration-200",
              active
                ? "bg-navy text-white"
                : "text-ink/55 hover:bg-surface-alt hover:text-navy",
            )}
          >
            {link.shortLabel}
          </Link>
        );
      })}
    </nav>
  );
}
