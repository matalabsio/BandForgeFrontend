"use client";

import { Check, ChevronRight } from "lucide-react";
import { formatInr } from "@/lib/payments";
import type { PricingDisplayPlan } from "@/lib/pricing-catalog";
import { PlanCheckoutStrip } from "@/components/pricing/plan-checkout-strip";
import { cn } from "@/lib/utils";

function planBadge(slug: string): "Popular" | "Best value" | null {
  if (slug === "dual_bundle") return "Popular";
  if (slug === "full_skill_program") return "Best value";
  return null;
}

type PlanCardProps = {
  plan: PricingDisplayPlan;
  isSelected: boolean;
  isCurrent: boolean;
  loading: boolean;
  checkoutUnavailable: boolean;
  onSelect: (slug: string) => void;
  onCheckout: (slug: string) => void;
};

export function PlanCard({
  plan,
  isSelected,
  isCurrent,
  loading,
  checkoutUnavailable,
  onSelect,
  onCheckout,
}: PlanCardProps) {
  const badge = planBadge(plan.slug);
  const highlighted = badge === "Popular";
  const previewFeatures = plan.features.slice(0, 3);
  const canCheckout = plan.isActive && !checkoutUnavailable && !isCurrent;
  const stripDisabled =
    isCurrent || plan.comingSoon || loading || !canCheckout;

  const checkoutLabel = isCurrent
    ? "Current plan"
    : plan.comingSoon
      ? "Coming soon"
      : loading
        ? "Opening…"
        : checkoutUnavailable
          ? "Unavailable"
          : plan.cta;

  return (
    <article
      id={`plan-${plan.slug}`}
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_10px_28px_-18px_rgb(13_31_60/0.28)] transition-[box-shadow,border-color,transform] duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgb(13_31_60/0.32)] motion-reduce:transform-none motion-reduce:hover:translate-y-0",
        highlighted ? "border-cyan/45" : "border-border-soft",
        isSelected && "border-cyan ring-1 ring-cyan/20",
        plan.comingSoon && "opacity-90",
      )}
    >
      <div className="flex flex-1 flex-col p-6 sm:p-7 lg:p-8">
        {badge ? (
          <span
            className={cn(
              "mb-3 inline-flex w-fit rounded-md px-2.5 py-0.5 text-[0.6875rem] font-semibold tracking-wide uppercase",
              badge === "Popular" ? "bg-cyan/10 text-cyan" : "bg-navy/8 text-navy",
            )}
          >
            {badge}
          </span>
        ) : (
          <span className="mb-3 block h-[1.375rem]" aria-hidden />
        )}

        <h3 className="font-display text-lg font-bold tracking-tight text-navy sm:text-[1.125rem]">
          {plan.name}
        </h3>
        <p className="mt-1.5 text-[0.8125rem] leading-snug text-muted sm:text-[0.875rem]">
          {plan.subtitle}
        </p>

        <div className="mt-5 flex items-baseline gap-1.5">
          <span className="font-display text-[1.875rem] font-bold tracking-tight text-navy sm:text-[2rem]">
            {formatInr(plan.amount)}
          </span>
          <span className="text-xs text-muted-light">one-time</span>
        </div>

        <ul className="mt-5 flex flex-1 flex-col gap-2">
          {previewFeatures.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-[0.8125rem] leading-snug text-muted"
            >
              <Check
                className="mt-0.5 size-3.5 shrink-0 text-cyan/80"
                strokeWidth={2.5}
                aria-hidden
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onSelect(plan.slug)}
          aria-expanded={isSelected}
          aria-haspopup="dialog"
          className="mt-5 inline-flex min-h-8 cursor-pointer items-center gap-1 self-start py-1 text-sm font-semibold text-cyan transition-colors hover:text-brand-sky-hover focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40"
        >
          View details
          <ChevronRight className="size-3.5" strokeWidth={2.25} aria-hidden />
        </button>
      </div>

      <div className="mt-auto border-t border-border-soft">
        <PlanCheckoutStrip
          amountPaise={plan.amount}
          label={checkoutLabel}
          disabled={stripDisabled}
          onCheckout={() => onCheckout(plan.slug)}
        />
      </div>
    </article>
  );
}
