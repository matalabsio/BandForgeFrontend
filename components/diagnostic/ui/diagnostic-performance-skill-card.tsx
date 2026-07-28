import { AlertTriangle } from "lucide-react";
import type { SkillStatus } from "@/lib/diagnostic-performance";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  bandRange: string;
  status: SkillStatus;
  coaching: string;
  barPercent: number;
  pending?: boolean;
  onClick?: () => void;
};

const STATUS_LABELS: Record<SkillStatus, string> = {
  on_track: "On track",
  strongest: "Strongest",
  focus_area: "Focus area",
  priority: "Priority",
};

type StatusStyle = {
  card: string;
  band: string;
  badge: string;
  barTrack: string;
  barFill: string;
  coaching: string;
  dot: string;
  mark: string;
};

const CARD_STYLES: Record<SkillStatus, StatusStyle> = {
  on_track: {
    card: "border-[#E8EDF3] bg-white shadow-[0_2px_10px_rgba(13,31,60,0.05)]",
    band: "text-[#0D1F3C]",
    badge: "bg-[#E6F7FA] text-[#0097A7]",
    barTrack: "bg-[#EEF2F7]",
    barFill: "bg-[#00BCD4]",
    coaching: "text-[#64748B]",
    dot: "bg-[#00BCD4]",
    mark: "",
  },
  strongest: {
    card: "border-[#E8EDF3] bg-white shadow-[0_2px_10px_rgba(13,31,60,0.05)]",
    band: "text-[#0D1F3C]",
    badge: "bg-[#E6F7FA] text-[#0097A7]",
    barTrack: "bg-[#EEF2F7]",
    barFill: "bg-[#00BCD4]",
    coaching: "text-[#64748B]",
    dot: "bg-[#00BCD4]",
    mark: "",
  },
  focus_area: {
    card: "border-[#F0E0BE] bg-[#FFFCF6] shadow-[0_2px_10px_rgba(180,130,30,0.07)]",
    band: "text-[#9A6B12]",
    badge: "bg-[#FBEFD6] text-[#9A6B12]",
    barTrack: "bg-[#F2E8D2]",
    barFill: "bg-[#D9A441]",
    coaching: "text-[#8A7034]",
    dot: "bg-[#D9A441]",
    mark: "text-[#C58A1E]",
  },
  priority: {
    card: "border-[#F2CFC8] bg-[#FFF8F6] shadow-[0_2px_10px_rgba(200,70,55,0.07)]",
    band: "text-[#B23B30]",
    badge: "bg-[#FBE3DF] text-[#B23B30]",
    barTrack: "bg-[#F3D9D3]",
    barFill: "bg-[#E05A4D]",
    coaching: "text-[#A35248]",
    dot: "bg-[#E05A4D]",
    mark: "text-[#C5483A]",
  },
};

export function DiagnosticPerformanceSkillCard({
  label,
  bandRange,
  status,
  coaching,
  barPercent,
  pending = false,
  onClick,
}: Props) {
  const styles = CARD_STYLES[status];
  const isWeak = status === "focus_area" || status === "priority";

  const body = (
    <>
      <div className="mb-[11px] flex items-center justify-between gap-1.5 sm:mb-[18px] sm:gap-2">
        <span className="truncate text-[12px] font-semibold text-[#0D1F3C] sm:text-[15px]">
          {label}
        </span>

        {/* Mobile: compact dot / warning mark */}
        {isWeak ? (
          <AlertTriangle
            className={cn("size-3.5 shrink-0 sm:hidden", styles.mark)}
            strokeWidth={2.6}
          />
        ) : (
          <span
            className={cn("size-[7px] shrink-0 rounded-full sm:hidden", styles.dot)}
            aria-hidden
          />
        )}

        {/* Desktop: full text badge */}
        <span
          className={cn(
            "hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.01em] sm:inline-flex",
            styles.badge,
          )}
        >
          {isWeak ? (
            <AlertTriangle className="size-[11px] shrink-0" strokeWidth={2.6} />
          ) : null}
          {STATUS_LABELS[status]}
        </span>
      </div>

      <p
        className={cn(
          "mb-2 font-mono text-[20px] leading-none font-medium tracking-[-0.02em] sm:mb-[14px] sm:text-[30px]",
          styles.band,
        )}
      >
        {pending ? "Pending" : bandRange}
      </p>

      <div
        className={cn(
          "mb-2.5 h-[5px] overflow-hidden rounded-full sm:mb-[13px] sm:h-1.5",
          styles.barTrack,
        )}
      >
        {!pending && barPercent > 0 ? (
          <div
            className={cn("h-full rounded-full", styles.barFill)}
            style={{ width: `${Math.max(4, Math.min(100, barPercent))}%` }}
          />
        ) : null}
      </div>

      <p
        className={cn(
          "line-clamp-3 text-[11px] leading-snug sm:line-clamp-none sm:text-[13px]",
          styles.coaching,
        )}
      >
        {pending ? "Examiner review in progress." : coaching}
      </p>
    </>
  );

  const shellClass = cn(
    "flex h-full w-full min-w-0 flex-col rounded-2xl border p-3.5 text-left sm:rounded-[18px] sm:p-[22px] sm:pb-5",
    styles.card,
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          shellClass,
          "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40",
        )}
        aria-label={`Open ${label} review`}
      >
        {body}
      </button>
    );
  }

  return <div className={shellClass}>{body}</div>;
}
