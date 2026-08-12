"use client";

import Link from "next/link";
import { formatRemaining } from "@/modules/listening/hooks/use-listening-timer";
import { EXAM_TIME_WARNING_SECONDS } from "@/lib/design-tokens";
import { readingTestHubPath } from "@/lib/reading-test";
import {
  BF_PRIMARY_FILL,
  bfPrimaryCtaExamCompactClass,
} from "@/components/bandforge/bf-primary-cta-styles";
import { cn } from "@/lib/utils";

type Props = {
  passage: number;
  testTitle: string;
  hubHref?: string;
  hubLabel?: string;
  remainingSeconds: number;
  timerActive: boolean;
  answeredCount: number;
  totalQuestions: number;
  busy: boolean;
  submitLabel?: string;
  sectionHint?: string;
  showSubmit?: boolean;
  /** Hide IELTS/mock marketing eyebrow (plan practice). */
  plainHeader?: boolean;
  onSubmit: () => void;
};

export function ReadingExamToolbar({
  passage,
  testTitle,
  hubHref = readingTestHubPath(),
  hubLabel = "← Passages",
  remainingSeconds,
  timerActive,
  answeredCount,
  totalQuestions,
  busy,
  submitLabel = "Submit",
  sectionHint,
  showSubmit = true,
  plainHeader = false,
  onSubmit,
}: Props) {
  const critical =
    remainingSeconds <= EXAM_TIME_WARNING_SECONDS && timerActive;
  const pct =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-3 border-b border-[var(--reading-border)] bg-[var(--reading-bar)] px-3 text-white sm:px-4">
      <Link
        href={hubHref}
        className="hidden shrink-0 cursor-pointer text-[11px] font-medium text-white/70 transition-colors hover:text-white sm:inline"
      >
        {hubLabel}
      </Link>
      <div className="min-w-0 flex-1">
        {plainHeader ? (
          <p className="truncate text-[13px] font-medium leading-tight">
            {testTitle || `Passage ${passage}`}
          </p>
        ) : (
          <>
            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-white/60">
              IELTS Academic Reading
              {sectionHint ? ` · ${sectionHint}` : ` · Passage ${passage}`}
            </p>
            <p className="truncate text-[13px] font-medium leading-tight">
              {testTitle}
            </p>
          </>
        )}
      </div>
      <div className="hidden items-center gap-2 sm:flex">
        <span className="text-[10px] font-medium text-white/50">Progress</span>
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/20">
          <div
            className={cn("h-full rounded-full transition-all duration-300", BF_PRIMARY_FILL)}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[11px] tabular-nums text-white/80">
          {answeredCount}/{totalQuestions}
        </span>
      </div>
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-[13px] font-bold tabular-nums",
          critical
            ? "border-red-400/60 bg-red-950/40 text-red-200"
            : "border-white/20 bg-white/10 text-white",
        )}
        aria-live={critical ? "polite" : "off"}
      >
        <span className="text-[9px] font-sans font-semibold uppercase tracking-wider opacity-70">
          Time
        </span>
        {formatRemaining(remainingSeconds)}
      </div>
      {showSubmit ? (
        <button
          type="button"
          disabled={busy}
          onClick={onSubmit}
          className={bfPrimaryCtaExamCompactClass}
        >
          {busy ? "Submitting…" : submitLabel}
        </button>
      ) : null}
    </header>
  );
}
