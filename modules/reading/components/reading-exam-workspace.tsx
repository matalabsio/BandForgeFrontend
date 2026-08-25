"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ReadingWorkspaceTab = "passage" | "questions";

type Props = {
  passage: ReactNode;
  questions: ReactNode;
  /** Optional sticky chrome above the questions scroller (e.g. answer sheet, stepper). */
  questionsHeader?: ReactNode;
  /** Optional sticky chrome below the questions scroller (e.g. submit footer). */
  questionsFooter?: ReactNode;
  tab?: ReadingWorkspaceTab;
  onTabChange?: (tab: ReadingWorkspaceTab) => void;
  /** Diagnostic uses navy tint; exam uses --reading-* surfaces. */
  tone?: "exam" | "diagnostic";
  className?: string;
};

export function ReadingExamWorkspace({
  passage,
  questions,
  questionsHeader,
  questionsFooter,
  tab: controlledTab,
  onTabChange,
  tone = "exam",
  className,
}: Props) {
  const [uncontrolledTab, setUncontrolledTab] =
    useState<ReadingWorkspaceTab>("passage");
  const tab = controlledTab ?? uncontrolledTab;
  const setTab = (next: ReadingWorkspaceTab) => {
    onTabChange?.(next);
    if (controlledTab === undefined) setUncontrolledTab(next);
  };

  const diagnostic = tone === "diagnostic";
  const surface = diagnostic
    ? "bg-navy/[0.03]"
    : "bg-[var(--reading-surface)]";
  const border = diagnostic
    ? "border-navy/10"
    : "border-[var(--reading-border)]";
  const activeTab = diagnostic
    ? "rounded-t-[11px] border border-b-0 border-navy/10 bg-navy/[0.05] font-semibold text-navy"
    : "rounded-t-[11px] border border-b-0 border-[var(--reading-border)] bg-[var(--reading-paper)] font-semibold text-[var(--reading-ink)]";
  const idleTab = diagnostic
    ? "text-[#6E83A0]"
    : "text-[var(--reading-ink-muted)]";

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row",
        className,
      )}
    >
      <div className="flex shrink-0 gap-1.5 px-4 pt-3 sm:px-6 lg:hidden">
        {(["passage", "questions"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex min-h-11 flex-1 cursor-pointer items-center justify-center py-2.5 text-center text-sm font-medium capitalize transition-colors",
              tab === t ? activeTab : idleTab,
            )}
            aria-pressed={tab === t}
            aria-label={t === "passage" ? "Show passage" : "Show questions"}
          >
            {t === "passage" ? "Passage" : "Questions"}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:contents">
        <div
          className={cn(
            "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain",
            surface,
            border,
            "lg:min-w-0 lg:flex-1 lg:border-r",
            tab !== "passage" && "hidden lg:block",
          )}
        >
          {passage}
        </div>

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden",
            surface,
            "border-t lg:w-[min(44%,560px)] lg:max-w-[560px] lg:flex-none lg:shrink-0 lg:border-t-0",
            border,
            tab !== "questions" && "hidden lg:flex",
          )}
        >
          {questionsHeader ? (
            <div className="shrink-0">{questionsHeader}</div>
          ) : null}
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
            {questions}
          </div>
          {questionsFooter ? (
            <div className="shrink-0">{questionsFooter}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Scroll a question into view after switching to the Questions tab. */
export function scrollToReadingQuestion(id: string): void {
  window.requestAnimationFrame(() => {
    const el = document.getElementById(`reading-q-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
