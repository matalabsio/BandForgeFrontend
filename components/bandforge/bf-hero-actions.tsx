import { BfHeroStartCta } from "@/components/bandforge/bf-hero-start-cta";
import { bfPrimaryCtaHeroClass } from "@/components/bandforge/bf-primary-cta-styles";

/** Hero CTA — Free diagnostic button → diagnostic landing. */
export function BfHeroActions() {
  return (
    <div className="mt-0 flex justify-center">
      <BfHeroStartCta className={bfPrimaryCtaHeroClass} />
    </div>
  );
}
