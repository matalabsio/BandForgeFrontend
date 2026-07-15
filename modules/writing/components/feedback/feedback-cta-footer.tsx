import Link from "next/link";

type Props = {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
};

export function FeedbackCtaFooter({
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  onPrimaryClick,
  onSecondaryClick,
}: Props) {
  const primaryClassName =
    "inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-xl bg-cyan px-5 text-[14px] font-bold text-white transition-colors hover:bg-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan";
  const secondaryClassName =
    "inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-5 text-[14px] font-semibold text-[#334155] transition-colors hover:border-[#94A3B8] hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan";

  return (
    <div className="flex flex-col gap-2.5">
      {onPrimaryClick ? (
        <button type="button" onClick={onPrimaryClick} className={primaryClassName}>
          {primaryLabel}
        </button>
      ) : (
        <Link href={primaryHref} className={primaryClassName}>
          {primaryLabel}
        </Link>
      )}
      {onSecondaryClick ? (
        <button
          type="button"
          onClick={onSecondaryClick}
          className={secondaryClassName}
        >
          {secondaryLabel}
        </button>
      ) : (
        <Link href={secondaryHref} className={secondaryClassName}>
          {secondaryLabel}
        </Link>
      )}
    </div>
  );
}
