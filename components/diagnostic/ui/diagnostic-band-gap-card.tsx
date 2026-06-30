import { ArrowRight } from "lucide-react";
import {
  skillLabel,
  skillStatuses,
  type SkillBands,
  type SkillKey,
  type SkillStatus,
} from "@/lib/diagnostic-performance";
import { cn } from "@/lib/utils";

type Props = {
  bands: SkillBands;
  currentBand: number;
  targetBand: number;
  gap: number;
};

const SKILL_ORDER: SkillKey[] = ["listening", "reading", "writing", "speaking"];

type BarStyle = {
  score: string;
  gap: string;
  fill: string;
};

const BAR_STYLES: Record<SkillStatus, BarStyle> = {
  on_track: {
    score: "text-[#0097A7]",
    gap: "text-[#0097A7]",
    fill: "bg-[#00BCD4]",
  },
  strongest: {
    score: "text-[#0097A7]",
    gap: "text-[#0097A7]",
    fill: "bg-[#00BCD4]",
  },
  focus_area: {
    score: "text-[#9A6B12]",
    gap: "text-[#9A6B12]",
    fill: "bg-[#D9A441]",
  },
  priority: {
    score: "text-[#B23B30]",
    gap: "text-[#B23B30]",
    fill: "bg-[#E05A4D]",
  },
};

function SkillRow({
  skillKey,
  band,
  targetBand,
  status,
}: {
  skillKey: SkillKey;
  band: number | null;
  targetBand: number;
  status: SkillStatus;
}) {
  const score = band != null && band > 0 ? band : 0;
  const widthPct = Math.min(100, Math.max(4, (score / 9) * 100));
  const targetPct = Math.min(100, (targetBand / 9) * 100);
  const skillGap = score > 0 ? Math.max(0, targetBand - score) : 0;
  const styles = BAR_STYLES[status];

  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      <span className="w-14 shrink-0 text-[11.5px] font-semibold text-[#0D1F3C] sm:w-16 sm:text-[12.5px]">
        {skillLabel(skillKey)}
      </span>
      <span
        className={cn(
          "w-[26px] shrink-0 font-mono text-xs font-medium sm:w-[30px] sm:text-[13.5px]",
          score > 0 ? styles.score : "text-[#94A3B8]",
        )}
      >
        {score > 0 ? score.toFixed(1) : "—"}
      </span>
      <div className="relative h-2 min-w-0 flex-1 rounded-full bg-[#EEF2F7] sm:h-2.5">
        {score > 0 ? (
          <div
            className={cn("absolute inset-y-0 left-0 rounded-full", styles.fill)}
            style={{ width: `${widthPct}%` }}
          />
        ) : null}
        <div
          className="absolute top-1/2 h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#0D1F3C] sm:h-4"
          style={{ left: `${targetPct}%` }}
          aria-hidden
        />
      </div>
      <span
        className={cn(
          "w-8 shrink-0 text-right font-mono text-[11.5px] font-medium sm:w-[38px] sm:text-[13px]",
          skillGap > 0 ? styles.gap : "text-[#94A3B8]",
        )}
      >
        {skillGap > 0 ? `+${skillGap.toFixed(1)}` : score > 0 ? "—" : ""}
      </span>
    </div>
  );
}

export function DiagnosticBandGapCard({
  bands,
  currentBand,
  targetBand,
  gap,
}: Props) {
  const statuses = skillStatuses(bands, targetBand);

  return (
    <div className="rounded-2xl border border-[#E8EDF3] bg-white p-4 shadow-[0_2px_12px_rgba(13,31,60,0.05)] sm:rounded-[18px] sm:p-[22px] sm:px-[26px]">
      {/* Mobile: compact band gap header */}
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
        {/* Left: Now / Target + pill — desktop only layout */}
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

        {/* Right: per-skill bars */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-baseline justify-between sm:mb-2.5">
            <span className="text-[10px] font-semibold tracking-[0.06em] text-[#94A3B8] uppercase sm:text-[11px]">
              <span className="sm:hidden">Skill · now · gap</span>
              <span className="hidden sm:inline">By skill</span>
            </span>
            <span className="text-[10px] font-medium text-[#94A3B8] sm:text-[11px]">
              <span className="sm:hidden">│ = target {targetBand.toFixed(1)}</span>
              <span className="hidden sm:inline">
                │ = Band {targetBand.toFixed(1)} target
              </span>
            </span>
          </div>

          {/* Column headers — desktop */}
          <div className="mb-2 hidden items-center gap-3 sm:flex">
            <span className="w-16" />
            <span className="w-[30px] text-[9.5px] font-semibold tracking-[0.05em] text-[#94A3B8] uppercase">
              Now
            </span>
            <span className="flex-1" />
            <span className="w-[38px] text-right text-[9.5px] font-semibold tracking-[0.05em] text-[#94A3B8] uppercase">
              Gap
            </span>
          </div>

          <div className="flex flex-col gap-2.5 sm:gap-[11px]">
            {SKILL_ORDER.map((key) => (
              <SkillRow
                key={key}
                skillKey={key}
                band={bands[key]}
                targetBand={targetBand}
                status={statuses[key]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
