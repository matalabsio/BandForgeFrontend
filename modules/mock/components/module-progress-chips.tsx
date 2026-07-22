"use client";

import type { ModuleProgress } from "@/modules/mock/services/mock-api";
import {
  computeMockProgressPercent,
  defaultModuleProgress,
  sortModules,
  withFreeModuleAccess,
} from "@/modules/mock/lib/mock-progress";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  reading: "Reading",
  listening: "Listening",
  writing: "Writing",
  speaking: "Speaking",
};

type ChipIcon = "check" | "progress" | "lock" | "soon";

function chipIcon(m: ModuleProgress): ChipIcon {
  if (!m.is_enabled) return "soon";
  if (m.status === "completed") return "check";
  if (m.status === "in_progress" || m.status === "available") return "progress";
  return "lock";
}

const ICON_GLYPH: Record<ChipIcon, string> = {
  check: "✓",
  progress: "◷",
  lock: "🔒",
  soon: "—",
};

type Props = {
  modules?: ModuleProgress[] | null;
  showProgressBar?: boolean;
  className?: string;
};

export function ModuleProgressChips({
  modules,
  showProgressBar = true,
  className,
}: Props) {
  const rows = sortModules(
    withFreeModuleAccess(modules?.length ? modules : defaultModuleProgress()),
  );
  const percent = computeMockProgressPercent(rows);

  return (
    <div className={cn("space-y-3", className)}>
      <ul className="flex flex-wrap gap-2">
        {rows.map((m) => {
          const icon = chipIcon(m);
          const label = LABELS[m.module] ?? m.module;
          return (
            <li
              key={m.module}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold",
                m.status === "completed" &&
                  "border-emerald-200 bg-emerald-50 text-emerald-800",
                (m.status === "in_progress" || m.status === "available") &&
                  m.is_enabled &&
                  "border-amber-200 bg-amber-50 text-amber-900",
                m.status === "locked" &&
                  m.is_enabled &&
                  "border-ink/10 bg-surface text-ink/45",
                !m.is_enabled &&
                  "border-dashed border-ink/15 bg-white text-ink/40",
              )}
            >
              <span aria-hidden className="text-[10px] leading-none">
                {ICON_GLYPH[icon]}
              </span>
              <span>{label}</span>
            </li>
          );
        })}
      </ul>
      {showProgressBar ? (
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-ink/50">
            <span>Progress</span>
            <span>{percent}%</span>
          </div>
          <div
            className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/8"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-cyan transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
