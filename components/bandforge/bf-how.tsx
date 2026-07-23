import {
  BfSectionEyebrow,
  BfSectionHeading,
  BfStepIndicator,
} from "@/components/bandforge/ui";
import { BfHowScrollStack } from "@/components/bandforge/bf-how-scroll-stack";
import { BRAND_HOW_STEPS } from "@/lib/brand-mock-data";

export function BandForgeHow() {
  return (
    <section id="how" className="bf-ambient bf-section scroll-mt-20 bg-white">
      <div className="bf-container">
        <div className="bf-section-head mb-7 lg:mb-[54px]">
          <BfSectionEyebrow className="mb-3">How it works</BfSectionEyebrow>
          <BfSectionHeading>Six steps, start to band score</BfSectionHeading>
        </div>

        {/* Desktop — classic step row */}
        <div className="hidden lg:block">
          <BfStepIndicator steps={BRAND_HOW_STEPS} />
        </div>
      </div>

      {/* Mobile — ScrollStack cards (same step copy) */}
      <div className="lg:hidden">
        <div className="bf-container">
          <BfHowScrollStack />
        </div>
      </div>
    </section>
  );
}
