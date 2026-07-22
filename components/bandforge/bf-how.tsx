import {
  BfMarketingStepTimeline,
  BfSectionEyebrow,
  BfSectionHeading,
  BfStepIndicator,
} from "@/components/bandforge/ui";
import { PLAYBOOK_HOW_STEPS } from "@/lib/seo/marketing-pricing";

export function BandForgeHow() {
  return (
    <section id="how" className="bf-section scroll-mt-20 bg-white">
      <div className="bf-container">
        <div className="mb-7 lg:mx-auto lg:mb-[54px] lg:max-w-3xl lg:text-center">
          <BfSectionEyebrow className="mb-3">
            <span className="lg:hidden">How it works</span>
            <span className="hidden lg:inline">WHY IT WORKS</span>
          </BfSectionEyebrow>
          <BfSectionHeading>Six steps, start to band score</BfSectionHeading>
        </div>
        <BfMarketingStepTimeline steps={PLAYBOOK_HOW_STEPS} />
        <div className="hidden lg:block">
          <BfStepIndicator steps={PLAYBOOK_HOW_STEPS} />
        </div>
      </div>
    </section>
  );
}
