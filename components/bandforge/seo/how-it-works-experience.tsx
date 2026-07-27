import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BandForgeHow } from "@/components/bandforge/bf-how";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { SeoPrimaryCta, SeoSecondaryCta } from "@/components/seo/seo-cta-button";
import { GlowCard, type GlowColor } from "@/components/ui/spotlight-card";
import { BRAND_HOW_STEPS } from "@/lib/brand-mock-data";
import { PLAYBOOK_HOW_STEPS } from "@/lib/seo/marketing-pricing";

const STEP_GLOW: Record<number, GlowColor> = {
  1: "teal",
  2: "cyan",
  3: "navy",
  4: "teal",
  5: "cyan",
  6: "navy",
};

function HowItWorksCta() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <SeoPrimaryCta href="/diagnostic">Take free diagnostic</SeoPrimaryCta>
      <SeoSecondaryCta href="/pricing">View pricing</SeoSecondaryCta>
    </div>
  );
}

/** Dedicated `/how-it-works` experience — six-step journey + CTAs. */
export function HowItWorksExperience() {
  return (
    <BandForgeRouteShell
      activeHref="/how-it-works"
      eyebrow="The BandForge Method"
      title="No two students prep the same way. A personalised study plan in six steps"
      description="Built by a Gold Medallist and Band 9 scorer with a decade of training students face to face. Every step below exists because we've watched exactly where students plateau — and built a system that catches it before you waste weeks on the wrong thing."
      heroCta={<HowItWorksCta />}
    >
      <BandForgeHow hideHeading sectionId="how-steps" />

      <section className="border-t border-border-soft bg-surface-alt/50 bf-section">
        <div className="bf-container mx-auto max-w-3xl">
          <h2 className="font-display text-center text-xl font-bold text-navy sm:text-2xl">
            What happens in each step
          </h2>
          <ol className="mt-8 space-y-4">
            {BRAND_HOW_STEPS.map((step) => (
              <li key={step.n}>
                <GlowCard
                  glass
                  inkBorder
                  customSize
                  glowColor={STEP_GLOW[step.n] ?? "cyan"}
                  className="group bf-liquid-glass w-full !rounded-[1.125rem] !p-4 sm:!p-5"
                >
                  <div
                    className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
                    aria-hidden
                  >
                    <div className="absolute -top-1/3 left-[-10%] h-[70%] w-[120%] rotate-[-8deg] bg-[linear-gradient(180deg,rgb(255_255_255/0.55)_0%,rgb(255_255_255/0.08)_45%,transparent_70%)] opacity-80" />
                    <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                  </div>
                  <div className="relative z-[1] flex gap-4 sm:gap-5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cyan font-mono text-sm font-semibold text-white">
                      {step.n}
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-base font-bold text-navy">
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </GlowCard>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bf-section bg-white">
        <div className="bf-container mx-auto max-w-3xl text-center">
          <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-cyan uppercase">
            From diagnosis to sprint
          </p>
          <h2 className="font-display mt-3 text-xl font-bold text-navy sm:text-2xl">
            A clear loop students can finish
          </h2>
          <ul className="mt-8 grid gap-3 text-left sm:grid-cols-2">
            {PLAYBOOK_HOW_STEPS.map((step) => (
              <li
                key={step.n}
                className="rounded-xl border border-border-soft bg-surface px-4 py-3.5"
              >
                <p className="font-display text-sm font-semibold text-navy">
                  {step.n}. {step.title}
                </p>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex justify-center">
            <HowItWorksCta />
          </div>
        </div>
      </section>
    </BandForgeRouteShell>
  );
}
