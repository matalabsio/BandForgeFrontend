import Link from "next/link";

const links = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/vs-coaching-centres", label: "vs Coaching" },
] as const;

/** Thin conversion strip — replaces full How / Pricing / Comparison sections on home. */
export function BandForgeHomeLinkStrip() {
  return (
    <nav
      aria-label="Explore BandForge"
      className="border-b border-border/70 bg-white/80 py-5"
    >
      <div className="bf-container flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            prefetch
            className="cursor-pointer text-sm font-semibold text-navy underline-offset-4 transition-colors hover:text-cyan hover:underline"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
