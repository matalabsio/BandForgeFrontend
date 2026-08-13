import { ArrowRight, Loader2 } from "lucide-react";
import {
  BF_PRIMARY_CTA_GRADIENT,
  BF_PRIMARY_CTA_HOVER,
} from "@/components/bandforge/bf-primary-cta-styles";
import { cn } from "@/lib/utils";

type Props = {
  primaryLabel: string;
  onPrimary: () => void;
  primaryLoading?: boolean;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Desktop: side-by-side; mobile: stacked with primary first. */
  layout?: "stack" | "split";
};

export function SectionResultsCtaBar({
  primaryLabel,
  onPrimary,
  primaryLoading = false,
  primaryDisabled = false,
  secondaryLabel,
  onSecondary,
  layout = "stack",
}: Props) {
  const primaryBtn = (
    <button
      type="button"
      onClick={onPrimary}
      disabled={primaryDisabled || primaryLoading}
      className={cn(
        "group relative inline-flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full border border-transparent font-display text-[15px] font-semibold text-white no-underline shadow-[0_8px_22px_rgb(0_151_167/0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:h-[54px] sm:text-base",
        BF_PRIMARY_CTA_GRADIENT,
        BF_PRIMARY_CTA_HOVER,
      )}
    >
      <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
        {primaryLoading ? <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden /> : null}
        {primaryLabel}
        {!primaryLoading ? <ArrowRight className="size-4 shrink-0" aria-hidden /> : null}
      </span>
    </button>
  );

  const secondaryBtn =
    secondaryLabel && onSecondary ? (
      <button
        type="button"
        onClick={onSecondary}
        className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[rgb(13_31_60/0.18)] bg-white font-display text-[15px] font-semibold text-[#3D4D63] transition-colors hover:bg-surface sm:h-[54px]"
      >
        {secondaryLabel}
      </button>
    ) : null;

  if (layout === "split" && secondaryBtn) {
    return (
      <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end sm:gap-3">
        <div className="w-full sm:order-1 sm:w-auto sm:min-w-[160px]">{secondaryBtn}</div>
        <div className="w-full sm:order-2 sm:min-w-[200px]">{primaryBtn}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {primaryBtn}
      {secondaryBtn}
    </div>
  );
}
