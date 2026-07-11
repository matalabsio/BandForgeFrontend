import { Clock } from "lucide-react";
import { BfHeroActions } from "@/components/bandforge/bf-hero-actions";
import { BfHeroDiagnosticCard } from "@/components/bandforge/bf-hero-diagnostic-card";
import { BfSectionEyebrow } from "@/components/bandforge/ui";

export function BandForgeHero() {
  return (
    <section
      className="relative overflow-hidden bg-white bf-section !pt-[46px] lg:!pt-[5.5rem]"
      aria-labelledby="bf-hero-heading"
    >
      <div className="bf-container">
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="min-w-0 text-left lg:mx-0 lg:max-w-none">
            <div className="mb-4 flex items-center gap-2 sm:mb-5 lg:mb-6">
              <Clock className="size-3.5 shrink-0 text-cyan" strokeWidth={2.25} aria-hidden />
              <BfSectionEyebrow className="mb-0">
                IELTS Diagnostic · 90 minutes
              </BfSectionEyebrow>
            </div>
            <h1
              id="bf-hero-heading"
              className="font-display mb-4 text-[1.875rem] leading-[1.1] font-bold tracking-[-0.03em] text-balance text-navy sm:mb-[18px] sm:text-[2.125rem] sm:leading-[1.08] lg:mb-6 lg:text-[3.5rem] lg:tracking-[-0.035em]"
            >
              If you took the IELTS today, what would your band be?
            </h1>
            <p className="mb-0 text-[0.9375rem] leading-[1.6] text-muted sm:text-base lg:max-w-[46ch] lg:text-[1.1875rem]">
              A free diagnostic test that tells you exactly where you stand — across all
              four sections — in 90 minutes.
            </p>
            <BfHeroActions />
          </div>

          <div className="flex justify-center lg:justify-end">
            <BfHeroDiagnosticCard className="w-full max-w-[min(100%,19rem)] sm:max-w-md lg:max-w-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
