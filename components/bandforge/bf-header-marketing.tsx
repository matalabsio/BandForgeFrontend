import Link from "next/link";
import { Suspense } from "react";
import { BfHeaderMobileMenu } from "@/components/bandforge/bf-header-mobile-menu";
import { BfMarketingWordmark } from "@/components/bandforge/bf-marketing-wordmark";
import {
  BF_MARKETING_NAV,
  BF_MARKETING_NAV_MOBILE_EXTRA,
} from "@/components/bandforge/bf-marketing-nav";
import { BfHeaderAuthCta } from "@/components/bandforge/bf-header-auth-cta";

const navLink =
  "text-[0.9375rem] font-medium text-muted no-underline transition-colors hover:text-navy";
const navLinkActive =
  "text-[0.9375rem] font-semibold text-navy no-underline transition-colors";

type Props = {
  activeHref?: string;
};

/** Server header — logo left; nav links + CTA grouped on the right. */
export function BandForgeHeaderMarketing({ activeHref }: Props) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border-soft bg-white/92 backdrop-blur-[10px] lg:bg-white/90 lg:backdrop-blur-[12px]">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3 px-4 py-3.5 sm:px-5 lg:px-10 lg:py-4">
        <BfMarketingWordmark />

        <div className="hidden items-center gap-[34px] lg:flex">
          <nav className="flex items-center gap-[34px]" aria-label="Primary">
            {BF_MARKETING_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={
                  activeHref === item.href ||
                  (activeHref === "/about" && item.href === "/about")
                    ? navLinkActive
                    : navLink
                }
                aria-current={
                  activeHref === item.href ||
                  (activeHref === "/about" && item.href === "/about")
                    ? "page"
                    : undefined
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Suspense
            fallback={
              <span
                className="inline-flex h-10 w-[6.5rem] animate-pulse rounded-full bg-gray-100"
                aria-hidden
              />
            }
          >
            <BfHeaderAuthCta />
          </Suspense>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Suspense
            fallback={
              <span
                className="inline-flex h-8 w-[4.5rem] animate-pulse rounded-full bg-gray-100"
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
