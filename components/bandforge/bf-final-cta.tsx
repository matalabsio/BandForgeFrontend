import Link from "next/link";
import { BfMarketingDarkCta } from "@/components/bandforge/ui/bf-marketing-dark-cta";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";

function FinalCtaButton({ mobile }: { mobile?: boolean }) {
  return (
    <Link
      href={diagnosticPaths.landing}
      prefetch
      className={
        mobile
          ? "flex w-full items-center justify-center rounded-full bg-cyan px-6 py-[17px] font-display text-[1.0625rem] font-semibold text-white no-underline shadow-[0_10px_26px_rgb(0_151_167/0.36)] transition-colors hover:bg-brand-sky-hover"
          : "inline-flex items-center justify-center rounded-full bg-cyan px-9 py-[19px] font-display text-lg font-semibold text-white no-underline shadow-[0_14px_32px_rgb(0_151_167/0.4)] transition-colors hover:bg-brand-sky-hover"
      }
    >
      Take the Free Diagnostic Test
    </Link>
  );
}

export function BandForgeFinalCta() {
  return (
    <BfMarketingDarkCta
      id="final-cta"
      headline="If you took the IELTS today, what would your band be?"
      className="scroll-mt-20"
    >
      <div className="lg:hidden">
        <FinalCtaButton mobile />
      </div>
      <div className="hidden lg:block">
        <FinalCtaButton />
      </div>
      <p className="mt-3.5 text-[0.8125rem] text-[#7e93ad] lg:mt-4 lg:text-sm">
        No account needed to start. Results in minutes.
      </p>
    </BfMarketingDarkCta>
  );
}
