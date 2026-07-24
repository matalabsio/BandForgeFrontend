"use client";

import { Check } from "lucide-react";
import { type Plan, formatInr } from "@/lib/payments";
import { cn } from "@/lib/utils";

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
    tagline: "Writing and Speaking together — the two skills coaches can't batch-test.",
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
    <article
      className={cn(
        "relative flex h-full flex-col rounded-[1.25rem] border bg-white p-5 transition-[border-color,box-shadow] duration-200 sm:p-6 lg:p-7",
        featured
          ? "border-cyan shadow-[0_18px_40px_-20px_rgb(0_188_212/0.45)] ring-1 ring-cyan/20"
          : "border-border-soft shadow-[0_10px_28px_-22px_rgb(13_31_60/0.35)] hover:border-cyan/30 hover:shadow-[0_14px_32px_-22px_rgb(13_31_60/0.4)]",
      )}
    >
      {copy.badge ? (
        <span
          className={cn(
            "absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 font-mono text-[0.625rem] font-bold tracking-[0.12em] uppercase",
            copy.badge === "Most popular"
              ? "bg-cyan text-white"
              : "bg-navy text-white",
          )}
        >
          {copy.badge}
        </span>
      ) : null}

      <h3 className="font-display text-lg font-bold tracking-tight text-navy sm:text-[1.125rem]">
        {plan.name}
      </h3>
      <p className="mt-1.5 min-h-[2.75rem] text-[0.8125rem] leading-snug text-muted sm:text-[0.84375rem]">
        {copy.tagline}
      </p>

      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="font-display text-[2rem] leading-none font-extrabold tracking-[-0.03em] text-navy sm:text-[2.125rem]">
          {formatInr(plan.amount)}
        </span>
        <span className="font-mono text-[0.6875rem] text-muted-light sm:text-xs">
          / {durationLabel}
        </span>
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-2.5">
        {copy.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-[0.8125rem] leading-snug text-[#3f4f63] sm:text-[0.84375rem]"
          >
            <Check
              className="mt-0.5 size-4 shrink-0 text-cyan"
              strokeWidth={2.5}
              aria-hidden
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={disabled || isCurrent}
        onClick={() => onBuy(plan.slug)}
        className={cn(
          "mt-7 inline-flex h-11 w-full items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2",
          isCurrent
            ? "cursor-default border border-border-soft bg-surface text-muted"
            : featured
              ? "cursor-pointer bg-cyan text-white hover:bg-brand-sky-hover"
              : "cursor-pointer bg-navy text-white hover:bg-navy-deep",
          disabled && !isCurrent ? "cursor-not-allowed opacity-50" : "",
        )}
      >
        {isCurrent
          ? "Current plan"
          : loading
            ? "Opening secure checkout…"
            : checkoutUnavailable
              ? "Checkout unavailable"
              : copy.cta}
      </button>

      <p className="mt-2.5 text-center font-mono text-[0.625rem] text-muted-light">
        Prices in INR · Secure Razorpay checkout
      </p>
    </article>
  );
}
