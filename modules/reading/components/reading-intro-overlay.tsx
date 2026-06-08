"use client";

import {
  readingMatchingHeadingsIntro,
  readingTfngIntro,
} from "@/modules/reading/lib/question-groups";

type Props = {
  passageTitle: string;
  passageNumber: number;
  totalPassages?: number;
  mockSlug?: string;
  durationMinutes: number;
  busy: boolean;
  agreed: boolean;
  onAgreeChange: (checked: boolean) => void;
  onStart: () => void;
};

export function ReadingIntroOverlay({
  passageTitle,
  passageNumber,
  totalPassages = 2,
  mockSlug,
  durationMinutes,
  busy,
  agreed,
  onAgreeChange,
  onStart,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--reading-bar)]/90 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reading-intro-title"
    >
      <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-xl border border-white/10 bg-white p-6 shadow-xl sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--reading-accent)]">
          IELTS Academic Reading
        </p>
        <h1
          id="reading-intro-title"
          className="mt-2 font-display text-xl font-bold text-[var(--reading-ink)] sm:text-2xl"
        >
          Reading section · Passage {passageNumber} of {totalPassages}
        </h1>
        <p className="mt-1 text-[14px] font-medium text-[var(--reading-ink)]/80">
          {passageTitle}
        </p>

        <ul className="mt-6 space-y-3 text-[13px] leading-relaxed text-[var(--reading-ink-muted)]">
          <li>
            This Reading module has <strong className="text-[var(--reading-ink)]">{totalPassages} passages</strong>.
            Complete passages in order from 1 to {totalPassages}.
          </li>
          <li>
            You have <strong className="text-[var(--reading-ink)]">{durationMinutes} minutes</strong>{" "}
            for this passage. The timer starts when you begin reading.
          </li>
          <li>
            The passage remains visible while you answer questions in the split view.
          </li>
          <li>Questions are divided into three parts and follow this passage numbering.</li>
        </ul>

        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[13px] text-[var(--reading-ink-muted)]">
          <li>{readingTfngIntro(passageNumber, mockSlug)}</li>
          <li>{readingMatchingHeadingsIntro(passageNumber, mockSlug)}</li>
          <li>Part 3 — Sentence completion</li>
        </ol>

        <button
          type="button"
          disabled={busy || !agreed}
          onClick={onStart}
          className="mt-8 w-full cursor-pointer rounded-lg bg-[var(--reading-accent)] px-5 py-3.5 text-[14px] font-bold text-white transition-colors hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Starting…" : "Start reading section"}
        </button>
        <label className="mt-4 flex cursor-pointer items-start gap-2 rounded-lg border border-[var(--exam-border)] bg-[var(--exam-paper)] px-3 py-2.5 text-[13px] text-[var(--reading-ink)]">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => onAgreeChange(e.target.checked)}
            className="mt-0.5 accent-[var(--reading-accent)]"
          />
          <span>I have read and agree to follow these instructions.</span>
        </label>
      </div>
    </div>
  );
}
