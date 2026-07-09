"use client";

import { useEffect, useId, useState } from "react";
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

function answeredValue(q: SectionReviewQuestion): string {
  return q.status === "skipped" ? "not answered" : q.user_answer.trim() || "—";
}

export function SectionAnswerRow({ question: q, highlight = false }: RowProps) {
  const explanation = q.explanation?.trim() ?? "";
  const prompt = (q.prompt?.trim() || `Question ${q.question_number}`).trim();
  const mapStyle = isMapLabelling(q);
  const userLabel = mapStyle ? "Your match" : "Your answer";
  const correctLabel = mapStyle ? "Correct match" : "Correct answer";
  const answered = answeredValue(q);
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
  const detailsId = useId();
  const hasExplanation = Boolean(explanation);
  const [expanded, setExpanded] = useState(highlight);

  useEffect(() => {
    if (highlight) setExpanded(true);
  }, [highlight]);

  return (
    <article
      id={`section-q-${q.question_number}`}
      className={`rounded-[13px] border px-3.5 py-3 sm:px-4 ${borderClass} ${bgClass}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-5 shrink-0 pt-0.5 font-mono text-[13px] font-medium text-[#94A3B8]">
          {q.question_number}
        </div>
        <div className="min-w-0 flex-1 space-y-2.5">
          <p className="break-words text-[13px] leading-snug text-navy sm:text-[13.5px]">
            <span className="font-semibold text-navy">Question: </span>
            {prompt}
          </p>
          <div className="grid gap-1.5 sm:grid-cols-[minmax(7rem,9rem)_1fr] sm:gap-x-3 sm:gap-y-1.5">
            <p className="text-[12.5px] font-semibold text-muted sm:text-[13px]">{userLabel}</p>
            <p
              className={`break-words text-[13px] sm:text-[13.5px] ${
                q.status === "skipped"
                  ? "italic text-[#94A3B8]"
                  : q.status === "incorrect"
                    ? "font-semibold text-red-600"
                    : "font-semibold text-emerald-700"
              }`}
            >
              {answered}
            </p>
            <p className="text-[12.5px] font-semibold text-muted sm:text-[13px]">
              {correctLabel}
            </p>
            <p className="break-words text-[13px] font-semibold text-navy sm:text-[13.5px]">
              {q.correct_answer}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-start gap-2">
          <StatusIcon status={q.status} />
          {hasExplanation ? (
            <button
              type="button"
              className="mt-0.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-[#64748B] transition-colors hover:bg-slate-100 hover:text-[#334155] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/35"
              aria-expanded={expanded}
              aria-controls={detailsId}
              onClick={() => setExpanded((v) => !v)}
            >
              <span className="sr-only">
                {expanded ? "Hide explanation" : "Show explanation"}
              </span>
              <span aria-hidden>{expanded ? "Hide" : "Explain"}</span>
              <ChevronDown
                className={`size-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
          ) : null}
        </div>
      </div>
      {hasExplanation ? (
        <div
          id={detailsId}
          className={`grid transition-all duration-200 ease-out ${expanded ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-[rgb(13_31_60/0.08)] pt-2.5 text-[13px] leading-relaxed text-[#5A6B82]">
              <span className="font-semibold text-navy">Explanation: </span>
              {explanation}
            </div>
          </div>
        </div>
      ) : null}
    </article>
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
