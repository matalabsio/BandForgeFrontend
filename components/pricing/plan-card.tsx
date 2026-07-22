"use client";

import { type Plan, formatInr } from "@/lib/payments";

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="mt-0.5 shrink-0 text-cyan"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export type PlanCardCopy = {
  tagline: string;
  features: string[];
  cta: string;
  badge?: "Most popular" | "Best value";
};

export const PLAN_COPY: Record<string, PlanCardCopy> = {
  "writing-sprint": {
    tagline: "Fix the IELTS Writing section that's costing you marks.",
    features: [
      "12 structured Writing tasks over 90 days",
      "AI evaluation instantly on every task",
      "Band 9-trained human review within 48 hours",
      "1 full mock test unlocked on completion",
      "Completion Guarantee — extend free if no improvement",
    ],
    cta: "Buy Writing Sprint",
  },
  "speaking-sprint": {
    tagline: "Real cue-card answers with AI plus human band-descriptor feedback.",
    features: [
      "12 recorded Speaking tasks over 90 days",
      "AI analysis of fluency, grammar, and pronunciation",
      "Band 9-trained human review within 48 hours",
      "1 full mock test unlocked on completion",
      "Completion Guarantee — extend free if no improvement",
    ],
    cta: "Buy Speaking Sprint",
  },
  "dual-sprint": {
    tagline: "Writing and Speaking together — the two skills coaches can't batch-fix.",
    features: [
      "12 tasks across Writing and Speaking over 90 days",
      "AI evaluation instantly on every task",
      "Band 9-trained human review within 48 hours",
      "1 full mock test unlocked on completion",
      "Completion Guarantee — extend free if no improvement",
    ],
    cta: "Buy Dual Sprint",
    badge: "Most popular",
  },
  "all-skills-sprint": {
    tagline: "Listening, Reading, Writing, and Speaking in one focused program.",
    features: [
      "12 tasks across all four IELTS skills over 90 days",
      "AI practice plus Band 9 human review within 48 hours",
      "1 full mock test unlocked on completion",
      "Completion Guarantee — extend free if no improvement",
      "Best value for full-band improvement",
    ],
    cta: "Buy All Skills Sprint",
    badge: "Best value",
  },
  starter_monthly: {
    tagline: "Get started with focused mock practice.",
    features: [
      "Selected mock test access",
      "Listening & Reading instant scoring",
      "Basic score dashboard",
    ],
    cta: "Buy Starter",
  },
  premium_monthly: {
    tagline: "The complete IELTS prep experience.",
    features: [
      "Full mock test access",
      "Writing human review",
      "Speaking human review",
      "Detailed score reports",
      "Progress dashboard",
    ],
    cta: "Buy Premium",
    badge: "Most popular",
  },
  premium_yearly: {
    tagline: "A full year at the best per-month price.",
    features: [
      "Everything in Premium Monthly",
      "12 months access",
      "Best per-month price",
    ],
    cta: "Buy Annual",
    badge: "Best value",
  },
};

type PlanCardProps = {
  plan: Plan;
  isCurrent: boolean;
  disabled: boolean;
  loading: boolean;
  checkoutUnavailable?: boolean;
  onBuy: (slug: string) => void;
};

export function PlanCard({
  plan,
  isCurrent,
  disabled,
  loading,
  checkoutUnavailable = false,
  onBuy,
}: PlanCardProps) {
  const copy = PLAN_COPY[plan.slug] ?? {
    tagline: plan.description ?? "",
    features: [],
    cta: `Buy ${plan.name}`,
  };
  const featured = copy.badge === "Most popular";
  const durationLabel = `${plan.duration_days} days`;

  return (
    <div
      className={[
        "relative flex flex-col rounded-[18px] border bg-white p-7 transition-shadow duration-200",
        featured
          ? "border-cyan shadow-[0_12px_32px_-12px_rgba(0,188,212,0.35)] lg:scale-[1.03]"
          : "border-border-soft shadow-soft hover:shadow-elevated",
      ].join(" ")}
    >
      {copy.badge ? (
        <span
          className={[
            "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em]",
            copy.badge === "Most popular"
              ? "bg-cyan text-navy"
              : "bg-navy text-white",
          ].join(" ")}
        >
          {copy.badge}
        </span>
      ) : null}

      <h3 className="font-display text-lg font-bold text-navy">{plan.name}</h3>
      <p className="mt-1 min-h-[2.5rem] text-[13px] leading-snug text-muted">
        {copy.tagline}
      </p>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="font-display text-[2rem] font-extrabold leading-none text-navy">
          {formatInr(plan.amount)}
        </span>
        <span className="font-mono text-xs text-muted-light">/ {durationLabel}</span>
      </div>

      <ul className="mt-6 flex-1 space-y-2.5">
        {copy.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-[13px] text-ink">
            <CheckIcon />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={disabled || isCurrent}
        onClick={() => onBuy(plan.slug)}
        className={[
          "mt-7 inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors duration-200",
          isCurrent
            ? "cursor-default border border-border-soft bg-surface text-muted"
            : featured
              ? "bg-cyan text-navy hover:bg-brand-sky-hover"
              : "bg-navy text-white hover:bg-navy-deep",
          disabled && !isCurrent ? "cursor-not-allowed opacity-50" : "",
          !disabled && !isCurrent ? "cursor-pointer" : "",
        ].join(" ")}
      >
        {isCurrent
          ? "Current plan"
          : loading
            ? "Opening secure checkout…"
            : checkoutUnavailable
              ? "Checkout unavailable"
              : copy.cta}
      </button>

      <p className="mt-2 text-center font-mono text-[10px] text-muted-light">
        Prices in INR
      </p>
    </div>
  );
}
