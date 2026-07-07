"use client";

import type { ReactNode } from "react";
import { SectionInfoNotice } from "./section-info-notice";
import { SectionQuestionChipGrid, SectionResultsLegend } from "./section-question-chip-grid";
import type { SectionReviewQuestion } from "./section-results-types";

type Props = {
  title: string;
  subtitle: string;
  rawScore: number;
  total: number;
  questions: SectionReviewQuestion[];
  allCorrectMessage?: string;
  showBandNotice?: boolean;
  extra?: ReactNode;
  onQuestionClick?: (questionNumber: number) => void;
};

export function SectionResultsSummary({
  title,
  subtitle,
  rawScore,
  total,
  questions,
  allCorrectMessage,
  showBandNotice = true,
  extra,
  onQuestionClick,
}: Props) {
  const allCorrect = total > 0 && rawScore === total;
  const allSkipped = questions.every((q) => q.status === "skipped");

  return (
    <div className="flex flex-col">
      <h2 className="font-display text-[23px] font-bold tracking-tight text-navy sm:text-[26px] lg:text-[28px]">
        {title}
      </h2>
      <p className="mt-1.5 text-sm font-light text-muted sm:text-[15px]">{subtitle}</p>

      {allCorrect && allCorrectMessage ? (
        <div className="mt-5 rounded-[13px] border border-emerald-200/80 bg-emerald-50 px-3.5 py-3">
          <p className="text-[13.5px] font-medium text-emerald-800">{allCorrectMessage}</p>
        </div>
      ) : null}

      {allSkipped ? (
        <p className="mt-5 text-sm font-light text-muted">
          Time ran out before you answered these questions. You can still review the correct
          answers below.
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-4 sm:mt-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex shrink-0 flex-wrap items-baseline gap-2">
          <span className="font-mono text-[52px] font-medium leading-none text-navy sm:text-[56px]">
            {rawScore}
          </span>
          <span className="font-mono text-2xl font-medium text-[#94A3B8] sm:text-[26px]">
            / {total} correct
          </span>
        </div>

        {showBandNotice ? (
          <div className="min-w-0 flex-1 sm:max-w-[280px] lg:max-w-[320px]">
            <SectionInfoNotice>
              Band scores will be available after you complete the full test.
            </SectionInfoNotice>
          </div>
        ) : null}
      </div>

      <div className="mt-5 sm:mt-6">
        <SectionQuestionChipGrid
          questions={questions}
          columns={questions.length <= 8 ? 8 : 5}
          onQuestionClick={onQuestionClick}
        />
      </div>

      <div className="mt-4">
        <SectionResultsLegend />
      </div>

      {extra}
    </div>
  );
}
