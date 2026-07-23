import Link from "next/link";
import { BfMarketingDarkCta } from "@/components/bandforge/ui/bf-marketing-dark-cta";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";

export function BfAboutFinalCta() {
  return (
    <BfMarketingDarkCta headline="Ready to know your real band score?">
      <Link
        href={diagnosticPaths.landing}
        prefetch
        className="inline-flex items-center justify-center rounded-full bg-cyan px-10 py-[17px] font-display text-lg font-semibold text-white no-underline shadow-[0_14px_32px_rgb(0_151_167/0.4)] transition-colors hover:bg-brand-sky-hover"
      >
        Take the Free Diagnostic
      </Link>
    </BfMarketingDarkCta>
  );
}
