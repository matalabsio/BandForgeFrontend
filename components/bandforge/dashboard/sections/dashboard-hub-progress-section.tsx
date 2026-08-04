"use client";

import Link from "next/link";
import { Lock, Unlock } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  DASH_EASE,
  DashProgressBar,
  DashReveal,
} from "@/components/bandforge/dashboard/motion";
import { LazyMount } from "@/components/bandforge/dashboard/lazy-mount";
import { overallPlanPercent } from "@/lib/dashboard-plan-math";
import type { LearningProfile } from "@/lib/learning-types";
import { cn } from "@/lib/utils";

const SKILL_ORDER = [
  { key: "listening", label: "Listening" },
  { key: "reading", label: "Reading" },
  { key: "writing", label: "Writing" },
  { key: "speaking", label: "Speaking" },
] as const;

type Props = {
  learning: LearningProfile;
  overallPlanPct?: number;
};

export function DashboardHubProgressSection({
  learning,
  overallPlanPct,
}: Props) {
  const reduce = useReducedMotion();
  const hubProgress = learning.hub_progress ?? {};
  const overallPct =
    overallPlanPct ?? overallPlanPercent(learning.study_plan);

  return (
    <DashReveal as="section" aria-labelledby="hub-progress-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2
            id="hub-progress-heading"
            className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl"
          >
            Practice hubs
          </h2>
          <p className="mt-0.5 text-[13px] text-muted">
            Unlock mocks by completing skill hubs
          </p>
        </div>
        <span className="rounded-full bg-cyan-soft px-2.5 py-1 font-mono text-[12px] font-semibold tabular-nums text-teal ring-1 ring-cyan/20">
          Plan {overallPct}%
        </span>
      </div>

      <LazyMount className="min-h-[160px]">
        <motion.div
          className="grid gap-3 sm:grid-cols-2"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.12 }}
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.07, delayChildren: 0.04 },
            },
          }}
        >
          {SKILL_ORDER.map(({ key, label }) => {
            const row = hubProgress[key];
            const completed = row?.completed_count ?? 0;
            const total = row?.total_count ?? 12;
            const pct =
              total > 0
                ? Math.min(100, Math.round((completed / total) * 100))
                : 0;
            const mockUnlocked = row?.mock_unlocked ?? false;

            return (
              <motion.div
                key={key}
                variants={{
                  hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 14 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.45, ease: DASH_EASE },
                  },
                }}
              >
                <Link
                  href={`/practice/${key}`}
                  className="group block cursor-pointer rounded-2xl border border-ink/8 bg-white px-4 py-4 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-cyan/35 hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)] sm:px-5"
                >
                  <div className="mb-2.5 flex items-center justify-between gap-2">
                    <p className="font-display text-sm font-bold text-ink">
                      {label}
                    </p>
                    <span className="font-mono text-xs font-semibold tabular-nums text-teal">
                      {completed}/{total}
                    </span>
                  </div>
                  <DashProgressBar
                    value={pct}
                    heightClassName="h-2"
                    label={`${label} hub progress`}
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold",
                        mockUnlocked
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-ink/5 text-ink/55",
                      )}
                    >
                      {mockUnlocked ? (
                        <Unlock className="size-3" strokeWidth={2.5} />
                      ) : (
                        <Lock className="size-3" strokeWidth={2.5} />
                      )}
                      Mock {mockUnlocked ? "unlocked" : "locked"}
                    </span>
                    <span className="text-[11px] font-semibold text-teal transition-transform duration-200 group-hover:translate-x-0.5">
                      Open →
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </LazyMount>
    </DashReveal>
  );
}
