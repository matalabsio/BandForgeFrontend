import type { SkillBreakdownEntry } from "@/modules/listening/types";

function barColorClass(pct: number): string {
  const percent = Math.round(pct * 100);
  if (percent >= 70) return "bg-emerald-500";
  if (percent >= 50) return "bg-amber-500";
  return "bg-red-500";
}

type Props = {
  skill: string;
  entry: SkillBreakdownEntry;
};

export function SkillBar({ skill, entry }: Props) {
  const pct = Math.round(entry.pct * 100);
  return (
    <li>
      <div className="flex items-center justify-between text-meta">
        <span className="font-semibold capitalize text-navy">
          {skill.replaceAll("_", " ")}
        </span>
        <span className="tabular-nums text-ink/70">
          {entry.correct}/{entry.total} ({pct}%)
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface">
        <div
          className={`h-full ${barColorClass(entry.pct)}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </li>
  );
}
