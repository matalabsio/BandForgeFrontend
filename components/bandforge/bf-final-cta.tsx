import Link from "next/link";
import { BfMarketingDarkCta } from "@/components/bandforge/ui/bf-marketing-dark-cta";
import { bfPrimaryCtaHeroClass } from "@/components/bandforge/bf-primary-cta-styles";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import { cn } from "@/lib/utils";

export function BandForgeFinalCta() {
  return (
    <BfMarketingDarkCta
      id="final-cta"
      headline="If you took the IELTS today, what would your band be?"
      className="scroll-mt-20"
    >
      <Link
        href={diagnosticPaths.landing}
        prefetch
        className={cn(bfPrimaryCtaHeroClass, "font-display lg:text-lg")}
      >
        Take the Free Diagnostic Test
      </Link>
      <p className="mt-3.5 text-[0.8125rem] text-[#7e93ad] lg:mt-4 lg:text-sm">
        No account needed to start. Results in 24 hours.
      </p>
    </BfMarketingDarkCta>
  );
}
