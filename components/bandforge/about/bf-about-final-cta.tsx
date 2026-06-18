import Link from "next/link";
import { Suspense } from "react";
import { BfMarketingDarkCta } from "@/components/bandforge/ui/bf-marketing-dark-cta";
import { marketingAppHref } from "@/components/bandforge/bf-marketing-auth-links";
import { getMarketingSessionUser } from "@/lib/marketing-auth-server";
import { isAuthEnabled } from "@/lib/flags";

async function AboutCtaButton() {
  const user = await getMarketingSessionUser();
  const href = !isAuthEnabled() || user ? "/dashboard" : marketingAppHref();

  return (
    <Link
      href={href}
      prefetch
      className="inline-flex items-center justify-center rounded-full bg-cyan px-10 py-[17px] font-display text-lg font-semibold text-white no-underline shadow-[0_14px_32px_rgb(0_151_167/0.4)] transition-colors hover:bg-brand-sky-hover"
    >
      Take the Free Diagnostic
    </Link>
  );
}

export function BfAboutFinalCta() {
  return (
    <BfMarketingDarkCta headline="Ready to know your real band score?">
      <Suspense
        fallback={
          <div
            className="mx-auto h-14 w-56 animate-pulse rounded-full bg-white/10"
            aria-hidden
          />
        }
      >
        <AboutCtaButton />
      </Suspense>
    </BfMarketingDarkCta>
  );
}
