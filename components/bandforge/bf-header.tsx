"use client";

import Link from "next/link";
import { IconArrowRight, IconClose, IconMenu } from "@/components/icons";
import { useAuthSession } from "@/components/auth/auth-session-provider";
import { isAuthEnabled } from "@/lib/flags";
import { cn } from "@/lib/utils";
import { useStartMockAuth } from "@/components/bandforge/auth/start-mock-auth-context";

const nav = [
  { href: "/features", label: "Features" },
  { href: "/ai-feedback", label: "AI feedback" },
  { href: "/how-it-works", label: "How it works" },
] as const;

const mobileExtra = [
  { href: "/why", label: "Why BandForge" },
  { href: "/demo", label: "Product tour" },
  { href: "/mobile", label: "Mobile" },
  { href: "/stories", label: "Stories" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

function NavLinks({
  className,
  linkClassName,
}: {
  className?: string;
  linkClassName: string;
}) {
  return (
    <nav className={cn("items-center gap-0.5", className)} aria-label="Primary">
      {nav.map((item) => (
        <Link key={item.href} href={item.href} className={linkClassName}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function HeaderAuthCta({
  className,
  compact,
}: {
  className: string;
  compact?: boolean;
}) {
  const { openStartMockModal } = useStartMockAuth();
  const { user, loading, isAuthenticated } = useAuthSession();
  const authOn = isAuthEnabled();

  if (!authOn) {
    return (
      <Link
        href="/dashboard"
        className={cn(
          "group inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-[0.8125rem] font-semibold text-white shadow-[0_16px_40px_-22px_rgb(13_31_60_/_0.8)] transition-colors duration-200 hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 xl:px-5",
          className,
        )}
      >
        {compact ? "Dashboard" : "Start mock"}
        <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </Link>
    );
  }

  if (loading) {
    return (
      <span
        className={cn(
          "inline-flex min-h-10 items-center rounded-full bg-navy/10 px-4 py-2.5 text-[0.8125rem] font-semibold text-ink/40",
          className,
        )}
        aria-hidden
      >
        …
      </span>
    );
  }

  if (isAuthenticated && user) {
    const label = user.full_name?.split(" ")[0] ?? "Dashboard";
    return (
      <Link
        href="/dashboard"
        className={cn(
          "group inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-[0.8125rem] font-semibold text-white shadow-[0_16px_40px_-22px_rgb(13_31_60_/_0.8)] transition-colors duration-200 hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 xl:px-5",
          className,
        )}
      >
        {compact ? "Dashboard" : `Hi, ${label}`}
        <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={openStartMockModal}
      className={cn(
        "group inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-[0.8125rem] font-semibold text-white shadow-[0_16px_40px_-22px_rgb(13_31_60_/_0.8)] transition-colors duration-200 hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 xl:px-5",
        className,
      )}
    >
      Sign in / up
      <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
    </button>
  );
}

export function BandForgeHeader() {
  const desktopLink =
    "cursor-pointer rounded-full px-3 py-2 text-[0.8125rem] font-medium text-ink/62 transition-colors duration-200 hover:bg-navy/5 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 motion-reduce:transition-none xl:px-4";

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-border/70 bg-white/82 text-ink backdrop-blur-xl">
      <div className="relative mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-2 px-4 sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex shrink-0 flex-col gap-0 leading-none transition-opacity duration-200 hover:opacity-80"
        >
          <span className="text-lg font-bold tracking-tight sm:text-xl">
            Band<span className="text-teal">Forge</span>
          </span>
          <span className="text-[0.625rem] font-medium uppercase tracking-[0.14em] text-ink/42">
            by MATA Labs
          </span>
        </Link>

        <NavLinks
          className="absolute left-1/2 hidden -translate-x-1/2 lg:flex"
          linkClassName={desktopLink}
        />

        <div className="hidden shrink-0 items-center gap-1.5 lg:flex xl:gap-2">
          <HeaderAuthCta className="" />
        </div>

        <details className="group relative lg:hidden">
          <summary className="touch-target flex cursor-pointer list-none items-center justify-center rounded-lg border border-border p-2 text-navy shadow-[var(--shadow-soft)] [&::-webkit-details-marker]:hidden">
            <span className="sr-only">Open menu</span>
            <IconMenu className="h-5 w-5 group-open:hidden" />
            <IconClose className="hidden h-5 w-5 group-open:block" />
          </summary>
          <div className="absolute right-0 top-full z-50 mt-2 w-64 max-h-[min(70vh,420px)] overflow-y-auto rounded-xl border border-border bg-white py-2 shadow-[var(--shadow-elevated)]">
            <ul className="border-b border-border px-1 pb-2">
              {nav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block cursor-pointer rounded-lg px-3 py-2.5 text-body font-medium text-ink hover:bg-surface hover:text-teal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="px-1 pt-2">
              {mobileExtra.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block cursor-pointer rounded-lg px-3 py-2.5 text-body font-medium text-ink/80 hover:bg-surface hover:text-teal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-2 space-y-2 border-t border-border px-3 pt-3">
              <HeaderAuthCta className="flex w-full justify-center" compact />
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
