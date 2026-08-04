"use client";

import { useMemo, useRef } from "react";
import {
  ArrowUpRight,
  Focus,
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
};

const SKILL_ORDER = ["listening", "reading", "writing", "speaking"] as const;

const SKILL_LABEL: Record<string, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

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

/** Prefer focus-named skills; if all Hard, suppress chip spam. Cap at 2. */
function selectDifficultyChips(
  skillDifficulty: Record<string, string> | null | undefined,
  weeklyFocus: string | null,
): (typeof SKILL_ORDER)[number][] {
  const tagged = SKILL_ORDER.filter((key) => {
    const tag = skillDifficulty?.[key];
    return tag === "hard" || tag === "easy";
  });
  if (tagged.length === 0) return [];

  const allHard =
    tagged.length === 4 &&
    tagged.every((k) => skillDifficulty?.[k] === "hard");

  const focusLower = (weeklyFocus ?? "").toLowerCase();
  const focusNamed = tagged.filter((k) => focusLower.includes(k));

  if (allHard) {
    return focusNamed.slice(0, 2);
  }

  const hard = tagged.filter((k) => skillDifficulty?.[k] === "hard");
  const easy = tagged.filter((k) => skillDifficulty?.[k] === "easy");
  const picked = [
    ...focusNamed,
    ...hard.filter((k) => !focusNamed.includes(k)),
    ...easy.filter((k) => !focusNamed.includes(k)),
  ];
  return Array.from(new Set(picked)).slice(0, 2);
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
}: Props) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const nowRef = useRef<HTMLParagraphElement>(null);
  const targetRef = useRef<HTMLParagraphElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const dayRef = useRef<HTMLParagraphElement>(null);
  const bandFillRef = useRef<HTMLDivElement>(null);

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

  const focusLine =
    weeklyFocus && weeklyFocus.trim()
      ? weeklyFocus.trim().replace(/^Focus:\s*/i, "")
      : null;

  const chips = useMemo(
    () => selectDifficultyChips(skillDifficulty, focusLine),
    [skillDifficulty, focusLine],
  );

  const examLabel = formatExamDate(examDate);
  const todayIso = new Date().toISOString().slice(0, 10);

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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="min-w-0">
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

          <div className="w-full min-w-0 lg:max-w-xs">
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

      <div className="relative grid gap-5 p-4 sm:gap-6 sm:p-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(250px,0.95fr)] lg:p-6">
        <div className="min-w-0">
          {focusLine ? (
            <motion.div
              className="flex items-start gap-3"
              initial={reduceMotion ? false : { opacity: 0, x: -8 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: DASH_EASE }}
            >
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-soft text-teal shadow-[0_0_0_1px_rgba(0,188,212,0.12)]">
                <Focus className="size-4" strokeWidth={2.25} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal/80">
                  This week&apos;s focus
                </p>
                <p className="mt-1.5 font-display text-xl font-bold tracking-tight text-ink sm:text-[1.35rem] sm:leading-snug">
                  {focusLine}
                </p>
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

          {chips.length > 0 ? (
            <motion.div
              className="mt-4 flex flex-wrap gap-1.5"
              aria-label="Skill difficulty"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.05, delayChildren: 0.12 },
                },
              }}
            >
              {chips.map((key) => {
                const hard = skillDifficulty?.[key] === "hard";
                return (
                  <motion.span
                    key={key}
                    variants={{
                      hidden: { opacity: 0, y: 6 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.35, ease: DASH_EASE },
                      },
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11.5px] font-semibold",
                      hard
                        ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200/70"
                        : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/70",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        hard ? "bg-amber-500" : "bg-emerald-500",
                      )}
                      aria-hidden
                    />
                    {SKILL_LABEL[key]}
                    <span className="font-medium opacity-65">
                      {hard ? "Hard" : "Easy"}
                    </span>
                  </motion.span>
                );
              })}
            </motion.div>
          ) : null}
        </div>

        <motion.div
          className="rounded-2xl border border-ink/8 bg-white/95 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08, ease: DASH_EASE }}
        >
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
            ).map(([label, value], i) => (
              <motion.div
                key={label}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
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
        </motion.div>
      </div>
    </section>
  );
}
