import Link from "next/link";
import type { ReactNode } from "react";
import { IELTS_EXAM_VARS } from "@/components/exam/ielts-exam-theme";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  layout?: "hub" | "exam";
  moduleLabel: string;
  hubTitle?: string;
};

export function IeltsExamShell({
  children,
  layout = "hub",
  moduleLabel,
  hubTitle,
}: Props) {
  const isExam = layout === "exam";

  return (
    <div
      className={cn(
        "ielts-exam-theme min-h-dvh text-[var(--exam-ink)]",
        isExam ? "flex flex-col bg-[var(--exam-surface)]" : "bg-[#eef2f6]",
      )}
      style={IELTS_EXAM_VARS}
    >
      {!isExam ? (
        <header className="sticky top-0 z-20 border-b border-[var(--exam-border)] bg-white shadow-sm">
          <div className="mx-auto flex h-11 max-w-4xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <span className="rounded bg-[var(--exam-bar)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                IELTS
              </span>
              <span className="text-[13px] font-semibold text-[var(--exam-ink)]">
                {hubTitle ?? moduleLabel}
              </span>
            </div>
            <Link
              href="/dashboard"
              className="cursor-pointer text-[12px] font-medium text-[var(--exam-ink-muted)] transition-colors hover:text-[var(--exam-ink)]"
            >
              Exit to dashboard
            </Link>
          </div>
        </header>
      ) : null}
      {isExam ? children : <main className="mx-auto w-full max-w-4xl">{children}</main>}
    </div>
  );
}
