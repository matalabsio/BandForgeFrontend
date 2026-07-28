import { Check, ShieldCheck } from "lucide-react";
import { bfPrimaryCtaDiagClass } from "@/components/bandforge/bf-primary-cta-styles";
import type { FullSkillProgramCard } from "@/lib/diagnostic-plan-content";
import { cn } from "@/lib/utils";

type Props = {
  bundle: FullSkillProgramCard;
  price: string;
  onCheckout?: () => void;
  checkoutDisabled?: boolean;
  checkoutLoading?: boolean;
};

export function DiagnosticPlanBundleCard({
  bundle,
  price,
  onCheckout,
  checkoutDisabled = false,
  checkoutLoading = false,
}: Props) {
  const featured = true;

  const ctaContent = checkoutLoading ? "Processing…" : `${bundle.cta} →`;

  const primaryButton =
    onCheckout != null ? (
      <button
        type="button"
        onClick={onCheckout}
        disabled={checkoutDisabled || checkoutLoading}
        className={cn(
          bfPrimaryCtaDiagClass,
          "h-12 w-full text-sm font-bold sm:h-[46px] sm:text-[15px]",
        )}
      >
        <span className="relative z-[1]">{ctaContent}</span>
      </button>
    ) : null;

  if (featured) {
    return (
      <article className="relative mt-3 min-w-0 overflow-hidden rounded-2xl border-2 border-cyan bg-[#0D1F3C] pt-3 shadow-[0_16px_40px_rgba(13,31,60,0.32)] sm:mt-0 sm:rounded-[18px] sm:pt-0 sm:shadow-[0_20px_48px_rgba(13,31,60,0.34)]">
        {bundle.badge ? (
          <span className="absolute top-0 left-1/2 z-10 max-w-[calc(100%-1.5rem)] -translate-x-1/2 -translate-y-1/2 truncate rounded-full bg-[#D9A441] px-3 py-1.5 text-[10.5px] font-bold tracking-[0.02em] text-[#0D1F3C] shadow-[0_6px_14px_rgba(217,164,65,0.40)] sm:left-auto sm:right-[26px] sm:max-w-none sm:translate-x-0 sm:translate-y-0 sm:rounded-t-none sm:rounded-b-[10px] sm:px-3.5 sm:text-[11.5px]">
            {bundle.badge}
          </span>
        ) : null}

        {/* Mobile + tablet: stacked */}
        <div className="flex flex-col p-4 pt-5 md:hidden">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-[18px] font-bold text-white sm:text-[19px]">
                {bundle.name}
              </h3>
              <p className="mt-0.5 text-[11px] leading-snug font-normal text-[#9DB0CB]">
                {bundle.subtitle}
              </p>
            </div>
            <span className="shrink-0 font-mono text-[22px] font-medium text-white sm:text-2xl">
              {price}
            </span>
          </div>
          {bundle.chips?.length ? (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {bundle.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-[rgba(0,188,212,0.16)] px-2.5 py-1.5 text-[11px] font-medium text-[#9CEAF3] sm:text-[11.5px]"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
          <ul className="mb-3.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {bundle.features.slice(0, 4).map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-[12px] leading-snug font-normal text-[#E9EEF6] sm:text-[13px]"
              >
                <Check
                  className="mt-0.5 size-3.5 shrink-0 text-cyan"
                  strokeWidth={2.6}
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mb-3.5 flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 shrink-0 text-[#34D399]" strokeWidth={2.2} />
            <span className="text-[11.5px] font-semibold text-[#34D399]">
              {bundle.guarantee}
            </span>
          </div>
          {primaryButton}
        </div>

        {/* Desktop: side-by-side from md up */}
        <div className="hidden md:flex md:items-stretch">
          <div className="flex w-[240px] shrink-0 flex-col justify-center gap-3.5 border-r border-white/12 p-5 lg:w-[268px] lg:p-[26px]">
            <div>
              <h3 className="font-display text-[20px] font-bold text-white lg:text-[22px]">
                {bundle.name}
              </h3>
              <p className="mt-0.5 text-[12px] font-normal text-[#9DB0CB] lg:text-[12.5px]">
                {bundle.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-mono text-[28px] font-medium tracking-[-0.02em] text-white lg:text-[32px]">
                {price}
              </span>
              <span className="text-[12px] font-light text-[#7E93B3] lg:text-[13px]">
                {bundle.priceNote}
              </span>
            </div>
            {primaryButton}
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 px-5 py-5 lg:px-7 lg:py-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 lg:grid-cols-2">
              {bundle.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-sm font-normal text-[#E9EEF6]"
                >
                  <Check className="size-3.5 shrink-0 text-cyan" strokeWidth={2.6} />
                  <span className="min-w-0">{feature}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 shrink-0 text-[#34D399]" strokeWidth={2.2} />
              <span className="text-[12.5px] font-semibold text-[#34D399]">
                {bundle.guarantee}
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return null;
}
