"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useReducedMotion } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { OPEN_DAILY_REPORT_EVENT } from "@/components/bandforge/dashboard/dashboard-top-header";
import { DailyGrowthReportModal } from "@/components/bandforge/plan/daily-growth-report-modal";
import type {
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
  bandGapCurrent: number | null;
  bandGapDelta: number;
  bandGapScoredCount: number;
  bandGapIsPartial: boolean;
  resolvedTargetBand: number;
  studentName?: string;
  hubProgress?: Record<string, SkillHubProgress>;
  currentBand?: number | null;
  overallPlanPct?: number;
  startNow?: DashboardStartNow | null;
  startNowCacheTasks?: LearningStudyTask[];
};

export function DashboardWelcomeSection({
  targetBand,
  bandGapCurrent,
  bandGapDelta,
  bandGapScoredCount,
  bandGapIsPartial,
  resolvedTargetBand,
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
  const bandFillRef = useRef<HTMLDivElement>(null);
  const [reportDay, setReportDay] = useState<{
    date: string;
    tasks: LearningStudyTask[];
  } | null>(null);

  useEffect(() => {
    const onOpenTodayReport = () => {
      setReportDay({
        date: localPlanDateKey(),
        tasks: startNowCacheTasks,
      });
    };
    window.addEventListener(OPEN_DAILY_REPORT_EVENT, onOpenTodayReport);
    return () => {
      window.removeEventListener(OPEN_DAILY_REPORT_EVENT, onOpenTodayReport);
    };
  }, [startNowCacheTasks]);

  const bandPct =
    bandGapCurrent != null && resolvedTargetBand > 0
      ? Math.min(
          100,
          Math.round((bandGapCurrent / resolvedTargetBand) * 100),
        )
      : 0;

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

      if (reduceMotion) {
        setNow(
          bandGapCurrent != null ? bandGapCurrent.toFixed(1) : "—",
        );
        setTarget(resolvedTargetBand.toFixed(1));
        setPct(bandGapCurrent != null ? `${bandPct}%` : "—");
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
      if (fill) gsap.set(fill, { width: "0%" });

      const nowObj = { v: 0 };
      const targetObj = { v: 0 };
      const pctObj = { v: 0 };

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
      <div className="relative px-4 py-4 sm:px-6 sm:py-5">
        <div
          className={cn(
            "grid gap-5",
            startNow
              ? "md:grid-cols-2 md:items-stretch md:gap-5 lg:gap-6"
              : "lg:grid-cols-[minmax(0,1fr)_minmax(200px,18rem)] lg:items-end lg:gap-10",
          )}
        >
          {startNow ? (
            <div className="relative flex h-full min-w-0 flex-col justify-between gap-4 overflow-hidden rounded-2xl bg-navy p-4 text-white sm:p-5">
              <div
                className="pointer-events-none absolute -top-10 -right-10 size-36 rounded-full bg-cyan/20 blur-3xl"
                aria-hidden
              />
              <div className="relative min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan">
                  Start now · practice first
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
        </div>
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
