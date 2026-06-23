"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DiagnosticModule } from "@/lib/diagnostic-storage";
import { DiagnosticExamTopBar } from "@/components/diagnostic/ui/diagnostic-exam-top-bar";
import { DiagnosticModuleFooter } from "@/components/diagnostic/diagnostic-module-footer";

export const DIAGNOSTIC_EXAM_COLUMN_CLASS =
  "mx-auto w-full max-w-[760px] px-6 py-[18px] lg:px-10 lg:py-8";

/** Wrap long option / prompt text inside diagnostic exam cards. */
export const DIAGNOSTIC_OPTION_TEXT_CLASS =
  "min-w-0 flex-1 break-words text-sm";

const MODULE_LABELS: Record<DiagnosticModule, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

type Props = {
  module: DiagnosticModule;
  moduleIcon: LucideIcon;
  error?: string | null;
  loading?: boolean;
  footerLabel?: string;
  footerBusy?: boolean;
  onFooter?: () => void;
  children: React.ReactNode;
  timer?: React.ReactNode;
  /** Footer width: narrow aligns to 760px content column */
  footerWidth?: "narrow" | "full";
};

/** Full-height diagnostic module frame: exam top bar, content, pinned footer. */
export function DiagnosticExamShell({
  module,
  moduleIcon,
  error,
  loading = false,
  footerLabel,
  footerBusy = false,
  onFooter,
  children,
  timer,
  footerWidth = "narrow",
}: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <DiagnosticExamTopBar
        label={MODULE_LABELS[module]}
        Icon={moduleIcon}
        timer={timer}
      />

      {error ? (
        <p
          className="shrink-0 border-b border-red-100 bg-red-50 px-4 py-2.5 text-center text-sm text-red-700 sm:px-6"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-cyan border-t-transparent"
            role="status"
            aria-label="Loading"
          />
        </div>
      ) : (
        <>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
          {footerLabel && onFooter ? (
            <DiagnosticModuleFooter
              label={footerLabel}
              busy={footerBusy}
              onClick={onFooter}
              contentWidth={footerWidth}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

export function DiagnosticPassageText({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-wrap font-sans text-[15px] leading-[1.65] text-[#243650] lg:text-base lg:leading-[1.7]">
      {text}
    </p>
  );
}

/** Viewport-filling scroll region — single scroll owner for exam content. */
export function DiagnosticExamScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain", className)}>
      {children}
    </div>
  );
}

/** Centered content column (760px) — no flex growth. */
export function DiagnosticExamColumn({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(DIAGNOSTIC_EXAM_COLUMN_CLASS, className)}>{children}</div>
  );
}

/** @deprecated Use DiagnosticExamScroll + DiagnosticExamColumn */
export function DiagnosticQuestionsScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DiagnosticExamScroll className={className}>
      {children}
    </DiagnosticExamScroll>
  );
}
