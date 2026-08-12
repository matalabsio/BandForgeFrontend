"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const DEV_MOCK_LINKS = [
  { href: "/test/1/listening", label: "MT1" },
  { href: "/test/2/listening", label: "MT2" },
  { href: "/diagnostic", label: "Diagnostic" },
  { href: "/test", label: "Mock hub" },
] as const;

type Props = {
  className?: string;
  /** Reserve space above mobile bottom nav. */
  aboveMobileNav?: boolean;
};

/**
 * Local-dev only strip so engineers can open full mocks without plan unlock.
 * Omitted from production builds (`NODE_ENV !== "development"`).
 */
export function DevMockTestFooter({
  className,
  aboveMobileNav = false,
}: Props) {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <footer
      className={cn(
        "z-30 border-t border-white/10 bg-navy text-white",
        aboveMobileNav
          ? "fixed right-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] left-0 lg:bottom-0"
          : "sticky bottom-0",
        className,
      )}
      aria-label="Developer mock test shortcuts"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-2 sm:px-6 lg:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan">
          Dev · Mock tests
        </p>
        <nav className="flex flex-wrap items-center gap-1.5" aria-label="Mock test shortcuts">
          {DEV_MOCK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch
              className="inline-flex min-h-8 items-center rounded-full border border-white/15 bg-white/5 px-3 text-[11px] font-semibold text-white/90 transition-colors hover:border-cyan/50 hover:bg-cyan/15 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
