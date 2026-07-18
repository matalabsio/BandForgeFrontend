import { ArrowRight } from "lucide-react";
import { BandGapTable } from "@/components/bandforge/dashboard/band-gap-table";
import {
  skillStatuses,
  type SkillBands,
} from "@/lib/diagnostic-performance";

type Props = {
  bands: SkillBands;
  currentBand: number;
  targetBand: number;
  gap: number;
};

export function DiagnosticBandGapCard({
  bands,
  currentBand,
  targetBand,
  gap,
}: Props) {
  const statuses = skillStatuses(bands, targetBand);

  return (
    <div className="rounded-2xl border border-[#E8EDF3] bg-white p-4 shadow-[0_2px_12px_rgba(13,31,60,0.05)] sm:rounded-[18px] sm:p-[22px] sm:px-[26px]">
      <div className="mb-3.5 flex items-center justify-between sm:hidden">
        <span className="font-display text-[14.5px] font-bold text-[#0D1F3C]">
          Your band gap
        </span>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-[#0D1F3C]">
          <span className="font-mono">
            {currentBand > 0 ? currentBand.toFixed(1) : "—"}
          </span>
          <ArrowRight className="size-3.5 text-[#94A3B8]" strokeWidth={2} />
          <span className="font-mono text-[#0097A7]">{targetBand.toFixed(1)}</span>
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
                {currentBand > 0 ? currentBand.toFixed(1) : "—"}
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
          <div className="mt-[15px]">
            {gap > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBEFD6] px-3 py-1.5 text-[12.5px] font-semibold text-[#9A6B12]">
                +{gap.toFixed(1)} band overall to close
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-[#E6F7FA] px-3 py-1.5 text-[12.5px] font-semibold text-[#0097A7]">
                On target
              </span>
            )}
          </div>
        </div>

        <BandGapTable bands={bands} targetBand={targetBand} statuses={statuses} />
      </div>
    </div>
  );
}
