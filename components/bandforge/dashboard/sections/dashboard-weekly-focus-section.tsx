"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { DASH_EASE } from "@/components/bandforge/dashboard/motion";
import { DailyGrowthReportModal } from "@/components/bandforge/plan/daily-growth-report-modal";
import type {
  LearningStudyDay,
  LearningStudyPlan,
  LearningStudyTask,
  SkillHubProgress,
} from "@/lib/learning-types";
import { localPlanDateKey } from "@/lib/plan-step-completion";
import { cn } from "@/lib/utils";

const SKILL_ORDER = ["listening", "reading", "writing", "speaking"] as const;

const SKILL_LABEL: Record<string, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

type FocusPresentation = {
  headline: string;
  skillKeys: (typeof SKILL_ORDER)[number][];
  support: string | null;
};

function presentWeeklyFocus(
  weeklyFocus: string | null | undefined,
  skillDifficulty: Record<string, string> | null | undefined,
): FocusPresentation | null {
  if (!weeklyFocus?.trim()) return null;

  let raw = weeklyFocus.trim().replace(/^Focus:\s*/i, "").trim();
  if (!raw) return null;

  const skillKeys = SKILL_ORDER.filter((key) => {
    const label = SKILL_LABEL[key];
    const re = new RegExp(`\\b${label}\\b`, "i");
    return re.test(raw);
  });

  const bareSkillList =
    skillKeys.length > 0 &&
    raw
      .replace(/\s*&\s*/g, " ")
      .replace(/,/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .every((token) =>
        SKILL_ORDER.some((k) => SKILL_LABEL[k].toLowerCase() === token.toLowerCase()),
      );

  let headline = raw;
  if (skillKeys.length === 1) {
    headline = SKILL_LABEL[skillKeys[0]];
  } else if (bareSkillList) {
    headline = skillKeys.map((k) => SKILL_LABEL[k]).join(" & ");
  }

  const hardFocus = skillKeys.filter((k) => skillDifficulty?.[k] === "hard");
  const easyFocus = skillKeys.filter((k) => skillDifficulty?.[k] === "easy");

  const afterDash = raw
    .split(/[—–|-]/)
    .slice(1)
    .join("—")
    .replace(/primary focus this week\.?/i, "")
    .trim();

  let support: string | null = null;
  if (hardFocus.length === 1 && skillKeys.length === 1) {
    support = "Highest priority this week.";
  } else if (hardFocus.length > 0) {
    support = `${hardFocus.map((k) => SKILL_LABEL[k]).join(" & ")} marked hard.`;
  } else if (easyFocus.length > 0 && skillKeys.length > 0) {
    support = "Build confidence here this week.";
  } else if (skillKeys.length === 1) {
    support = afterDash
      ? afterDash.charAt(0).toUpperCase() + afterDash.slice(1)
      : "Primary focus this week.";
  } else if (skillKeys.length > 0) {
    support = "Today’s work is built around this focus.";
  }

  return { headline, skillKeys, support };
}

const WEEKDAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"] as const;

type WeekDayBar = {
  date: string;
  letter: string;
  pct: number;
  done: number;
  total: number;
  isToday: boolean;
  isFuture: boolean;
  reportTasks: LearningStudyDay["tasks"];
  canOpenReport: boolean;
};

function localIsoFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function mondayWeekDates(todayIso: string): string[] {
  const d = new Date(`${todayIso}T12:00:00`);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return localIsoFromDate(x);
  });
}

function buildWeekFocusBars(
  plan: LearningStudyPlan | null | undefined,
  focusSkillKeys: string[],
  todayIso: string,
): { bars: WeekDayBar[]; done: number; total: number; pct: number } {
  const dates = mondayWeekDates(todayIso);
  const byDate = new Map<string, LearningStudyDay>();
  for (const week of plan?.weeks ?? []) {
    for (const day of week.days) {
      byDate.set(day.date, day);
    }
  }

  const skillFilter =
    focusSkillKeys.length > 0
      ? new Set(focusSkillKeys.map((k) => k.toLowerCase()))
      : null;

  let weekDone = 0;
  let weekTotal = 0;

  const bars: WeekDayBar[] = dates.map((date, i) => {
    const day = byDate.get(date);
    const allTasks = (day?.tasks ?? []).filter((t) => t.status !== "skipped");
    const tasks = allTasks.filter((t) => {
      if (!skillFilter) return true;
      return skillFilter.has((t.module || "").toLowerCase());
    });
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    if (date <= todayIso) {
      weekDone += done;
      weekTotal += total;
    }
    const isFuture = date > todayIso;
    return {
      date,
      letter: WEEKDAY_LETTERS[i],
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
      done,
      total,
      isToday: date === todayIso,
      isFuture,
      reportTasks: allTasks,
      canOpenReport: !isFuture && allTasks.length > 0,
    };
  });

  return {
    bars,
    done: weekDone,
    total: weekTotal,
    pct: weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0,
  };
}

type Props = {
  weeklyFocus?: string | null;
  skillDifficulty?: Record<string, string> | null;
  studyPlan?: LearningStudyPlan | null;
  examDate?: string | null;
  currentDay?: number | null;
  targetBand?: number | null;
  studentName?: string;
  hubProgress?: Record<string, SkillHubProgress>;
  currentBand?: number | null;
  overallPlanPct?: number;
};

function formatExamDate(examDate: string | null | undefined): string | null {
  if (!examDate) return null;
  const parsed = new Date(`${examDate.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  const sameYear = parsed.getFullYear() === new Date().getFullYear();
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
  }).format(parsed);
}

export function DashboardWeeklyFocusSection({
  weeklyFocus = null,
  skillDifficulty = null,
  studyPlan = null,
  examDate = null,
  currentDay = null,
  targetBand = null,
  studentName = "BandForge Student",
  hubProgress = {},
  currentBand = null,
  overallPlanPct = 0,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [reportDay, setReportDay] = useState<{
    date: string;
    tasks: LearningStudyTask[];
  } | null>(null);

  const focus = useMemo(
    () => presentWeeklyFocus(weeklyFocus, skillDifficulty),
    [weeklyFocus, skillDifficulty],
  );
  const todayIso = localPlanDateKey();
  const weekProgress = useMemo(
    () => buildWeekFocusBars(studyPlan, focus?.skillKeys ?? [], todayIso),
    [studyPlan, focus?.skillKeys, todayIso],
  );
  const targetLabel =
    targetBand != null && targetBand > 0 ? targetBand.toFixed(1) : "—";
  const examLabel = formatExamDate(examDate);

  return (
    <motion.section
      className="flex h-full min-w-0 flex-col overflow-hidden rounded-[24px] border border-ink/8 bg-white p-5 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] sm:p-6"
      aria-labelledby="weekly-focus-heading"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.45, ease: DASH_EASE }}
    >
      <div className="flex items-start justify-between gap-3">
        <h2
          id="weekly-focus-heading"
          className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl"
        >
          This week&apos;s focus
        </h2>
        <p className="shrink-0 pt-1 text-[12px] font-semibold tabular-nums text-muted">
          {examLabel ? `Exam ${examLabel}` : "Exam unset"}
        </p>
      </div>

      {focus ? (
        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl sm:leading-none">
                {focus.headline}
              </p>
              {focus.skillKeys.map((key) => {
                const tag = skillDifficulty?.[key];
                if (tag !== "hard" && tag !== "easy") return null;
                const hard = tag === "hard";
                return (
                  <span
                    key={key}
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      hard
                        ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80"
                        : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80",
                    )}
                  >
                    {focus.skillKeys.length > 1
                      ? `${SKILL_LABEL[key]} · `
                      : null}
                    {hard ? "Hard" : "Easy"}
                  </span>
                );
              })}
            </div>
            {focus.support ? (
              <p className="mt-1.5 text-[13px] leading-snug text-muted">
                {focus.support}
              </p>
            ) : null}
          </div>

          <div className="mt-auto">
            <div
              className="grid grid-cols-7 gap-2"
              role="list"
              aria-label={
                weekProgress.total > 0
                  ? `This week ${weekProgress.done} of ${weekProgress.total} focus tasks done. Tap a day to open its growth report.`
                  : "No focus tasks scheduled this week yet"
              }
            >
              {weekProgress.bars.map((bar) => {
                const openReport = () => {
                  if (!bar.canOpenReport) return;
                  setReportDay({
                    date: bar.date,
                    tasks: bar.reportTasks,
                  });
                };
                return (
                  <div key={bar.date} role="listitem" className="min-w-0">
                    <button
                      type="button"
                      disabled={!bar.canOpenReport}
                      onClick={openReport}
                      aria-current={bar.isToday ? "date" : undefined}
                      aria-label={
                        bar.canOpenReport
                          ? `Open growth report for ${bar.date}`
                          : bar.isFuture
                            ? `${bar.date} upcoming`
                            : `${bar.date} has no plan tasks`
                      }
                      title={
                        bar.canOpenReport
                          ? `${bar.done}/${bar.total || bar.reportTasks.length} · Open report`
                          : bar.isFuture
                            ? "Upcoming"
                            : "No plan tasks"
                      }
                      className={cn(
                        "flex h-9 w-full items-center justify-center rounded-xl text-[12px] font-semibold transition-colors duration-200 sm:h-10",
                        bar.canOpenReport
                          ? "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
                          : "cursor-default",
                        bar.isToday
                          ? "bg-teal text-white"
                          : bar.pct >= 100
                            ? "bg-teal/90 text-white"
                            : bar.pct > 0
                              ? "bg-cyan/20 text-teal ring-1 ring-cyan/25"
                              : "bg-ink/[0.06] text-muted-light",
                        bar.canOpenReport &&
                          !bar.isToday &&
                          "hover:bg-cyan-soft hover:text-teal",
                      )}
                    >
                      {bar.letter}
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[12px] text-muted">
              {weekProgress.total > 0
                ? `${weekProgress.done}/${weekProgress.total} this week`
                : "No focus tasks yet"}
              {currentDay != null && currentDay > 0 ? ` · Day ${currentDay}` : ""}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-1 flex-col justify-center">
          <p className="font-display text-xl font-bold tracking-tight text-ink">
            Stay consistent toward band {targetLabel}
          </p>
        </div>
      )}

      <DailyGrowthReportModal
        open={reportDay != null}
        onClose={() => setReportDay(null)}
        studentName={studentName}
        reportDate={
          reportDay ? new Date(`${reportDay.date}T12:00:00`) : new Date()
        }
        tasks={reportDay?.tasks ?? []}
        hubProgress={hubProgress}
        currentBand={currentBand}
        targetBand={targetBand}
        overallPlanPct={overallPlanPct}
      />
    </motion.section>
  );
}
