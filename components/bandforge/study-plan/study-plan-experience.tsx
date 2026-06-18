"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import {
  BRAND_STUDY_PLAN_DAYS,
  BRAND_STUDY_PLAN_META,
  BRAND_STUDY_PLAN_WEEKS,
} from "@/lib/brand-mock-data";
import { cn } from "@/lib/utils";

const MODULE_COLORS: Record<string, string> = {
  Reading: "border-l-cyan",
  Listening: "border-l-cyan",
  Writing: "border-l-[#b7791f]",
  Speaking: "border-l-[#3b6fb0]",
  Vocabulary: "border-l-[#7c5cbf]",
};

export function StudyPlanExperience() {
  const [week, setWeek] = useState("w1");

  return (
    <div className="space-y-8">
      <header>
        <BfSectionEyebrow>Your schedule</BfSectionEyebrow>
        <BfSectionHeading className="mt-2">Study plan</BfSectionHeading>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          <Calendar className="size-4 text-cyan" />
          {BRAND_STUDY_PLAN_META.daysToTest} days to test
        </p>
      </header>

      <article className="rounded-2xl border border-cyan/25 bg-cyan-soft/60 p-5">
        <p className="font-mono text-[0.6875rem] tracking-[0.1em] text-cyan uppercase">
          This week&apos;s focus
        </p>
        <p className="font-display mt-2 text-base font-bold text-navy">
          {BRAND_STUDY_PLAN_META.weeklyFocus}
        </p>
      </article>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-navy">{BRAND_STUDY_PLAN_META.weekLabel}</span>
          <span className="font-mono text-cyan">{BRAND_STUDY_PLAN_META.todayProgress}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-border-soft">
          <div className="h-full w-3/5 rounded-full bg-cyan" />
        </div>
      </div>

      <nav className="flex gap-6 border-b border-border-soft">
        {BRAND_STUDY_PLAN_WEEKS.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => setWeek(w.id)}
            className={cn(
              "pb-3 text-sm font-semibold transition-colors",
              week === w.id
                ? "border-b-2 border-cyan text-cyan"
                : "text-muted hover:text-navy",
            )}
          >
            {w.label}
          </button>
        ))}
      </nav>

      <ul className="space-y-6">
        {BRAND_STUDY_PLAN_DAYS.map((day) => (
          <li key={day.day}>
            <div className="mb-3 flex items-center gap-3">
              <p className="font-display font-bold text-navy">{day.day}</p>
              {day.status === "today" ? (
                <span className="rounded-full bg-cyan px-2.5 py-0.5 text-[0.6875rem] font-semibold text-white">
                  Today
                </span>
              ) : null}
              {day.status === "today" ? (
                <span className="rounded-full bg-[#e5eef9] px-2.5 py-0.5 text-[0.6875rem] font-semibold text-[#3b6fb0]">
                  In progress
                </span>
              ) : null}
            </div>
            <ul className="space-y-2">
              {day.tasks.map((task) => (
                <li
                  key={task.title}
                  className={cn(
                    "rounded-xl border border-border-soft border-l-[3px] bg-white px-4 py-3",
                    MODULE_COLORS[task.module] ?? "border-l-cyan",
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="font-mono text-[0.625rem] tracking-wide text-cyan uppercase">
                        {task.module}
                      </span>
                      <p
                        className={cn(
                          "font-medium text-navy",
                          task.done && "text-muted-light line-through",
                        )}
                      >
                        {task.title}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-muted-light">
                      {task.duration}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
