import { ArrowRight } from "lucide-react";
import { BandGapTable } from "@/components/bandforge/dashboard/band-gap-table";
import {
  bandGapSummary,
  skillStatuses,
  type SkillBands,
} from "@/lib/diagnostic-performance";
import { cn } from "@/lib/utils";

type Props = {
  bands: SkillBands;
  targetBand: number;
  /** Navy summary card (results HTML prototype). Default keeps table layout for report. */
  variant?: "table" | "navy";
  daysToExam?: number | null;
};

export function DiagnosticBandGapCard({
  bands,
  targetBand,
  variant = "table",
  daysToExam = null,
}: Props) {
  const statuses = skillStatuses(bands, targetBand);
  const { currentBand, gap, scoredCount, isPartial } = bandGapSummary(
    bands,
    targetBand,
  );

  if (variant === "navy") {
    const nowLabel = currentBand != null ? currentBand.toFixed(1) : "—";
    const gapLabel =
      gap > 0 && currentBand != null
        ? `${gap.toFixed(1)} bands to close`
        : currentBand != null
          ? "On target"
          : "Scores pending";

    return (
      <div
        className={cn(
          "flex min-w-0 flex-col items-start justify-between gap-4 rounded-2xl bg-[#0B1B33] px-5 py-5 text-white sm:flex-row sm:items-center sm:gap-8 sm:rounded-[16px] sm:px-8 sm:py-7",
        )}
      >
        <div className="flex items-center gap-5 sm:gap-6">
          <div className="text-center">
            <p className="mb-1 text-[10px] font-semibold tracking-[0.06em] text-[#8494AC] uppercase sm:text-[11px]">
              Now
            </p>
            <p className="font-mono text-[32px] leading-none font-bold tracking-[-0.02em] sm:text-[36px]">
              {nowLabel}
            </p>
          </div>
          <ArrowRight className="size-5 shrink-0 text-[#2FB8C6] sm:size-6" strokeWidth={2.2} />
          <div className="text-center">
            <p className="mb-1 text-[10px] font-semibold tracking-[0.06em] text-[#8494AC] uppercase sm:text-[11px]">
              Target
            </p>
            <p className="font-mono text-[32px] leading-none font-bold tracking-[-0.02em] text-[#2FB8C6] sm:text-[36px]">
              {targetBand.toFixed(1)}
            </p>
          </div>
        </div>

        <div className="w-full text-left sm:w-auto sm:text-right">
          <div className="inline-flex items-center rounded-full border border-[#2FB8C6] bg-[rgba(47,184,198,0.15)] px-3.5 py-2 text-[13px] font-bold text-[#2FB8C6] sm:px-4 sm:text-[15px]">
            {gapLabel}
          </div>
          {daysToExam != null && daysToExam >= 0 ? (
            <p className="mt-1.5 text-[12px] text-[#B8C2D6] sm:text-[13px]">
              {daysToExam} days to your exam
            </p>
          ) : null}
          {isPartial ? (
            <p className="mt-1 text-[11px] text-[#8494AC]">
              Based on {scoredCount} of 4 skills — pending scores excluded
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  const gapBadge =
    gap > 0 && currentBand != null ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBEFD6] px-2.5 py-1 text-[11.5px] font-semibold text-[#9A6B12] sm:px-3 sm:py-1.5 sm:text-[12.5px]">
        +{gap.toFixed(1)} band overall to close
      </span>
    ) : currentBand != null ? (
      <span className="inline-flex items-center rounded-full bg-[#E6F7FA] px-2.5 py-1 text-[11.5px] font-semibold text-[#0097A7] sm:px-3 sm:py-1.5 sm:text-[12.5px]">
        On target
      </span>
    ) : null;

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-[#E8EDF3] bg-white p-3.5 shadow-[0_2px_12px_rgba(13,31,60,0.05)] sm:rounded-[18px] sm:p-[22px] sm:px-[26px]">
      <div className="mb-4 lg:hidden">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="font-display text-[14.5px] font-bold text-[#0D1F3C]">
            Your band gap
          </span>
          {gapBadge}
        </div>
        <div className="flex items-center justify-center gap-4 rounded-xl bg-[#F8FAFC] px-3 py-3 sm:gap-6 sm:px-5">
          <div className="text-center">
            <p className="mb-1 text-[10px] font-semibold tracking-[0.06em] text-[#94A3B8] uppercase">
              Now
            </p>
            <p className="font-mono text-[28px] leading-none font-medium tracking-[-0.02em] text-[#0D1F3C] sm:text-[32px]">
              {currentBand != null ? currentBand.toFixed(1) : "—"}
            </p>
          </div>
          <ArrowRight className="size-4 shrink-0 text-[#94A3B8] sm:size-5" strokeWidth={2} />
          <div className="text-center">
            <p className="mb-1 text-[10px] font-semibold tracking-[0.06em] text-[#94A3B8] uppercase">
              Target
            </p>
            <p className="font-mono text-[28px] leading-none font-medium tracking-[-0.02em] text-[#0097A7] sm:text-[32px]">
              {targetBand.toFixed(1)}
            </p>
          </div>
        </div>
        {isPartial ? (
          <p className="mt-2 text-center text-[11px] leading-snug text-[#94A3B8]">
            Based on {scoredCount} of 4 skills — pending scores excluded
          </p>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:gap-[30px]">
        <div className="hidden shrink-0 border-[#EEF2F7] lg:block lg:w-[232px] lg:border-r lg:pr-[30px]">
          <p className="mb-[15px] font-display text-base font-bold text-[#0D1F3C]">
            Your band gap
          </p>
          <div className="flex items-center gap-3.5">
            <div className="text-center">
              <p className="mb-1 text-[10.5px] font-semibold tracking-[0.06em] text-[#94A3B8] uppercase">
                Now
              </p>
              <p className="font-mono text-[32px] leading-none font-medium tracking-[-0.02em] text-[#0D1F3C]">
                {currentBand != null ? currentBand.toFixed(1) : "—"}
              </p>
            </div>
            <ArrowRight className="size-5 shrink-0 text-[#94A3B8]" strokeWidth={2} />
            <div className="text-center">
              <p className="mb-1 text-[10.5px] font-semibold tracking-[0.06em] text-[#94A3B8] uppercase">
                Target
              </p>
              <p className="font-mono text-[32px] leading-none font-medium tracking-[-0.02em] text-[#0097A7]">
                {targetBand.toFixed(1)}
              </p>
            </div>
          </div>
          <div className="mt-[15px] space-y-2">
            {gapBadge}
            {isPartial ? (
              <p className="text-[11px] leading-snug text-[#94A3B8]">
                Based on {scoredCount} of 4 skills — pending scores excluded
              </p>
            ) : null}
          </div>
        </div>

        <BandGapTable bands={bands} targetBand={targetBand} statuses={statuses} />
      </div>
    </div>
  );
}
