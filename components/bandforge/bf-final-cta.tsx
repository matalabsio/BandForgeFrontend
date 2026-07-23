import Link from "next/link";
import { BfMarketingDarkCta } from "@/components/bandforge/ui/bf-marketing-dark-cta";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";

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
        className="flex w-full items-center justify-center rounded-full bg-cyan px-6 py-[17px] font-display text-[1.0625rem] font-semibold text-white no-underline shadow-[0_10px_26px_rgb(0_151_167/0.36)] transition-colors hover:bg-brand-sky-hover lg:inline-flex lg:w-auto lg:px-9 lg:py-[19px] lg:text-lg lg:shadow-[0_14px_32px_rgb(0_151_167/0.4)]"
      >
        Take the Free Diagnostic Test
      </Link>
      <p className="mt-3.5 text-[0.8125rem] text-[#7e93ad] lg:mt-4 lg:text-sm">
        No account needed to start. Results in 24 hours.
      </p>
    </BfMarketingDarkCta>
  );
}
