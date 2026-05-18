"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/scores", label: "Scores" },
] as const;

const practiceNav = [
  { href: "/test/reading", label: "Reading" },
  { href: "/test/listening", label: "Listening" },
  { href: "/test/writing", label: "Writing" },
  { href: "/test/speaking", label: "Speaking" },
] as const;

function NavLink({
  href,
  label,
  compact,
}: {
  href: string;
  label: string;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "cursor-pointer rounded-lg px-3 py-2.5 text-body font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2",
        compact ? "text-center text-meta" : "block",
        active
          ? "bg-teal/10 text-teal"
          : "text-ink/70 hover:bg-white hover:text-navy",
      )}
    >
      {label}
    </Link>
  );
}

export function CandidateSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="card-premium sticky top-24 space-y-6 p-4" aria-label="Candidate">
        <div>
          <p className="px-3 text-meta font-semibold uppercase tracking-wider text-ink/45">
            Main
          </p>
          <ul className="mt-2 space-y-0.5">
            {mainNav.map((item) => (
              <li key={item.href}>
                <NavLink {...item} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="px-3 text-meta font-semibold uppercase tracking-wider text-ink/45">
            Practice
          </p>
          <ul className="mt-2 space-y-0.5">
            {practiceNav.map((item) => (
              <li key={item.href}>
                <NavLink {...item} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="px-3 text-meta font-semibold uppercase tracking-wider text-ink/45">
            Admin
          </p>
          <ul className="mt-2 space-y-0.5">
            <li>
              <NavLink href="/admin" label="Management" />
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}

export function CandidateMobileNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-white/95 px-2 py-2 backdrop-blur-sm lg:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="grid grid-cols-4 gap-1">
        {[
          { href: "/dashboard", label: "Home" },
          { href: "/scores", label: "Scores" },
          { href: "/test/reading", label: "Test" },
          { href: "/admin", label: "Admin" },
        ].map((item) => (
          <li key={item.href}>
            <NavLink {...item} compact />
          </li>
        ))}
      </ul>
    </nav>
  );
}
