"use client";

import { useState, type ReactNode } from "react";
import {
  Clock,
  Cloud,
  CloudOff,
  FileText,
  PencilLine,
} from "lucide-react";
import { TestTimer, useExamTimeWarning } from "@/modules/shared";
import { examTextInputProps } from "@/lib/exam-input-props";
import { ExamPartFooter } from "@/components/exam/exam-part-footer";
import { ExamTimeWarningDialog } from "@/components/exam/exam-time-warning-dialog";
import { EXAM_TIME_WARNING_SECONDS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

type MobilePanel = "prompt" | "write";

type Props = {
  activePart: 1 | 2;
  isMock: boolean;
  displayLabel?: string;
  remainingSeconds: number;
  durationSeconds: number;
  wordCount: number;
  minWords: number;
  estimatedBand: number;
  saved: boolean;
  busy: boolean;
  submitLabel: string;
  error: string | null;
  prompt: ReactNode;
  essay: string;
  onEssayChange: (value: string) => void;
  onSubmit: () => void;
  /** Hide mock / IELTS subtitle (plan practice). */
  plainHeader?: boolean;
};

export function WritingExamWorkspace({
  activePart,
  isMock,
  displayLabel,
  remainingSeconds,
  durationSeconds,
  wordCount,
  minWords,
  saved,
  busy,
  submitLabel,
  error,
  prompt,
  essay,
  onEssayChange,
  onSubmit,
  plainHeader = false,
}: Props) {
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("write");
  const timeUp = remainingSeconds <= 0;
  const timerCritical = remainingSeconds <= EXAM_TIME_WARNING_SECONDS;
  const timeWarning = useExamTimeWarning({
    remaining: remainingSeconds,
    durationSeconds,
    resetKey: `${activePart}-${durationSeconds}`,
    active: !busy && !timeUp,
  });
  const wordCountTone =
    minWords > 0 && wordCount >= minWords
      ? "green"
      : minWords > 0 && wordCount >= minWords * 0.5
        ? "yellow"
        : "red";

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-surface text-ink">
      {/* Top bar */}
      <header className="z-30 shrink-0 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between gap-3 px-4 md:h-[3.75rem] md:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#ECFEFF] text-teal">
              <PencilLine className="size-[18px]" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold leading-tight text-ink">
                Writing · Task {activePart}
              </p>
              {plainHeader ? null : (
                <p className="truncate text-[11px] text-[#64748B]">
                  {displayLabel ?? "IELTS Academic"}
                  {isMock ? " · Full mock" : ""}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span
              className={cn(
                "hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex",
                saved
                  ? "bg-[#ECFDF5] text-[#059669]"
                  : "bg-[#FEF3C7] text-[#D97706]",
              )}
            >
              {saved ? (
                <Cloud className="size-3.5" aria-hidden />
              ) : (
                <CloudOff className="size-3.5" aria-hidden />
              )}
              {saved ? "Saved" : "Saving…"}
            </span>

            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
                timerCritical
                  ? "border-red-300 bg-red-50"
                  : "border-[#E2E8F0] bg-surface",
              )}
              aria-label="Time remaining"
            >
              <Clock
                className={cn(
                  "size-4",
                  timerCritical ? "text-[#DC2626]" : "text-[#64748B]",
                )}
                aria-hidden
              />
              <TestTimer
                remainingSeconds={remainingSeconds}
                className="text-[15px] font-bold"
              />
            </div>
          </div>
        </div>

        <div
          className="flex border-t border-[#E2E8F0] bg-white px-4 py-2 lg:hidden md:px-6"
          role="tablist"
          aria-label="Writing panels"
        >
          <div className="flex rounded-xl border border-[#E2E8F0] bg-surface p-0.5">
            <button
              type="button"
              role="tab"
              aria-selected={mobilePanel === "prompt"}
              onClick={() => setMobilePanel("prompt")}
              className={cn(
                "inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold transition-colors",
                mobilePanel === "prompt"
                  ? "bg-white text-ink shadow-sm"
                  : "text-[#64748B]",
              )}
            >
              <FileText className="size-3.5" aria-hidden />
              Prompt
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mobilePanel === "write"}
              onClick={() => setMobilePanel("write")}
              className={cn(
                "inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold transition-colors",
                mobilePanel === "write"
                  ? "bg-white text-ink shadow-sm"
                  : "text-[#64748B]",
              )}
            >
              <PencilLine className="size-3.5" aria-hidden />
              Write
            </button>
          </div>
        </div>
      </header>

      {/* Main split */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <section
          className={cn(
            "min-h-0 border-b border-[#E2E8F0] lg:w-[min(44%,520px)] lg:shrink-0 lg:border-b-0 lg:border-r",
            mobilePanel === "prompt" ? "flex flex-1 flex-col" : "hidden lg:flex lg:flex-1 lg:flex-col",
          )}
          aria-label="Task prompt"
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-5 lg:p-6">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm md:p-5">
              {prompt}
            </div>
          </div>
        </section>

        <section
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden",
            mobilePanel === "write" ? "flex" : "hidden lg:flex",
          )}
          aria-label="Your response"
        >
          <div className="flex min-h-0 flex-1 flex-col p-4 md:p-5 lg:p-6">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-2.5 md:px-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
                  Your response
                </p>
                <span className="text-[11px] font-medium tabular-nums text-[#64748B] sm:hidden">
                  {saved ? "Saved" : "Saving…"}
                </span>
              </div>
              <div className="relative min-h-0 flex-1">
                <label htmlFor="essay" className="sr-only">
                  Your response for Writing Task {activePart}
                </label>
                <textarea
                  id="essay"
                  value={essay}
                  onChange={(e) => onEssayChange(e.target.value)}
                  placeholder="Type your response here. Organise your ideas into clear paragraphs…"
                  readOnly={timeUp || busy}
                  {...examTextInputProps}
                  className="answer-input h-full min-h-0 w-full resize-none overflow-y-auto border-0 bg-transparent px-4 py-4 pb-12 text-[16px] leading-[1.75] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-0 disabled:cursor-not-allowed md:px-5 md:py-5 md:pb-12"
                />
                <p
                  className={cn(
                    "pointer-events-none absolute bottom-3 right-3 z-10 text-[12px] font-semibold tabular-nums",
                    wordCountTone === "green" && "text-[#059669]",
                    wordCountTone === "yellow" && "text-[#D97706]",
                    wordCountTone === "red" && "text-[#DC2626]",
                  )}
                  aria-live="polite"
                >
                  {wordCount} {wordCount === 1 ? "word" : "words"}
                </p>
              </div>
            </div>

            {error ? (
              <p
                className="mt-3 shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </div>

          <ExamPartFooter
            variant="writing"
            label={submitLabel}
            busy={busy}
            disabled={timeUp}
            onAction={onSubmit}
          />
        </section>
      </main>
      <ExamTimeWarningDialog
        open={timeWarning.open}
        remainingSeconds={remainingSeconds}
        onDismiss={timeWarning.dismiss}
      />
    </div>
  );
}
