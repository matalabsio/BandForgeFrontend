"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  DASH_EASE,
  DashProgressBar,
} from "@/components/bandforge/dashboard/motion";
import { DailyGrowthReportModal } from "@/components/bandforge/plan/daily-growth-report-modal";
import type {
  LearningStudyDay,
  LearningStudyPlan,
  LearningStudyTask,
  SkillHubProgress,
} from "@/lib/learning-types";
import { cachePlanDayTasks } from "@/lib/plan-day-tasks";
import type { DashboardStartNow } from "@/lib/plan-start-task";
import { localPlanDateKey } from "@/lib/plan-step-completion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Props = {
  targetBand: number | null;
  currentDay: number | null;
  totalDays: number | null;
  weeklyFocus?: string | null;
  skillDifficulty?: Record<string, string> | null;
  daysRemaining?: number | null;
  examDate?: string | null;
  studyDaysCompleted?: number;
  bandGapCurrent: number | null;
  bandGapDelta: number;
  bandGapScoredCount: number;
  bandGapIsPartial: boolean;
  resolvedTargetBand: number;
  studyPlan?: LearningStudyPlan | null;
  studentName?: string;
  hubProgress?: Record<string, SkillHubProgress>;
  currentBand?: number | null;
  overallPlanPct?: number;
  startNow?: DashboardStartNow | null;
  startNowCacheTasks?: LearningStudyTask[];
};

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

/** Turn backend stubs like "Focus: Writing" into a readable week headline. */
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

  // Bare skill list from the planner ("Writing", "Writing & Speaking").
  const bareSkillList = skillKeys.length > 0 &&
    raw
      .replace(/\s*&\s*/g, " ")
      .replace(/,/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .every((token) =>
        SKILL_ORDER.some((k) => SKILL_LABEL[k].toLowerCase() === token.toLowerCase()),
      );

  let headline = raw;
  if (bareSkillList) {
    headline =
      skillKeys.length === 1
        ? `Strengthen ${SKILL_LABEL[skillKeys[0]]}`
        : `Prioritise ${skillKeys.map((k) => SKILL_LABEL[k]).join(" & ")}`;
  } else if (/^strengthen\s/i.test(raw) === false && skillKeys.length === 1 && raw === SKILL_LABEL[skillKeys[0]]) {
    headline = `Strengthen ${SKILL_LABEL[skillKeys[0]]}`;
  }

  const hardFocus = skillKeys.filter((k) => skillDifficulty?.[k] === "hard");
  const easyFocus = skillKeys.filter((k) => skillDifficulty?.[k] === "easy");

  let support: string | null = null;
  if (hardFocus.length === 1 && skillKeys.length === 1) {
    support = "Highest priority for closing your band gap this week.";
  } else if (hardFocus.length > 0) {
    support = `${hardFocus.map((k) => SKILL_LABEL[k]).join(" & ")} marked hard — extra reps here pay off fastest.`;
  } else if (easyFocus.length > 0 && skillKeys.length > 0) {
    support = "Build confidence here while you protect harder skills.";
  } else if (skillKeys.length > 0) {
    support = "Your plan stacks today's work around this focus.";
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
  /** Full plan-day tasks for the growth report card. */
  reportTasks: LearningStudyDay["tasks"];
  canOpenReport: boolean;
};

function localIsoFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Monday-start week containing `todayIso` (local calendar). */
function mondayWeekDates(todayIso: string): string[] {
  const d = new Date(`${todayIso}T12:00:00`);
  const day = d.getDay(); // 0 Sun … 6 Sat
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return localIsoFromDate(x);
  });
}

/**
 * Per-day completion for this calendar week, preferring focus-skill tasks
 * when the week focuses on specific modules.
 */
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

function formatExamDate(examDate: string | null | undefined): string | null {
  if (!examDate) return null;
  const parsed = new Date(`${examDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function DashboardWelcomeSection({
  targetBand,
  currentDay,
  totalDays,
  weeklyFocus = null,
  skillDifficulty = null,
  daysRemaining = null,
  examDate = null,
  studyDaysCompleted = 0,
  bandGapCurrent,
  bandGapDelta,
  bandGapScoredCount,
  bandGapIsPartial,
  resolvedTargetBand,
  studyPlan = null,
  studentName = "BandForge Student",
  hubProgress = {},
  currentBand = null,
  overallPlanPct = 0,
  startNow = null,
  startNowCacheTasks = [],
}: Props) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const nowRef = useRef<HTMLParagraphElement>(null);
  const targetRef = useRef<HTMLParagraphElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const dayRef = useRef<HTMLParagraphElement>(null);
  const bandFillRef = useRef<HTMLDivElement>(null);
  const [reportDay, setReportDay] = useState<{
    date: string;
    tasks: LearningStudyTask[];
  } | null>(null);

  const targetLabel =
    targetBand != null && targetBand > 0 ? targetBand.toFixed(1) : "—";
  const day = currentDay ?? 1;
  const total = totalDays ?? 0;
  const planPct =
    total > 0 ? Math.min(100, Math.round((day / total) * 100)) : 0;

  const bandPct =
    bandGapCurrent != null && resolvedTargetBand > 0
      ? Math.min(
          100,
          Math.round((bandGapCurrent / resolvedTargetBand) * 100),
        )
      : 0;

  const focus = useMemo(
    () => presentWeeklyFocus(weeklyFocus, skillDifficulty),
    [weeklyFocus, skillDifficulty],
  );

  const todayIso = localPlanDateKey();

  const weekProgress = useMemo(
    () => buildWeekFocusBars(studyPlan, focus?.skillKeys ?? [], todayIso),
    [studyPlan, focus?.skillKeys, todayIso],
  );

  const examLabel = formatExamDate(examDate);

  let countdownLabel = "Set exam date";
  if (daysRemaining != null) {
    if (daysRemaining === 0 && examDate) {
      countdownLabel =
        examDate < todayIso ? "Exam passed" : "Exam today";
    } else if (daysRemaining > 0) {
      countdownLabel = `${daysRemaining}d left`;
    } else {
      countdownLabel = "Exam passed";
    }
  }

  useGSAP(
    () => {
      const root = rootRef.current;
      const fill = bandFillRef.current;
      if (!root) return;

      const setNow = (text: string) => {
        if (nowRef.current) nowRef.current.textContent = text;
      };
      const setTarget = (text: string) => {
        if (targetRef.current) targetRef.current.textContent = text;
      };
      const setPct = (text: string) => {
        if (pctRef.current) pctRef.current.textContent = text;
      };
      const setDay = (n: number) => {
        if (!dayRef.current) return;
        const suffix =
          total > 0
            ? ` / ${total}`
            : "";
        dayRef.current.innerHTML =
          `${n}<span class="text-base font-semibold text-muted">${suffix}</span>`;
      };

      if (reduceMotion) {
        setNow(
          bandGapCurrent != null ? bandGapCurrent.toFixed(1) : "—",
        );
        setTarget(resolvedTargetBand.toFixed(1));
        setPct(bandGapCurrent != null ? `${bandPct}%` : "—");
        setDay(day);
        if (fill) {
          gsap.set(fill, {
            width: `${bandGapCurrent != null ? bandPct : 0}%`,
          });
        }
        return;
      }

      setNow(bandGapCurrent != null ? "0.0" : "—");
      setTarget("0.0");
      setPct(bandGapCurrent != null ? "0%" : "—");
      setDay(0);
      if (fill) gsap.set(fill, { width: "0%" });

      const nowObj = { v: 0 };
      const targetObj = { v: 0 };
      const pctObj = { v: 0 };
      const dayObj = { v: 0 };

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: root,
          start: "top 88%",
          once: true,
        },
      });

      if (bandGapCurrent != null) {
        tl.to(
          nowObj,
          {
            v: bandGapCurrent,
            duration: 1.1,
            onUpdate: () => setNow(nowObj.v.toFixed(1)),
          },
          0.05,
        );
      }

      tl.to(
        targetObj,
        {
          v: resolvedTargetBand,
          duration: 1.1,
          onUpdate: () => setTarget(targetObj.v.toFixed(1)),
        },
        0.12,
      );

      if (fill && bandGapCurrent != null) {
        tl.to(
          fill,
          { width: `${bandPct}%`, duration: 1.25, ease: "power3.out" },
          0.2,
        );
        tl.to(
          pctObj,
          {
            v: bandPct,
            duration: 1.25,
            onUpdate: () => setPct(`${Math.round(pctObj.v)}%`),
          },
          0.2,
        );
      }

      tl.to(
        dayObj,
        {
          v: day,
          duration: 1,
          onUpdate: () => setDay(Math.round(dayObj.v)),
        },
        0.25,
      );

      const chipsEl = root.querySelectorAll("[data-band-gap-chip]");
      if (chipsEl.length) {
        tl.fromTo(
          chipsEl,
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.06 },
          0.55,
        );
      }
    },
    {
      scope: rootRef,
      dependencies: [
        day,
        total,
        bandGapCurrent,
        resolvedTargetBand,
        bandPct,
        reduceMotion,
      ],
    },
  );

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden rounded-[24px] border border-ink/8 bg-white shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,188,212,0.12),transparent_52%)]"
        aria-hidden
      />

      <div className="relative border-b border-ink/[0.06] bg-[linear-gradient(160deg,rgba(224,247,250,0.88),rgba(255,255,255,0.92)_65%)] px-4 py-4 sm:px-6 sm:py-5">
        <div
          className={cn(
            "grid gap-5",
            startNow
              ? "lg:grid-cols-[minmax(0,1fr)_minmax(240px,22rem)] lg:items-stretch lg:gap-6 xl:gap-8"
              : "lg:grid-cols-[minmax(0,1fr)_minmax(200px,18rem)] lg:items-end lg:gap-10",
          )}
        >
          <div className="flex min-w-0 flex-col justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-light">
                Your band gap
              </p>
              <div className="mt-2.5 flex flex-wrap items-end gap-4 sm:gap-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-light">
                    Now
                  </p>
                  <p
                    ref={nowRef}
                    className="mt-0.5 font-mono text-[2.1rem] leading-none font-medium tracking-tight text-ink sm:text-[2.35rem]"
                  >
                    {bandGapCurrent != null ? bandGapCurrent.toFixed(1) : "—"}
                  </p>
                </div>
                <ArrowUpRight
                  className="mb-1.5 size-5 shrink-0 text-muted-light"
                  strokeWidth={2}
                  aria-hidden
                />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-light">
                    Target
                  </p>
                  <p
                    ref={targetRef}
                    className="mt-0.5 font-mono text-[2.1rem] leading-none font-medium tracking-tight text-teal sm:text-[2.35rem]"
                  >
                    {resolvedTargetBand.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {bandGapDelta > 0 && bandGapCurrent != null ? (
                  <span
                    data-band-gap-chip
                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[12px] font-semibold text-amber-900 ring-1 ring-amber-200/70"
                  >
                    <TrendingUp className="size-3.5" strokeWidth={2.5} aria-hidden />
                    +{bandGapDelta.toFixed(1)} band overall to close
                  </span>
                ) : bandGapCurrent != null ? (
                  <span
                    data-band-gap-chip
                    className="inline-flex items-center gap-1.5 rounded-full bg-cyan-soft px-2.5 py-1 text-[12px] font-semibold text-teal ring-1 ring-cyan/25"
                  >
                    <Sparkles className="size-3.5" strokeWidth={2.5} aria-hidden />
                    On target
                  </span>
                ) : (
                  <span
                    data-band-gap-chip
                    className="inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-[12px] font-semibold text-muted ring-1 ring-ink/8"
                  >
                    Complete a skill check to see your gap
                  </span>
                )}
                {bandGapIsPartial ? (
                  <p data-band-gap-chip className="text-[12px] text-muted">
                    Based on {bandGapScoredCount} of 4 skills — pending excluded
                  </p>
                ) : null}
              </div>
            </div>

            <div className="w-full min-w-0">
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted">
                <span>Progress to target</span>
                <span
                  ref={pctRef}
                  className="font-mono font-semibold tabular-nums text-ink"
                >
                  {bandGapCurrent != null ? `${bandPct}%` : "—"}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/85 ring-1 ring-ink/5">
                <div
                  ref={bandFillRef}
                  className={cn(
                    "h-full rounded-full will-change-[width]",
                    bandGapCurrent != null
                      ? "bg-gradient-to-r from-teal to-cyan"
                      : "bg-ink/10",
                  )}
                  style={
                    reduceMotion
                      ? { width: `${bandGapCurrent != null ? bandPct : 0}%` }
                      : { width: "0%" }
                  }
                />
              </div>
            </div>
          </div>

          {startNow ? (
            <div className="relative flex h-full min-w-0 flex-col justify-between gap-4 overflow-hidden rounded-2xl bg-navy p-4 text-white sm:p-5">
              <div
                className="pointer-events-none absolute -top-10 -right-10 size-36 rounded-full bg-cyan/20 blur-3xl"
                aria-hidden
              />
              <div className="relative min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan">
                  Start now · test first
                </p>
                <p className="mt-1.5 font-display text-[1.05rem] font-bold tracking-tight sm:text-lg">
                  {startNow.title}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-white/70">
                  {startNow.meta}
                </p>
              </div>
              <Link
                href={startNow.href}
                onClick={() => {
                  if (startNowCacheTasks.length > 0) {
                    cachePlanDayTasks(startNowCacheTasks);
                  }
                }}
                className="relative inline-flex min-h-11 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan px-5 py-2.5 text-[14px] font-bold text-navy shadow-[0_0_24px_rgba(0,188,212,0.35)] transition-colors hover:bg-brand-sky-hover sm:min-h-12 sm:text-[15px]"
              >
                {startNow.ctaLabel}
                <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative grid items-stretch gap-5 p-4 sm:gap-6 sm:p-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(250px,0.95fr)] lg:p-6">
        <div className="flex min-w-0 flex-col">
          {focus ? (
            <motion.div
              className="flex h-full flex-col rounded-2xl border border-cyan/20 bg-[linear-gradient(145deg,rgba(224,247,250,0.65),rgba(255,255,255,0.9))] p-4 sm:p-5"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: DASH_EASE }}
            >
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal">
                  This week&apos;s focus
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <p className="font-display text-xl font-bold tracking-tight text-ink sm:text-[1.35rem] sm:leading-snug">
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
                          "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold",
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
                  <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted">
                    {focus.support}
                  </p>
                ) : null}
              </div>

              <div className="mt-4 flex flex-1 flex-col justify-end border-t border-cyan/15 pt-3.5">
                <div className="mb-2.5 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-muted">
                      Week progress
                      {focus.skillKeys.length === 1
                        ? ` · ${SKILL_LABEL[focus.skillKeys[0]]}`
                        : focus.skillKeys.length > 1
                          ? " · focus skills"
                          : ""}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-light">
                      Tap a day for its report card
                    </p>
                  </div>
                  <p className="font-mono text-[12px] font-semibold tabular-nums text-ink">
                    {weekProgress.total > 0
                      ? `${weekProgress.done}/${weekProgress.total} · ${weekProgress.pct}%`
                      : "No tasks yet"}
                  </p>
                </div>

                <div
                  className="grid grid-cols-7 gap-1.5 sm:gap-2"
                  role="list"
                  aria-label={
                    weekProgress.total > 0
                      ? `This week ${weekProgress.pct}% complete. Tap a day to open its growth report.`
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
                            "flex h-9 w-full items-center justify-center rounded-full text-[12px] font-semibold transition-colors",
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
              </div>
            </motion.div>
          ) : (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-light">
                Your journey
              </p>
              <p className="mt-1.5 font-display text-xl font-bold tracking-tight text-ink">
                Stay consistent toward band {targetLabel}
              </p>
            </div>
          )}
        </div>

        <motion.div
          className="h-full min-w-0"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08, ease: DASH_EASE }}
        >
          {studyPlan && (studyPlan.weeks?.length ?? 0) > 0 ? (
            <Link
              href="/study-plan"
              className="flex h-full w-full cursor-pointer flex-col rounded-2xl border border-ink/8 bg-white/95 p-4 text-left shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow] duration-200 hover:border-cyan/35 hover:shadow-[0_12px_32px_rgba(15,23,42,0.07)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-light">
                    Plan day
                    <CalendarDays
                      className="size-3 text-teal"
                      aria-hidden
                    />
                  </p>
                  <p
                    ref={dayRef}
                    className="mt-1 font-display text-2xl font-bold tabular-nums text-ink"
                  >
                    {day}
                    {total > 0 ? (
                      <span className="text-base font-semibold text-muted">
                        {" "}
                        / {total}
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-cyan/20 bg-cyan-soft/70 px-2.5 py-0.5 text-[11px] font-semibold text-teal">
                    <Target className="size-3" aria-hidden />
                    {targetLabel}
                  </span>
                  <span className="font-mono text-[12px] font-semibold tabular-nums text-ink">
                    {planPct}%
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <DashProgressBar
                  value={planPct}
                  heightClassName="h-2"
                  label={`Plan progress ${planPct} percent`}
                />
              </div>

              <dl className="mt-3.5 grid grid-cols-3 gap-2 border-t border-ink/[0.05] pt-3">
                {(
                  [
                    ["To exam", countdownLabel],
                    ["Exam", examLabel ?? "—"],
                    [
                      "Studied",
                      studyDaysCompleted > 0 ? `${studyDaysCompleted}d` : "—",
                    ],
                  ] as const
                ).map(([label, value], i) => (
                  <motion.div
                    key={label}
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    whileInView={
                      reduceMotion ? undefined : { opacity: 1, y: 0 }
                    }
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.35,
                      delay: 0.18 + i * 0.05,
                      ease: DASH_EASE,
                    }}
                  >
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-light">
                      {label}
                    </dt>
                    <dd className="mt-0.5 text-[12.5px] font-semibold text-ink">
                      {value}
                    </dd>
                  </motion.div>
                ))}
              </dl>

              <p className="mt-3 text-[11.5px] font-semibold text-teal">
                Open full plan →
              </p>
            </Link>
          ) : (
            <div className="rounded-2xl border border-ink/8 bg-white/95 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-light">
                    Plan day
                  </p>
                  <p
                    ref={dayRef}
                    className="mt-1 font-display text-2xl font-bold tabular-nums text-ink"
                  >
                    {day}
                    {total > 0 ? (
                      <span className="text-base font-semibold text-muted">
                        {" "}
                        / {total}
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-cyan/20 bg-cyan-soft/70 px-2.5 py-0.5 text-[11px] font-semibold text-teal">
                    <Target className="size-3" aria-hidden />
                    {targetLabel}
                  </span>
                  <span className="font-mono text-[12px] font-semibold tabular-nums text-ink">
                    {planPct}%
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <DashProgressBar
                  value={planPct}
                  heightClassName="h-2"
                  label={`Plan progress ${planPct} percent`}
                />
              </div>

              <dl className="mt-3.5 grid grid-cols-3 gap-2 border-t border-ink/[0.05] pt-3">
                {(
                  [
                    ["To exam", countdownLabel],
                    ["Exam", examLabel ?? "—"],
                    [
                      "Studied",
                      studyDaysCompleted > 0 ? `${studyDaysCompleted}d` : "—",
                    ],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-light">
                      {label}
                    </dt>
                    <dd className="mt-0.5 text-[12.5px] font-semibold text-ink">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </motion.div>
      </div>

      <DailyGrowthReportModal
        open={reportDay != null}
        onClose={() => setReportDay(null)}
        studentName={studentName}
        reportDate={
          reportDay
            ? new Date(`${reportDay.date}T12:00:00`)
            : new Date()
        }
        tasks={reportDay?.tasks ?? []}
        hubProgress={hubProgress}
        currentBand={currentBand}
        targetBand={targetBand}
        overallPlanPct={overallPlanPct}
      />
    </section>
  );
}
