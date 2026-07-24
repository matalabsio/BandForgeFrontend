import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BandForgeHow } from "@/components/bandforge/bf-how";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BRAND_HOW_STEPS } from "@/lib/brand-mock-data";
import { PLAYBOOK_HOW_STEPS } from "@/lib/seo/marketing-pricing";

function HowItWorksCta() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Link
        href="/diagnostic"
        prefetch
        className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-cyan px-6 text-sm font-semibold text-white no-underline transition-colors duration-200 hover:bg-brand-sky-hover"
      >
        Take free diagnostic
        <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
      </Link>
      <Link
        href="/pricing"
        prefetch
        className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-border-soft bg-white px-6 text-sm font-semibold text-navy no-underline transition-colors duration-200 hover:border-cyan/40"
      >
        View pricing
      </Link>
    </div>
  );
}

/** Dedicated `/how-it-works` experience — six-step journey + CTAs. */
export function HowItWorksExperience() {
  return (
    <BandForgeRouteShell
      activeHref="/how-it-works"
      eyebrow="How it works"
      title="Six steps, start to band score"
      description="Start with a free diagnostic, get a plan for your weak spots, then practise with AI feedback and Band 9 human review — until your score moves."
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
              <li
                key={step.n}
                className="flex gap-4 rounded-[1.125rem] border border-border-soft bg-white p-4 sm:gap-5 sm:p-5"
              >
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
