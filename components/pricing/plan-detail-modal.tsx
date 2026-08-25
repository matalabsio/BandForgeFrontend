"use client";

import { ChevronRight, X } from "lucide-react";
import { useEffect } from "react";

import type { PricingDisplayPlan } from "@/lib/pricing-catalog";
import { formatInr } from "@/lib/payments";
import {
  pricingCtaCyanClass,
  pricingCtaMutedClass,
  pricingCtaNavyClass,
} from "@/components/pricing/pricing-cta-styles";
import { cn } from "@/lib/utils";

type PlanDetailModalProps = {
  plan: PricingDisplayPlan | null;
  isCurrent: boolean;
  loading: boolean;
  checkoutUnavailable: boolean;
  onClose: () => void;
  onCheckout: (slug: string) => void;
};

export function PlanDetailModal({
  plan,
  isCurrent,
  loading,
  checkoutUnavailable,
  onClose,
  onCheckout,
}: PlanDetailModalProps) {
  useEffect(() => {
    if (!plan) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [plan, onClose]);

  if (!plan) return null;

  const highlighted = plan.slug === "dual_bundle";
  const canCheckout = plan.isActive && !checkoutUnavailable && !isCurrent;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`plan-detail-${plan.slug}`}
      onClick={onClose}
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_24px_48px_-12px_rgb(13_31_60/0.28)] sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-soft px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {plan.slug === "full_skill_program" ? (
              <span className="mb-2 inline-flex rounded-md bg-navy/8 px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wide text-navy uppercase">
                Best value
              </span>
            ) : plan.slug === "dual_bundle" ? (
              <span className="mb-2 inline-flex rounded-md bg-cyan/10 px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wide text-cyan uppercase">
                Popular
              </span>
            ) : null}
            <h2
              id={`plan-detail-${plan.slug}`}
              className="font-display text-lg font-bold text-navy"
            >
              {plan.name}
            </h2>
            <p className="mt-1 text-sm text-muted">{plan.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border-soft text-muted transition-colors hover:border-cyan/30 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40"
            aria-label="Close"
          >
            <X className="size-4" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {plan.chips.length > 0 ? (
            <ul className="mb-5 flex flex-wrap gap-1.5">
              {plan.chips.map((chip) => (
                <li
                  key={chip}
                  className="rounded-md border border-border-soft bg-surface px-2.5 py-1 text-[0.6875rem] font-medium text-muted"
                >
                  {chip}
                </li>
              ))}
            </ul>
          ) : null}

          <ul className="space-y-3">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="flex gap-3 text-[0.875rem] leading-relaxed text-ink/85"
              >
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan"
                  aria-hidden
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-[0.8125rem] leading-relaxed text-muted">
            {plan.guarantee}
          </p>
        </div>

        <div className="border-t border-border-soft bg-surface/50 px-5 py-4 sm:px-6">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <div>
              <span className="font-display text-2xl font-bold text-navy">
                {formatInr(plan.amount)}
              </span>
              <span className="ml-2 text-xs text-muted-light">{plan.priceNote}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={isCurrent || plan.comingSoon || loading || !canCheckout}
            onClick={() => onCheckout(plan.slug)}
            className={cn(
              "w-full",
              isCurrent || plan.comingSoon
                ? cn(pricingCtaMutedClass, "cursor-not-allowed")
                : highlighted
                  ? pricingCtaCyanClass
                  : pricingCtaNavyClass,
              (isCurrent || plan.comingSoon || loading || !canCheckout) && "opacity-50",
            )}
          >
            {isCurrent
              ? "Current plan"
              : plan.comingSoon
                ? "Coming soon"
                : loading
                  ? "Opening checkout…"
                  : checkoutUnavailable
                    ? "Checkout unavailable"
                    : plan.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
