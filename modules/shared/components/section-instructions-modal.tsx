"use client";

type Props = {
  badge?: string;
  title: string;
  description?: string;
  instructions: string[];
  agreeLabel?: string;
  ctaLabel: string;
  busy?: boolean;
  agreed: boolean;
  onAgreeChange: (checked: boolean) => void;
  onContinue: () => void;
};

export function SectionInstructionsModal({
  badge = "IELTS Academic",
  title,
  description,
  instructions,
  agreeLabel = "I have read and agree to follow these instructions.",
  ctaLabel,
  busy = false,
  agreed,
  onAgreeChange,
  onContinue,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--reading-bar)]/90 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="section-instructions-title"
    >
      <div className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-xl border border-white/10 bg-white p-6 shadow-xl sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--exam-accent)]">
          {badge}
        </p>
        <h1
          id="section-instructions-title"
          className="mt-2 font-display text-xl font-bold text-[var(--reading-ink)] sm:text-2xl"
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--reading-ink-muted)]">
            {description}
          </p>
        ) : null}

        <ul className="mt-5 space-y-2.5 text-[13px] leading-relaxed text-[var(--reading-ink-muted)]">
          {instructions.map((line) => (
            <li key={line} className="flex gap-2">
              <span aria-hidden>•</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <label className="mt-6 flex cursor-pointer items-start gap-2 rounded-lg border border-[var(--exam-border)] bg-[var(--exam-paper)] px-3 py-2.5 text-[13px] text-[var(--exam-ink)]">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => onAgreeChange(e.target.checked)}
            className="mt-0.5 accent-[var(--exam-accent)]"
          />
          <span>{agreeLabel}</span>
        </label>

        <button
          type="button"
          disabled={busy || !agreed}
          onClick={onContinue}
          className="mt-6 w-full cursor-pointer rounded-lg bg-[var(--exam-accent)] px-5 py-3.5 text-[14px] font-bold text-white transition-colors hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Starting…" : ctaLabel}
        </button>
      </div>
    </div>
  );
}
