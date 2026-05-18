import Link from "next/link";
import { SiteNavigation } from "@/components/layout/site-navigation";
import { IconArrowRight, IconClose, IconMenu } from "@/components/icons";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#products", label: "Products" },
  { href: "#contact", label: "Contact" },
] as const;

/** IELTS-style header: solid navy bar, centred nav, white primary CTA */
export function LandingHeader() {
  return (
    <header className="z-50 shrink-0 overflow-visible bg-navy text-white">
      <nav
        className="relative flex h-14 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="shrink-0 text-lg font-bold tracking-tight transition-opacity duration-200 hover:opacity-90 sm:text-xl"
        >
          MATA Labs
        </Link>

        <div className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
          <SiteNavigation variant="dark" />
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/dashboard"
            className="group inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-sm bg-white px-5 py-2.5 text-body font-semibold text-navy transition-colors duration-200 hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            Book a mock
            <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </Link>
        </div>

        <details className="group relative lg:hidden">
          <summary className="touch-target flex cursor-pointer list-none items-center justify-center rounded-sm border border-white/25 p-2 text-white [&::-webkit-details-marker]:hidden">
            <span className="sr-only">Open menu</span>
            <IconMenu className="h-5 w-5 group-open:hidden" />
            <IconClose className="hidden h-5 w-5 group-open:block" />
          </summary>
          <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-white py-2 shadow-[var(--shadow-elevated)]">
            <ul>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block cursor-pointer px-4 py-3 text-body font-medium text-ink hover:bg-surface hover:text-teal"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/dashboard"
                  className="block cursor-pointer px-4 py-3 text-body font-medium text-teal hover:bg-surface"
                >
                  BandForge
                </Link>
              </li>
            </ul>
            <Link href="/dashboard" className="mx-3 mt-2 block">
              <Button
                variant="primary"
                className="w-full min-w-0 rounded-sm bg-navy text-white hover:bg-navy/90"
              >
                Book a mock
              </Button>
            </Link>
          </div>
        </details>
      </nav>
    </header>
  );
}
