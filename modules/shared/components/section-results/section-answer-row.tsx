"use client";

import type { ReactNode } from "react";
import { Check, ChevronDown, Minus, X } from "lucide-react";
import type { SectionReviewQuestion } from "./section-results-types";

function isMapLabelling(q: SectionReviewQuestion): boolean {
  const t = q.question_type.toLowerCase();
  return (
    t.includes("map") ||
    t.includes("matching") ||
    t.includes("label") ||
    t.includes("heading")
  );
}

type RowProps = {
  question: SectionReviewQuestion;
  highlight?: boolean;
};

export function SectionAnswerRow({ question: q, highlight = false }: RowProps) {
  const mapStyle = isMapLabelling(q);
  const explanation = q.explanation?.trim() ?? "";
  const prompt = q.prompt?.trim() ?? "";
  const borderClass =
    q.status === "incorrect"
      ? "border-red-100"
      : highlight
        ? "border-cyan/40"
        : "border-border";
  const bgClass =
    q.status === "incorrect"
      ? "bg-red-50/50"
      : highlight
        ? "bg-cyan/5"
        : "bg-white";

  if (mapStyle) {
    const promptLabel = prompt || `Question ${q.question_number}`;
    return (
      <ExpandableRow
        id={`section-q-${q.question_number}`}
        className={`rounded-[13px] border px-3.5 py-3 sm:px-4 ${borderClass} ${bgClass}`}
        explanation={explanation}
        defaultOpen={highlight}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-display text-[14px] font-bold text-navy">
              <span className="font-mono text-[#94A3B8]">{q.question_number}</span>{" "}
              {promptLabel}
            </p>
          </div>
          <StatusIcon status={q.status} />
        </div>
        <div className="mt-2.5 space-y-1 text-[13px] leading-relaxed">
          <p className="break-words">
            <span className="text-muted">Your match: </span>
            <span
              className={
                q.status === "skipped"
                  ? "italic text-[#94A3B8]"
                  : q.status === "incorrect"
                    ? "font-semibold text-red-600"
                    : "font-semibold text-emerald-700"
              }
            >
              {q.status === "skipped" ? "not answered" : q.user_answer.trim() || "—"}
            </span>
          </p>
          {q.status !== "correct" ? (
            <p className="break-words">
              <span className="text-muted">Correct match: </span>
              <span className="font-semibold text-navy">{q.correct_answer}</span>
            </p>
          ) : null}
        </div>
      </ExpandableRow>
    );
  }

  return (
    <ExpandableRow
      id={`section-q-${q.question_number}`}
      className={`flex flex-col gap-0 rounded-[13px] border px-3 py-3 sm:px-3.5 ${borderClass} ${bgClass}`}
      explanation={explanation}
      prompt={prompt}
      defaultOpen={highlight}
    >
      <div className="flex items-center gap-3 sm:gap-3.5">
        <div className="w-5 shrink-0 font-mono text-[13px] font-medium text-[#94A3B8]">
          {q.question_number}
        </div>
        <div className="min-w-0 flex-1 text-[13px] leading-snug text-navy">
          {q.status === "skipped" ? (
            <p className="italic text-[#94A3B8]">No answer given (skipped)</p>
          ) : (
            <p className="break-words">
              Your answer:{" "}
              <strong
                className={`font-semibold ${
                  q.status === "incorrect" ? "text-red-600" : "text-navy"
                }`}
              >
                {q.user_answer.trim()}
              </strong>
            </p>
          )}
          {q.status !== "correct" ? (
            <p className="mt-1 break-words text-muted">
              Correct: <strong className="font-semibold text-navy">{q.correct_answer}</strong>
            </p>
          ) : null}
        </div>
        <StatusIcon status={q.status} />
      </div>
    </ExpandableRow>
  );
}

function ExpandableRow({
  id,
  className,
  children,
  explanation,
  prompt,
  defaultOpen = false,
}: {
  id: string;
  className: string;
  children: ReactNode;
  explanation: string;
  prompt?: string;
  defaultOpen?: boolean;
}) {
  const hasExpandable = Boolean(explanation || prompt);

  if (!hasExpandable) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );
  }

  return (
    <details
      id={id}
      className={`group overflow-hidden ${className}`}
      open={defaultOpen}
    >
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">{children}</div>
          <ChevronDown
            className="mt-0.5 size-4 shrink-0 text-[#94A3B8] transition-transform group-open:rotate-180"
            aria-hidden
          />
        </div>
      </summary>
      <div className="mt-2.5 border-t border-[rgb(13_31_60/0.08)] pt-2.5 text-[13px] leading-relaxed">
        {prompt ? (
          <p className="mb-2 break-words text-muted">
            <span className="font-semibold text-navy">Question: </span>
            {prompt}
          </p>
        ) : null}
        {explanation ? (
          <p className="break-words text-[#5A6B82]">
            <span className="font-semibold text-navy">Explanation: </span>
            {explanation}
          </p>
        ) : null}
      </div>
    </details>
  );
}

function StatusIcon({ status }: { status: SectionReviewQuestion["status"] }) {
  if (status === "correct") {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100">
        <Check className="size-3.5 text-emerald-600" strokeWidth={3} aria-hidden />
      </span>
    );
  }
  if (status === "incorrect") {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-red-100">
        <X className="size-3.5 text-red-600" strokeWidth={3} aria-hidden />
      </span>
    );
  }
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9]">
      <Minus className="size-3.5 text-[#94A3B8]" strokeWidth={3} aria-hidden />
    </span>
  );
}
