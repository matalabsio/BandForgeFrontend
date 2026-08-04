"use client";

import { useMemo } from "react";
import { BookOpen, Clock3, Target, Trophy } from "lucide-react";
import { BandForgeLogoMark } from "@/components/bandforge/bandforge-logo-link";
import type { LearningStudyTask, SkillHubProgress } from "@/lib/learning-types";
import { readPlanDayOutcomes } from "@/lib/plan-daily-progress";

type Props = {
  studentName: string;
  reportDate: Date;
  tasks: LearningStudyTask[];
  hubProgress?: Record<string, SkillHubProgress>;
  currentBand?: number | null;
  targetBand?: number | null;
  overallPlanPct?: number;
};

const SKILLS = ["listening", "reading", "writing", "speaking"] as const;

function formatBand(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return v.toFixed(1);
}

function titleCaseSkill(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function sumMinutes(tasks: LearningStudyTask[]): number {
  return tasks.reduce((acc, t) => acc + (t.duration_min ?? 0), 0);
}

function displayStudentName(raw: string): string {
  const name = raw.trim();
  if (!name) return "BandForge Student";
  if (name.includes("@")) {
    const local = name.split("@")[0]?.replace(/[._+]/g, " ").trim() || name;
    return local
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
  return name;
}

export function DailyGrowthReportCard({
  studentName,
  reportDate,
  tasks,
  hubProgress = {},
  currentBand = null,
  targetBand = null,
  overallPlanPct = 0,
}: Props) {
  const visible = tasks.filter((t) => t.status !== "skipped");
  const done = visible.filter((t) => t.status === "done");
  const doneMinutes = sumMinutes(done);
  const doneSkills = new Set(done.map((t) => t.module).filter(Boolean));
  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(reportDate);
  const shownName = displayStudentName(studentName);

  const outcomes = useMemo(() => readPlanDayOutcomes(), []);
  const outcomeBySkill = useMemo(() => {
    const map = new Map<string, (typeof outcomes)[number]>();
    for (const o of outcomes) {
      map.set(o.skill, o);
    }
    return map;
  }, [outcomes]);

  return (
    <div
      data-daily-report-card
      className="mx-auto flex aspect-[3/4] w-full max-w-[340px] flex-col overflow-hidden rounded-[22px] border border-cyan/20 bg-[linear-gradient(165deg,rgba(224,247,250,0.85),rgba(255,255,255,1)_42%)] p-4 text-ink shadow-[0_12px_40px_rgba(2,8,23,0.12)] sm:max-w-[360px] sm:p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <BandForgeLogoMark size="sm" className="!h-6 sm:!h-7" />
          <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-teal sm:text-[10px]">
            Daily Growth Report
          </p>
          <h3 className="mt-0.5 font-display text-[17px] font-bold tracking-tight sm:text-[19px]">
            Progress Card
          </h3>
        </div>
        <div className="shrink-0 rounded-lg bg-white/95 px-2.5 py-1.5 text-right ring-1 ring-ink/5">
          <p className="text-[9px] uppercase tracking-[0.08em] text-muted">
            Date
          </p>
          <p className="mt-0.5 text-[11px] font-semibold tabular-nums sm:text-[12px]">
            {dateLabel}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-white/95 px-3 py-2.5 ring-1 ring-ink/5">
        <p className="text-[9px] uppercase tracking-[0.08em] text-muted">
          Student
        </p>
        <p className="mt-0.5 truncate font-display text-[15px] font-bold sm:text-[16px]">
          {shownName}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {(
          [
            {
              label: "Tasks",
              value: `${done.length}/${visible.length}`,
              Icon: Trophy,
            },
            {
              label: "Minutes",
              value: String(doneMinutes),
              Icon: Clock3,
            },
            {
              label: "Skills",
              value: String(doneSkills.size),
              Icon: BookOpen,
            },
            {
              label: "Plan",
              value: `${Math.max(0, Math.min(100, Math.round(overallPlanPct)))}%`,
              Icon: Target,
            },
          ] as const
        ).map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-white px-2.5 py-2 ring-1 ring-ink/6"
          >
            <p className="flex items-center gap-1 text-[9px] uppercase tracking-[0.08em] text-muted">
              <stat.Icon className="size-3 text-teal" aria-hidden />
              {stat.label}
            </p>
            <p className="mt-0.5 font-display text-[17px] font-bold tabular-nums sm:text-[18px]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-hidden">
        {SKILLS.map((skill) => {
          const hub = hubProgress[skill];
          const accuracy = outcomeBySkill.get(skill)?.accuracyPct;
          return (
            <div
              key={skill}
              className="flex items-center justify-between gap-2 rounded-lg border border-ink/7 bg-white px-2.5 py-1.5"
            >
              <p className="text-[11px] font-semibold sm:text-[12px]">
                {titleCaseSkill(skill)}
              </p>
              <p className="truncate text-[10.5px] text-muted sm:text-[11px]">
                {accuracy != null
                  ? `${accuracy}% accuracy`
                  : hub
                    ? `${hub.completed_count}/${hub.total_count} hubs`
                    : "No score yet"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 shrink-0 rounded-xl bg-navy px-3 py-2.5 text-white">
        <p className="text-[9px] uppercase tracking-[0.08em] text-cyan/90">
          Band Target
        </p>
        <p className="mt-0.5 font-display text-[15px] font-bold tabular-nums sm:text-[16px]">
          {formatBand(currentBand)} → {formatBand(targetBand)}
        </p>
      </div>
    </div>
  );
}
