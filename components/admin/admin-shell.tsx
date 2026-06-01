import Link from "next/link";
import type { ReactNode } from "react";
import { BandForgeLogoLink } from "@/components/bandforge/bandforge-logo-link";

const adminNav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/candidates", label: "Candidates" },
  { href: "/admin/tests", label: "Tests" },
  { href: "/admin/questions", label: "Questions" },
] as const;

type AdminShellProps = {
  children: ReactNode;
  title?: string;
};

export function AdminShell({ children, title = "Admin" }: AdminShellProps) {
  return (
    <div className="app-surface min-h-dvh">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <BandForgeLogoLink size="sm" />
            <Link href="/admin" className="text-body font-semibold text-navy">
              Admin
            </Link>
          </div>
          <Link
            href="/dashboard"
            className="cursor-pointer text-meta font-medium text-teal transition-colors duration-200 hover:text-teal-light"
          >
            ← Candidate view
          </Link>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:flex-row sm:px-6 sm:py-8">
        <nav
          className="card-premium flex shrink-0 gap-1 overflow-x-auto p-2 sm:w-48 sm:flex-col sm:overflow-visible"
          aria-label="Admin navigation"
        >
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="cursor-pointer whitespace-nowrap rounded-lg px-3 py-2 text-body font-medium text-ink/70 transition-colors duration-200 hover:bg-surface hover:text-navy"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="min-w-0 flex-1">
          <h1 className="text-h2 text-navy">{title}</h1>
          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
