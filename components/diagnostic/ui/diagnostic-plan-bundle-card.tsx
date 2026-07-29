import { Check } from "lucide-react";
import type { FullSkillProgramCard } from "@/lib/diagnostic-plan-content";
import { cn } from "@/lib/utils";

type Props = {
  bundle: FullSkillProgramCard;
  price: string;
  onCheckout?: () => void;
  checkoutDisabled?: boolean;
  checkoutLoading?: boolean;
};

/**
 * Offer card matching bandforge-results.html — navy 2-col, badge, teal CTA.
 */
export function DiagnosticPlanBundleCard({
  bundle,
  price,
  onCheckout,
  checkoutDisabled = false,
  checkoutLoading = false,
}: Props) {
  const ctaContent = checkoutLoading ? "Processing…" : `${bundle.cta} →`;

  const primaryButton =
    onCheckout != null ? (
      <button
        type="button"
        onClick={onCheckout}
        disabled={checkoutDisabled || checkoutLoading}
        className={cn(
          "inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2FB8C6] px-5 text-[15px] font-bold text-[#0B1B33] transition-colors duration-200 hover:bg-[#3ec4d1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50 disabled:pointer-events-none disabled:opacity-60 sm:h-[52px] sm:text-[17px]",
        )}
      >
        {ctaContent}
      </button>
    ) : null;

  return (
    <article className="relative mt-3 min-w-0 overflow-visible rounded-[18px] bg-[#0B1B33] p-5 shadow-[0_16px_40px_rgba(13,31,60,0.28)] sm:mt-4 sm:p-8">
      {bundle.badge ? (
        <span className="absolute -top-3.5 right-4 z-10 max-w-[calc(100%-2rem)] truncate rounded-full bg-[#F0A227] px-3.5 py-1.5 text-[11px] font-bold text-[#412402] sm:right-6 sm:text-[13px]">
          {bundle.badge}
        </span>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <div className="min-w-0">
          <h3 className="font-display text-[22px] font-bold text-white sm:text-2xl">
            {bundle.name}
          </h3>
          <p className="mt-1 text-[13px] text-[#B8C2D6] sm:text-[14px]">
            {bundle.subtitle}
          </p>
          <div className="mt-4 flex flex-wrap items-baseline gap-2">
            <span className="font-mono text-[36px] leading-none font-bold tracking-[-0.02em] text-white sm:text-[42px]">
              {price}
            </span>
            <span className="text-[13px] text-[#8494AC] sm:text-[14px]">
              {bundle.priceNote}
            </span>
          </div>
          <p className="mt-2 mb-5 text-[13px] font-semibold text-[#2FB8C6] sm:text-[14px]">
            {bundle.guarantee}
          </p>
          {primaryButton}
        </div>

        <ul className="min-w-0 list-none space-y-3.5 sm:space-y-4">
          {bundle.features.slice(0, 4).map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-[13px] leading-snug text-white sm:text-[15px]"
            >
              <Check
                className="mt-0.5 size-4 shrink-0 text-[#2FB8C6]"
                strokeWidth={2.6}
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
