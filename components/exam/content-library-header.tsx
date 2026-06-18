"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Search } from "lucide-react";
import { BandForgeLogoLink } from "@/components/bandforge/bandforge-logo-link";

/** Hub header — back, centered logo, search. Back goes to /test from test hubs. */
export function ContentLibraryHeader() {
  const pathname = usePathname();
  const isCatalog = pathname === "/test" || pathname === "/test/";
  const backHref = isCatalog ? "/dashboard" : "/test";
  const backLabel = isCatalog ? "Back to dashboard" : "Back to all tests";

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--exam-border)] bg-white">
      <div className="mx-auto grid h-14 max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-2 px-4">
        <Link
          href={backHref}
          aria-label={backLabel}
          className="inline-flex size-10 items-center justify-center rounded-full border border-[var(--exam-border)] bg-white text-[var(--exam-ink)] transition-colors hover:bg-[var(--exam-surface)]"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </Link>

        <div className="flex justify-center">
          <BandForgeLogoLink size="nav" />
        </div>

        <Link
          href="/dashboard"
          aria-label="Go to dashboard"
          className="inline-flex size-10 items-center justify-center rounded-full border border-[var(--exam-border)] bg-white text-[var(--exam-ink)] transition-colors hover:bg-[var(--exam-surface)]"
        >
          <Search className="size-[1.125rem]" aria-hidden />
        </Link>
      </div>
    </header>
  );
}
