"use client";

type Props = {
  label: string;
  onClick: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export function SpeakingMockFooterCta({
  label,
  onClick,
  secondaryLabel,
  onSecondary,
}: Props) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end">
      {secondaryLabel && onSecondary ? (
        <button
          type="button"
          onClick={onSecondary}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-border-soft bg-white px-5 text-sm font-semibold text-navy transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
        >
          {secondaryLabel}
        </button>
      ) : null}
      <button
        type="button"
        onClick={onClick}
        className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-full bg-cyan px-6 text-sm font-bold text-navy shadow-[0_8px_20px_rgb(0_151_167/0.24)] transition-colors hover:bg-brand-sky-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:w-auto"
      >
        {label}
      </button>
    </div>
  );
}
