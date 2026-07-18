import { Check, ShieldCheck } from "lucide-react";
import type { FullSkillProgramCard } from "@/lib/diagnostic-plan-content";

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
        className="flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-cyan text-sm font-bold text-white shadow-[0_10px_24px_rgba(0,151,167,0.40)] transition-colors hover:bg-brand-sky-hover disabled:cursor-not-allowed disabled:opacity-60 sm:h-[46px] sm:text-[15px]"
      >
        {ctaContent}
      </button>
    ) : null;

  if (featured) {
    return (
      <article className="relative mt-2 overflow-hidden rounded-2xl border-2 border-cyan bg-[#0D1F3C] shadow-[0_16px_40px_rgba(13,31,60,0.32)] sm:mt-0 sm:rounded-[18px] sm:shadow-[0_20px_48px_rgba(13,31,60,0.34)]">
        {bundle.badge ? (
          <span className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D9A441] px-3.5 py-1.5 text-[11px] font-bold tracking-[0.02em] whitespace-nowrap text-[#0D1F3C] shadow-[0_6px_14px_rgba(217,164,65,0.40)] sm:left-auto sm:translate-x-0 sm:rounded-t-none sm:rounded-b-[10px] sm:px-3.5 sm:py-1.5 sm:text-[11.5px] sm:shadow-[0_6px_14px_rgba(217,164,65,0.40)] sm:right-[26px] sm:top-0 sm:translate-y-0">
            {bundle.badge}
          </span>
        ) : null}

        <div className="flex flex-col p-4 pt-5 sm:hidden">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-[19px] font-bold text-white">
                {bundle.name}
              </h3>
              <p className="mt-0.5 text-[11px] font-normal text-[#9DB0CB]">
                {bundle.subtitle}
              </p>
            </div>
            <span className="font-mono text-2xl font-medium text-white">{price}</span>
          </div>
          {bundle.chips?.length ? (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {bundle.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-[rgba(0,188,212,0.16)] px-2.5 py-1.5 text-[11.5px] font-medium text-[#9CEAF3]"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mb-3.5 flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 shrink-0 text-[#34D399]" strokeWidth={2.2} />
            <span className="text-[11.5px] font-semibold text-[#34D399]">
              {bundle.guarantee}
            </span>
          </div>
          {primaryButton}
        </div>

        <div className="hidden sm:flex sm:items-stretch">
          <div className="flex w-[268px] shrink-0 flex-col justify-center gap-3.5 border-r border-white/12 p-[26px]">
            <div>
              <h3 className="font-display text-[22px] font-bold text-white">
                {bundle.name}
              </h3>
              <p className="mt-0.5 text-[12.5px] font-normal text-[#9DB0CB]">
                {bundle.subtitle}
              </p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[32px] font-medium tracking-[-0.02em] text-white">
                {price}
              </span>
              <span className="text-[13px] font-light text-[#7E93B3]">
                {bundle.priceNote}
              </span>
            </div>
            {primaryButton}
          </div>
          <div className="flex flex-1 flex-col justify-center gap-4 px-7 py-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {bundle.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-sm font-normal text-[#E9EEF6]"
                >
                  <Check className="size-3.5 shrink-0 text-cyan" strokeWidth={2.6} />
                  {feature}
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
