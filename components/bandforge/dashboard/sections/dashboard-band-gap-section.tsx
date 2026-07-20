import { ArrowRight } from "lucide-react";
import { BandGapTable } from "@/components/bandforge/dashboard/band-gap-table";
import {
  bandGapSummary,
  type SkillBands,
} from "@/lib/diagnostic-performance";
import type { LearningProfile } from "@/lib/learning-types";

type Props = {
  learning: LearningProfile;
};

function moduleSummaryToBands(
  summary: LearningProfile["module_summary"],
): SkillBands {
  return {
    listening: summary.listening?.latest ?? null,
    reading: summary.reading?.latest ?? null,
    writing: summary.writing?.latest ?? null,
    speaking: summary.speaking?.latest ?? null,
  };
}

export function DashboardBandGapSection({ learning }: Props) {
  const targetBand = learning.target_band ?? 7;
  const bands = moduleSummaryToBands(learning.module_summary);
  const { currentBand, gap, scoredCount, isPartial } = bandGapSummary(
    bands,
    targetBand,
  );

  return (
    <section className="bf-dash-enter">
      <p className="mb-3 font-mono text-xs tracking-[0.1em] text-muted-light uppercase">
        Band performance
      </p>
      <div className="rounded-2xl border border-[#E8EDF3] bg-white p-4 shadow-[0_2px_12px_rgba(13,31,60,0.05)] sm:rounded-[18px] sm:p-[22px] sm:px-[26px]">
        <div className="mb-3.5 flex items-center justify-between sm:hidden">
          <span className="font-display text-[14.5px] font-bold text-[#0D1F3C]">
            Your band gap
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#0D1F3C]">
            <span className="font-mono">
              {currentBand != null ? currentBand.toFixed(1) : "—"}
            </span>
            <ArrowRight className="size-3.5 text-[#94A3B8]" strokeWidth={2} />
            <span className="font-mono text-[#0097A7]">
              {targetBand.toFixed(1)}
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-[30px]">
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
              <ArrowRight
                className="size-5 shrink-0 text-[#94A3B8]"
                strokeWidth={2}
              />
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
              {gap > 0 && currentBand != null ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBEFD6] px-3 py-1.5 text-[12.5px] font-semibold text-[#9A6B12]">
                  +{gap.toFixed(1)} band overall to close
                </span>
              ) : currentBand != null ? (
                <span className="inline-flex items-center rounded-full bg-[#E6F7FA] px-3 py-1.5 text-[12.5px] font-semibold text-[#0097A7]">
                  On target
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-[#EEF2F7] px-3 py-1.5 text-[12.5px] font-semibold text-[#64748B]">
                  Complete a skill check to see your gap
                </span>
              )}
              {isPartial ? (
                <p className="text-[11px] leading-snug text-[#94A3B8]">
                  Based on {scoredCount} of 4 skills — pending scores excluded
                </p>
              ) : null}
            </div>
          </div>

          <BandGapTable bands={bands} targetBand={targetBand} />
        </div>
      </div>
    </section>
  );
}
