import Link from "next/link";
import { Suspense } from "react";
import { BfHeaderMobileMenu } from "@/components/bandforge/bf-header-mobile-menu";
import { BandForgeLogoLink } from "@/components/bandforge/bandforge-logo-link";
import {
  BF_MARKETING_NAV,
  BF_MARKETING_NAV_MOBILE_EXTRA,
} from "@/components/bandforge/bf-marketing-nav";
import { BfHeaderAuthCta } from "@/components/bandforge/bf-header-auth-cta";

const desktopLink =
  "cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 hover:text-gray-700";

/** Server header — CTA reflects cookie session (no client getMe on anonymous visits). */
export function BandForgeHeaderMarketing() {
  return (
    <header className="sticky top-0 z-[100] w-full shrink-0 border-b border-gray-200/70 bg-white/95 text-ink shadow-[0_1px_0_rgb(13_31_60/0.04)] backdrop-blur-md supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-8 md:py-5">
        <BandForgeLogoLink priority size="md" />

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {BF_MARKETING_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={desktopLink}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-1.5 md:flex">
          <Suspense
            fallback={
              <span
                className="inline-flex min-h-10 w-24 animate-pulse rounded-full bg-navy/10"
                aria-hidden
              />
            }
          >
            <BfHeaderAuthCta />
          </Suspense>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Suspense
            fallback={
              <span
                className="inline-flex h-9 w-24 animate-pulse rounded-full bg-navy/10"
                aria-hidden
              />
            }
          >
            <BfHeaderAuthCta compact />
          </Suspense>
          <BfHeaderMobileMenu
            items={[...BF_MARKETING_NAV, ...BF_MARKETING_NAV_MOBILE_EXTRA]}
          />
        </div>
      </div>
    </header>
  );
}
