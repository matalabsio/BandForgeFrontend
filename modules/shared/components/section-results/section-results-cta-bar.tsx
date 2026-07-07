import { ArrowRight, Loader2 } from "lucide-react";

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
      className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-cyan font-display text-[15px] font-semibold text-[#06222B] shadow-[0_12px_28px_rgba(0,188,212,0.30)] transition-colors hover:bg-brand-sky-hover disabled:cursor-not-allowed disabled:opacity-60 sm:h-[54px] sm:text-base"
    >
      {primaryLoading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {primaryLabel}
      {!primaryLoading ? <ArrowRight className="size-4" aria-hidden /> : null}
    </button>
  );

  const secondaryBtn =
    secondaryLabel && onSecondary ? (
      <button
        type="button"
        onClick={onSecondary}
        className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-[rgb(13_31_60/0.18)] bg-white font-display text-[15px] font-semibold text-[#3D4D63] transition-colors hover:bg-surface sm:h-[54px]"
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
