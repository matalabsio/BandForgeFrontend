import Link from "next/link";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import {
  DUAL_BUNDLE_SLUG,
  FULL_SKILL_PROGRAM_SLUG,
  SPEAKING_SKILL_SLUG,
  WRITING_SKILL_SLUG,
} from "@/lib/diagnostic-sku-offer";
import {
  pricingHrefForSku,
  type PaywallSkuSlug,
} from "@/lib/entitlement";
import { resolvePlanPaywallKind } from "@/lib/plan-paywall";

export { resolvePlanPaywallKind } from "@/lib/plan-paywall";

type PaywallCopy = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
};

const SKU_PAYWALL: Record<PaywallSkuSlug, Omit<PaywallCopy, "ctaHref">> = {
  [WRITING_SKILL_SLUG]: {
    eyebrow: "Writing Skill",
    title: "Unlock Writing practice",
    body: "Purchase Writing Skill to open Task 1 + Task 2 hubs, AI feedback, and your Writing mock.",
    ctaLabel: "Buy Writing Skill",
  },
  [SPEAKING_SKILL_SLUG]: {
    eyebrow: "Speaking Skill",
    title: "Unlock Speaking practice",
    body: "Purchase Speaking Skill to open Part 1–3 practice, AI feedback, and your Speaking mock.",
    ctaLabel: "Buy Speaking Skill",
  },
  [DUAL_BUNDLE_SLUG]: {
    eyebrow: "Dual Bundle",
    title: "Unlock Writing + Speaking",
    body: "Purchase Dual Bundle to open both Writing and Speaking skill courses in one plan.",
    ctaLabel: "Buy Dual Bundle",
  },
  [FULL_SKILL_PROGRAM_SLUG]: {
    eyebrow: "Full Skill Program",
    title: "Unlock your personalised plan",
    body: "Purchase the Full Skill Program for all four skills, today’s plan, and full mock unlocks.",
    ctaLabel: "Buy Full Skill Program",
  },
};

/**
 * Paywall when the user lacks the SKU for this route.
 * Defaults to FSP purchase CTA; pass targetSlug for Writing/Speaking/Dual.
 * Pass hasDiagnostic only from the dashboard diagnostic unpaid flow.
 */
export function DashboardPlanPaywall({
  hasDiagnostic,
  targetSlug = FULL_SKILL_PROGRAM_SLUG,
}: {
  hasDiagnostic?: boolean;
  /** SKU the user needs to buy for this route. */
  targetSlug?: PaywallSkuSlug;
}) {
  const kind = resolvePlanPaywallKind({ targetSlug, hasDiagnostic });

  if (kind === "diagnostic_start") {
    return (
      <PaywallShell
        eyebrow="Free baseline"
        title="No diagnostic results yet"
        body="Complete the free diagnostic to see your skill bands, then unlock a personalised Full Skill Program on your dashboard."
        ctaLabel="Start diagnostic"
        ctaHref={diagnosticPaths.landing}
        showDiagnosticHints
      />
    );
  }

  if (kind === "diagnostic_unlock") {
    return (
      <PaywallShell
        eyebrow="Next step"
        title="Your diagnostic is ready"
        body="Unlock the Full Skill Program to open your personalised dashboard, study plan, and practice path."
        ctaLabel="Unlock Full Skill Program"
        ctaHref={diagnosticPaths.planReveal}
      />
    );
  }

  const copy = SKU_PAYWALL[targetSlug];
  return (
    <PaywallShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      body={copy.body}
      ctaLabel={copy.ctaLabel}
      ctaHref={pricingHrefForSku(targetSlug)}
      secondaryHref="/pricing"
      secondaryLabel="See all plans"
    />
  );
}

function PaywallShell({
  eyebrow,
  title,
  body,
  ctaLabel,
  ctaHref,
  secondaryHref,
  secondaryLabel,
  showDiagnosticHints = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  showDiagnosticHints?: boolean;
}) {
  return (
    <section className="relative overflow-hidden rounded-[22px] border border-[#E2EAF2] bg-[linear-gradient(165deg,#F7FBFD_0%,#FFFFFF_42%,#EEF9FB_100%)] px-5 py-10 sm:px-10 sm:py-12">
      <div
        className="pointer-events-none absolute -top-24 right-[-10%] size-[280px] rounded-full bg-[radial-gradient(circle,rgba(0,169,192,0.18)_0%,transparent_70%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 left-[-8%] size-[240px] rounded-full bg-[radial-gradient(circle,rgba(13,31,60,0.08)_0%,transparent_70%)]"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-xl flex-col items-center text-center">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-cyan uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-[1.75rem] leading-[1.12] font-bold tracking-[-0.03em] text-[#0D1F3C] sm:text-[2.125rem]">
          {title}
        </h2>
        <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-[#5A6B82] sm:text-base">
          {body}
        </p>

        <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
          <Link
            href={ctaHref}
            prefetch
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-cyan px-7 text-[0.9375rem] font-semibold text-white shadow-[0_10px_24px_rgb(0_151_167/0.28)] transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-brand-sky-hover"
          >
            {ctaLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              prefetch
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-[#E2EAF2] bg-white px-7 text-[0.9375rem] font-semibold text-[#0D1F3C] transition-colors hover:border-cyan/40"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>

        {showDiagnosticHints ? (
          <ul className="mt-9 grid w-full gap-2.5 text-left sm:grid-cols-3 sm:gap-3">
            {[
              "Listening + Reading",
              "Writing + Speaking",
              "~45 minutes total",
            ].map((item) => (
              <li
                key={item}
                className="rounded-xl border border-[#E2EAF2]/80 bg-white/70 px-3.5 py-3 text-center text-[12.5px] font-medium text-[#475569] sm:text-[13px]"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
