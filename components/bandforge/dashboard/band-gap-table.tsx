import {
  skillLabel,
  skillStatuses,
  type SkillBands,
  type SkillKey,
  type SkillStatus,
} from "@/lib/diagnostic-performance";
import { cn } from "@/lib/utils";

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
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <span className="w-12 shrink-0 truncate text-[11px] font-semibold text-[#0D1F3C] sm:w-16 sm:text-[12.5px]">
        {skillLabel(skillKey)}
      </span>
      <span
        className={cn(
          "w-9 shrink-0 text-left text-[10px] font-semibold sm:w-[48px] sm:text-[11px]",
          score > 0
            ? cn("font-mono font-medium sm:text-[13.5px]", styles.score)
            : "text-[#94A3B8]",
        )}
        title={score > 0 ? undefined : "Pending review"}
      >
        {score > 0 ? score.toFixed(1) : (
          <>
            <span className="sm:hidden">—</span>
            <span className="hidden sm:inline">Pending</span>
          </>
        )}
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
        title={score > 0 ? undefined : "Pending review"}
      >
        {score > 0 ? (skillGap > 0 ? `+${skillGap.toFixed(1)}` : "—") : "—"}
      </span>
    </div>
  );
}

type Props = {
  bands: SkillBands;
  targetBand: number;
  statuses?: Record<SkillKey, SkillStatus>;
};

export function BandGapTable({ bands, targetBand, statuses }: Props) {
  const resolvedStatuses = statuses ?? skillStatuses(bands, targetBand);

  return (
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

      <div className="mb-2 hidden items-center gap-3 sm:flex">
        <span className="w-16" />
        <span className="w-[48px] text-[9.5px] font-semibold tracking-[0.05em] text-[#94A3B8] uppercase">
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
            status={resolvedStatuses[key]}
          />
        ))}
      </div>
    </div>
  );
}
