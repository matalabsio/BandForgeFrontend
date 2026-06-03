"use client";

import Link from "next/link";
import {
  TEST1_LISTENING_MINUTES,
  TEST1_LISTENING_PART_COUNT,
  TEST1_READING_MINUTES,
  TEST1_READING_PASSAGE_COUNT,
  TEST1_WRITING_MINUTES,
  TEST1_WRITING_TASK_COUNT,
  mockModulePath,
  mockResultsPath,
} from "@/lib/mock-catalog";
import type { ModuleProgress } from "@/modules/mock/services/mock-api";
import { computeMockProgressPercent } from "@/modules/mock/lib/mock-progress";
import { cn } from "@/lib/utils";

type ModuleKey = "listening" | "reading" | "writing";

const MODULE_CARDS: {
  key: ModuleKey;
  order: number;
  label: string;
  detail: (mod: ModuleProgress | undefined) => string;
}[] = [
  {
    key: "listening",
    order: 1,
    label: "Listening",
    detail: (mod) => {
      const part = mod?.part ?? 1;
      if (mod?.status === "in_progress") {
        return `${TEST1_LISTENING_MINUTES} min · Part ${part} of ${TEST1_LISTENING_PART_COUNT}`;
      }
      return `${TEST1_LISTENING_MINUTES} min · Parts 1-${TEST1_LISTENING_PART_COUNT}`;
    },
  },
  {
    key: "reading",
    order: 2,
    label: "Reading",
    detail: (mod) => {
      const part = mod?.part ?? 1;
      if (mod?.status === "in_progress") {
        return `${TEST1_READING_MINUTES} min · Passage ${part} of ${TEST1_READING_PASSAGE_COUNT}`;
      }
      return `${TEST1_READING_MINUTES} min · Passages 1-${TEST1_READING_PASSAGE_COUNT}`;
    },
  },
  {
    key: "writing",
    order: 3,
    label: "Writing",
    detail: (mod) => {
      const part = mod?.part ?? 1;
      if (mod?.status === "in_progress" && part === 2) {
        return `${TEST1_WRITING_MINUTES} min · Task 2 of ${TEST1_WRITING_TASK_COUNT}`;
      }
      return `${TEST1_WRITING_MINUTES} min · Tasks 1–${TEST1_WRITING_TASK_COUNT}`;
    },
  },
];

function moduleHref(
  mockSlug: string,
  mockAttemptId: string,
  key: ModuleKey,
  mod: ModuleProgress,
): string | null {
  if (!mod.is_enabled || mod.status === "locked") return null;

  const part = mod.part ?? 1;
  const auto = mod.status === "in_progress" || mod.status === "available";

  let path: string;
  if (key === "listening") {
    path = mockModulePath(mockSlug, "listening", {
      part,
      mockAttemptId,
      auto,
    });
  } else if (key === "reading") {
    path = mockModulePath(mockSlug, "reading", {
      passage: part,
      mockAttemptId,
      auto,
    });
  } else {
    path = mockModulePath(mockSlug, "writing", {
      part,
      mockAttemptId,
      auto,
    });
  }

  if (mod.status === "available") {
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}section_start=1`;
  }
  return path;
}

function statusLabel(status: ModuleProgress["status"]): string {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In progress";
  if (status === "available") return "Start";
  return "Locked";
}

type Props = {
  mockSlug: string;
  modules: ModuleProgress[];
  mockAttemptId: string | null;
  mockStatus?: string;
};

export function Test1ModuleCards({
  mockSlug,
  modules,
  mockAttemptId,
  mockStatus,
}: Props) {
  const percent = computeMockProgressPercent(modules);
  const mockComplete = mockStatus === "completed";
  const writingDone =
    modules.find((m) => m.module === "writing")?.status === "completed";

  if (!mockAttemptId) {
    return (
      <p className="rounded-xl border border-dashed border-[var(--exam-border)] bg-[var(--exam-surface)] px-4 py-8 text-center text-[13px] text-[var(--exam-ink-muted)]">
        Start or resume Test 1 above to open Listening, Reading, and Writing.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-bold text-[var(--exam-ink)]">Test sections</p>
        <span className="text-[12px] font-semibold tabular-nums text-[var(--exam-accent)]">
          {percent}% complete
        </span>
      </div>

      <ul className="grid gap-4 sm:grid-cols-3">
        {MODULE_CARDS.map((card) => {
          const mod = modules.find((m) => m.module === card.key);
          const status = mod?.status ?? "locked";
          const href =
            mod && mockAttemptId
              ? moduleHref(mockSlug, mockAttemptId, card.key, mod)
              : null;
          const isCurrent = status === "in_progress";
          const isDone = status === "completed";

          const inner = (
            <article
              className={cn(
                "flex h-full min-h-[140px] flex-col rounded-xl border p-4 transition-colors",
                isCurrent &&
                  "border-[var(--exam-accent)] bg-[var(--exam-accent-soft)]/50 shadow-sm",
                isDone && "border-emerald-200 bg-emerald-50/80",
                status === "available" &&
                  "border-[var(--exam-border)] bg-white hover:border-[var(--exam-accent)]/50 hover:shadow-sm",
                status === "locked" &&
                  "cursor-not-allowed border-dashed border-[var(--exam-border)] bg-[var(--exam-surface)] opacity-65",
                href && "cursor-pointer",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                    isDone && "bg-emerald-600 text-white",
                    isCurrent && "bg-[var(--exam-accent)] text-white",
                    status === "available" && "bg-[var(--exam-bar)] text-white",
                    status === "locked" &&
                      "bg-[var(--exam-border)] text-[var(--exam-ink-muted)]",
                  )}
                >
                  {isDone ? "✓" : card.order}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                    isDone && "bg-emerald-100 text-emerald-800",
                    isCurrent && "bg-amber-100 text-amber-900",
                    status === "available" && "bg-[var(--exam-accent)]/15 text-[var(--exam-accent)]",
                    status === "locked" && "bg-white text-[var(--exam-ink-muted)]",
                  )}
                >
                  {statusLabel(status)}
                </span>
              </div>
              <h3 className="mt-3 font-display text-[16px] font-bold text-[var(--exam-ink)]">
                {card.label}
              </h3>
              <p className="mt-1 flex-1 text-[12px] leading-snug text-[var(--exam-ink-muted)]">
                {card.detail(mod)}
              </p>
              {mod?.band != null && mod.band > 0 ? (
                <p className="mt-2 text-[11px] font-semibold text-emerald-700">
                  Band {mod.band.toFixed(1)}
                </p>
              ) : null}
              {href ? (
                <p className="mt-3 text-[12px] font-bold text-[var(--exam-accent)]">
                  {isDone ? "Open section →" : isCurrent ? "Resume →" : "Start section →"}
                </p>
              ) : (
                <p className="mt-3 text-[11px] text-[var(--exam-ink-muted)]">
                  {card.key === "reading" && status === "locked"
                    ? "Complete Listening first"
                    : card.key === "writing" && status === "locked"
                      ? "Complete Reading first"
                      : "Not available yet"}
                </p>
              )}
            </article>
          );

          return (
            <li key={card.key}>
              {href ? (
                <Link href={href} className="block h-full">
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ul>

      {(mockComplete || writingDone) && mockAttemptId ? (
        <Link
          href={mockResultsPath(mockSlug, mockAttemptId)}
          className="flex items-center justify-center gap-2 rounded-xl border border-[var(--exam-border)] bg-white px-4 py-3 text-[13px] font-bold text-[var(--exam-ink)] transition-colors hover:border-[var(--exam-accent)] hover:text-[var(--exam-accent)]"
        >
          View band report →
        </Link>
      ) : null}
    </div>
  );
}
