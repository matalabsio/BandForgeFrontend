import Link from "next/link";
import { BfHeaderMobileMenu } from "@/components/bandforge/bf-header-mobile-menu";
import { BfMarketingWordmark } from "@/components/bandforge/bf-marketing-wordmark";
import { BfMarketingNavIcon } from "@/components/bandforge/bf-marketing-nav-icon";
import {
  BF_MARKETING_NAV,
} from "@/components/bandforge/bf-marketing-nav";
import { BfHeaderAuthCta } from "@/components/bandforge/bf-header-auth-cta";

const navLink =
  "inline-flex cursor-pointer items-center gap-2 text-[0.9375rem] font-medium text-muted no-underline transition-colors duration-200 hover:text-navy";
const navLinkActive =
  "inline-flex cursor-pointer items-center gap-2 text-[0.9375rem] font-semibold text-navy no-underline transition-colors duration-200";

type Props = {
  activeHref?: string;
};

/** Server header — logo left; nav links + CTA grouped on the right. */
export function BandForgeHeaderMarketing({ activeHref }: Props) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border-soft bg-white/92 backdrop-blur-[10px] lg:bg-white/90 lg:backdrop-blur-[12px]">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3 px-4 py-3.5 sm:px-5 lg:px-10 lg:py-4">
        <BfMarketingWordmark />

        <div className="hidden items-center gap-6 lg:flex">
          <nav className="flex items-center gap-7" aria-label="Primary">
            {BF_MARKETING_NAV.map((item) => {
              const active =
                activeHref === item.href ||
                (activeHref === "/about" && item.href === "/about");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  className={active ? navLinkActive : navLink}
                  aria-current={active ? "page" : undefined}
                >
                  <BfMarketingNavIcon name={item.icon} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <BfHeaderAuthCta />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <BfHeaderAuthCta compact />
          <BfHeaderMobileMenu items={BF_MARKETING_NAV} />
        </div>
      </div>
    </header>
  );
}
