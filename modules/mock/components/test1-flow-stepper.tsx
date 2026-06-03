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
import { cn } from "@/lib/utils";

type StepKey = "listening" | "reading" | "writing" | "results";

type StepDef = {
  key: StepKey;
  order: number;
  label: string;
  detail: string;
};

const STEPS: StepDef[] = [
  {
    key: "listening",
    order: 1,
    label: "Listening",
    detail: `${TEST1_LISTENING_MINUTES} min · Part 1`,
  },
  {
    key: "reading",
    order: 2,
    label: "Reading",
    detail: `${TEST1_READING_MINUTES} min · Passage 1`,
  },
  {
    key: "writing",
    order: 3,
    label: "Writing",
    detail: `${TEST1_WRITING_MINUTES} min · Tasks 1–${TEST1_WRITING_TASK_COUNT} · word-count band`,
  },
  {
    key: "results",
    order: 4,
    label: "Results",
    detail: "Band report",
  },
];

function stepStatus(
  key: StepKey,
  modules: ModuleProgress[],
  mockComplete: boolean,
): "locked" | "available" | "in_progress" | "completed" {
  if (key === "results") {
    if (mockComplete) return "completed";
    const writing = modules.find((m) => m.module === "writing");
    if (writing?.status === "completed") return "available";
    return "locked";
  }
  const mod = modules.find((m) => m.module === key);
  if (!mod || !mod.is_enabled) return "locked";
  return mod.status;
}

type Props = {
  mockSlug: string;
  modules: ModuleProgress[];
  mockAttemptId?: string | null;
  mockStatus?: string;
  onStepClick?: (key: StepKey) => void;
};

export function Test1FlowStepper({
  mockSlug,
  modules,
  mockAttemptId,
  mockStatus,
  onStepClick,
}: Props) {
  const mockComplete = mockStatus === "completed";

  return (
    <ol className="space-y-0">
      {STEPS.map((step, index) => {
        const status = stepStatus(step.key, modules, mockComplete);
        const mod = modules.find((m) => m.module === step.key);
        const part = mod?.part ?? 1;
        const canNavigate =
          mockAttemptId &&
          (status === "available" ||
            status === "in_progress" ||
            status === "completed") &&
          step.key !== "results";

        let href: string | null = null;
        if (step.key === "results" && mockAttemptId && mockComplete) {
          href = mockResultsPath(mockSlug, mockAttemptId);
        } else if (
          status === "completed" &&
          mockAttemptId &&
          step.key !== "results"
        ) {
          href = mockResultsPath(mockSlug, mockAttemptId);
        } else if (
          canNavigate &&
          (step.key === "reading" ||
            step.key === "listening" ||
            step.key === "writing")
        ) {
          href = mockModulePath(mockSlug, step.key, {
            part:
              step.key === "listening" || step.key === "writing" ? part : undefined,
            passage: step.key === "reading" ? part : undefined,
            mockAttemptId,
            auto: status === "in_progress",
          });
        }

        const inner = (
          <div
            className={cn(
              "flex gap-3 rounded-xl border px-4 py-3 transition-colors",
              status === "in_progress" &&
                "border-[var(--exam-accent)] bg-[var(--exam-accent-soft)]/40",
              status === "completed" &&
                "border-emerald-200/90 bg-emerald-50/60",
              status === "available" &&
                "border-[var(--exam-border)] bg-white hover:border-[var(--exam-accent)]/40",
              status === "locked" &&
                "border-dashed border-[var(--exam-border)] bg-[var(--exam-surface)] opacity-70",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                status === "completed" && "bg-emerald-600 text-white",
                status === "in_progress" && "bg-[var(--exam-accent)] text-white",
                status === "available" && "bg-[var(--exam-bar)] text-white",
                status === "locked" && "bg-[var(--exam-border)] text-[var(--exam-ink-muted)]",
              )}
              aria-hidden
            >
              {status === "completed" ? "✓" : step.order}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-[var(--exam-ink)]">{step.label}</p>
              <p className="text-[12px] text-[var(--exam-ink-muted)]">{step.detail}</p>
              {status === "locked" && step.key === "reading" ? (
                <p className="mt-1 text-[11px] text-[var(--exam-muted)]">
                  Complete Listening first
                </p>
              ) : null}
              {status === "locked" && step.key === "writing" ? (
                <p className="mt-1 text-[11px] text-[var(--exam-muted)]">
                  Complete Reading first
                </p>
              ) : null}
              {status === "in_progress" ? (
                <p className="mt-1 text-[11px] font-semibold text-[var(--exam-accent)]">
                  In progress: resume →
                </p>
              ) : null}
              {status === "available" && step.key !== "results" ? (
                <p className="mt-1 text-[11px] font-semibold text-[var(--exam-accent)]">
                  Ready to start →
                </p>
              ) : null}
            </div>
          </div>
        );

        const showConnector = index < STEPS.length - 1;

        return (
          <li key={step.key} className="relative">
            {href ? (
              <Link
                href={href}
                className="block cursor-pointer"
                onClick={() => onStepClick?.(step.key)}
              >
                {inner}
              </Link>
            ) : (
              <div>{inner}</div>
            )}
            {showConnector ? (
              <div
                className="ml-4 h-3 w-px bg-[var(--exam-border)]"
                aria-hidden
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
