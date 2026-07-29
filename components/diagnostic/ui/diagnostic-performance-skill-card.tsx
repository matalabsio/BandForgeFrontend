import { AlertTriangle, Headphones, BookOpen, Pencil, Mic } from "lucide-react";
import type {
  ResultsScoreTone,
  SkillStatus,
} from "@/lib/diagnostic-performance";
import { resultsScoreLabel } from "@/lib/diagnostic-performance";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  bandRange: string;
  status: SkillStatus;
  coaching: string;
  barPercent: number;
  pending?: boolean;
  onClick?: () => void;
  variant?: "default" | "results";
  scoreTone?: ResultsScoreTone;
};

const SKILL_ICONS: Record<string, typeof Headphones> = {
  Listening: Headphones,
  Reading: BookOpen,
  Writing: Pencil,
  Speaking: Mic,
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
  name: string;
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
    name: "text-[#0D1F3C]",
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
    name: "text-[#0D1F3C]",
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
    name: "text-[#9A6B12]",
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
    name: "text-[#B23B30]",
  },
};

/** Colors driven by absolute band score. */
const TONE_STYLES: Record<ResultsScoreTone, StatusStyle> = {
  strong: {
    card: "border-[#9AD8E0] bg-[#E8F7F9]",
    band: "text-[#0A6B75]",
    badge: "bg-[#0097A7] text-white",
    barTrack: "",
    barFill: "",
    coaching: "text-[#3D6F78]",
    dot: "",
    mark: "",
    name: "text-[#0A6B75]",
  },
  room_to_grow: {
    card: "border-[#E8C98A] bg-[#FFF8EB]",
    band: "text-[#8A5A0A]",
    badge: "bg-[#C4860F] text-white",
    barTrack: "",
    barFill: "",
    coaching: "text-[#7A6230]",
    dot: "",
    mark: "",
    name: "text-[#8A5A0A]",
  },
  needs_work: {
    card: "border-[#E8A99A] bg-[#FFF4F1]",
    band: "text-[#A83228]",
    badge: "bg-[#C4453A] text-white",
    barTrack: "",
    barFill: "",
    coaching: "text-[#8F4A42]",
    dot: "",
    mark: "",
    name: "text-[#A83228]",
  },
  pending: {
    card: "border-[#D5DCE6] bg-[#F4F6F9]",
    band: "text-[#64748B]",
    badge: "bg-[#64748B] text-white",
    barTrack: "",
    barFill: "",
    coaching: "text-[#64748B]",
    dot: "",
    mark: "",
    name: "text-[#0B1B33]",
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
  variant = "default",
  scoreTone,
}: Props) {
  if (variant === "results") {
    const tone = scoreTone ?? (pending ? "pending" : "room_to_grow");
    const styles = TONE_STYLES[tone];
    const badgeLabel = resultsScoreLabel(tone);
    const SkillIcon = SKILL_ICONS[label] ?? null;
    const body = (
      <>
        <div className="mb-2 flex items-center gap-2">
          <span
            className={cn(
              "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-[0.04em] uppercase",
              styles.badge,
            )}
          >
            {badgeLabel}
          </span>
        </div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className={cn("flex items-center gap-1.5 text-[16px] font-bold sm:text-[17px]", styles.name)}>
            {SkillIcon ? <SkillIcon className="size-4 shrink-0" strokeWidth={2} /> : null}
            {label}
          </span>
          <span
            className={cn(
              "font-mono text-[26px] leading-none font-bold tracking-[-0.02em] sm:text-[27px]",
              styles.band,
            )}
          >
            {tone === "pending" ? "—" : bandRange}
          </span>
        </div>
        <p className={cn("text-[13px] leading-relaxed sm:text-[14px]", styles.coaching)}>
          {coaching}
        </p>
      </>
    );

    const shellClass = cn(
      "flex h-full min-h-[120px] w-full min-w-0 flex-col rounded-[14px] border p-4 text-left sm:min-h-[140px] sm:px-5 sm:py-4",
      styles.card,
    );

    if (onClick) {
      return (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            shellClass,
            "cursor-pointer transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40",
          )}
          aria-label={`Open ${label} review`}
        >
          {body}
        </button>
      );
    }

    return <div className={shellClass}>{body}</div>;
  }

  const styles = CARD_STYLES[status];
  const isWeak = status === "focus_area" || status === "priority";

  const body = (
    <>
      <div className="mb-[11px] flex items-center justify-between gap-1.5 sm:mb-[18px] sm:gap-2">
        <span className="truncate text-[12px] font-semibold text-[#0D1F3C] sm:text-[15px]">
          {label}
        </span>

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
