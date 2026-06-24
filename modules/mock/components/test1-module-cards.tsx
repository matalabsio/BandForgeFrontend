"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import {
  getMockMeta,
  mockApiId,
  mockModulePath,
  mockResultsPath,
  shortModuleSpeakingPendingPath,
  testNumberForMockId,
  type MockSlug,
} from "@/lib/mock-catalog";
import { prepareExamModuleNavigation } from "@/lib/mock-exam-nav";
import {
  resolveEnabledModuleKeys,
  type MockModuleKey,
} from "@/modules/mock/lib/mock-progress";
import type { ModuleProgress } from "@/modules/mock/services/mock-api";
import { cn } from "@/lib/utils";

type ModuleKey = MockModuleKey;

type ModuleMeta = Pick<
  ReturnType<typeof getMockMeta>,
  | "displayLabel"
  | "listeningPartCount"
  | "readingPassageCount"
  | "writingTaskCount"
  | "listeningMinutes"
  | "readingMinutes"
  | "writingMinutes"
>;

const MODULE_ICONS = {
  listening: HeadphonesIcon,
  reading: BookIcon,
  writing: PencilIcon,
  speaking: MicIcon,
} as const;

function moduleProgress(status: ModuleProgress["status"]): number {
  if (status === "completed") return 100;
  if (status === "in_progress") return 55;
  if (status === "available") return 12;
  return 0;
}

const MODULE_CARDS: {
  key: ModuleKey;
  order: number;
  label: string;
  detail: (mod: ModuleProgress | undefined, meta: ModuleMeta) => string;
}[] = [
  {
    key: "listening",
    order: 1,
    label: "Listening",
    detail: (mod, meta) => {
      const part = mod?.part ?? 1;
      if (mod?.status === "in_progress") {
        return `${meta.listeningMinutes} min · Part ${part} of ${meta.listeningPartCount}`;
      }
      return `${meta.listeningMinutes} min · Parts 1-${meta.listeningPartCount}`;
    },
  },
  {
    key: "reading",
    order: 2,
    label: "Reading",
    detail: (mod, meta) => {
      const part = mod?.part ?? 1;
      if (mod?.status === "in_progress") {
        return `${meta.readingMinutes} min · Passage ${part} of ${meta.readingPassageCount}`;
      }
      return `${meta.readingMinutes} min · Passages 1-${meta.readingPassageCount}`;
    },
  },
  {
    key: "writing",
    order: 3,
    label: "Writing",
    detail: (mod, meta) => {
      const part = mod?.part ?? 1;
      if (mod?.status === "in_progress" && part === 2) {
        return `${meta.writingMinutes} min · Task 2 of ${meta.writingTaskCount}`;
      }
      return `${meta.writingMinutes} min · Tasks 1–${meta.writingTaskCount}`;
    },
  },
  {
    key: "speaking",
    order: 4,
    label: "Speaking",
    detail: (mod) => {
      const mins = mod?.duration_minutes ?? 14;
      if (mod?.status === "completed" && mod.band == null) {
        return `${mins} min · Part 1 · score within 24h`;
      }
      if (mod?.status === "in_progress") {
        return `${mins} min · Part 1 · record your answer`;
      }
      return `${mins} min · Part 1 · human-reviewed`;
    },
  },
];

function moduleHref(
  mockSlug: string,
  mockAttemptId: string,
  key: ModuleKey,
  mod: ModuleProgress,
): { href: string; nav: { auto?: boolean; sectionStart?: boolean } } | null {
  if (!mod.is_enabled || mod.status === "locked") return null;

  const part = mod.part ?? 1;
  const auto = mod.status === "in_progress" || mod.status === "available";
  const sectionStart = mod.status === "available";

  let path: string;
  if (key === "listening") {
    path = mockModulePath(mockSlug, "listening", { part });
  } else if (key === "reading") {
    path = mockModulePath(mockSlug, "reading", { passage: part });
  } else if (key === "writing") {
    path = mockModulePath(mockSlug, "writing", { part });
  } else {
    if (mod.status === "completed" && mod.test_attempt_id) {
      const testNumber = testNumberForMockId(mockApiId(mockSlug));
      path = shortModuleSpeakingPendingPath(testNumber, mod.test_attempt_id);
    } else {
      path = mockModulePath(mockSlug, "speaking");
    }
  }

  return {
    href: path,
    nav: { auto: auto || undefined, sectionStart: sectionStart || undefined },
  };
}

function statusLabel(status: ModuleProgress["status"]): string {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In progress";
  if (status === "available") return "Start";
  return "Locked";
}

type SectionFilter = "all" | ModuleKey;

function sectionFiltersForModules(
  modules: ModuleProgress[],
  catalogModulesEnabled?: readonly string[],
): {
  id: SectionFilter;
  label: string;
}[] {
  const enabledKeys = resolveEnabledModuleKeys(modules, catalogModulesEnabled);
  const enabled = MODULE_CARDS.filter((card) => enabledKeys.includes(card.key));
  return [
    { id: "all", label: "All" },
    ...enabled.map((card) => ({ id: card.key, label: card.label })),
  ];
}

type Props = {
  mockSlug: MockSlug | string;
  moduleMeta?: ModuleMeta;
  modules: ModuleProgress[];
  mockAttemptId: string | null;
  mockStatus?: string;
  showSectionFilters?: boolean;
  previewWhenLocked?: boolean;
  catalogModulesEnabled?: readonly string[];
};

export function Test1ModuleCards({
  mockSlug,
  moduleMeta,
  modules,
  mockAttemptId,
  mockStatus,
  showSectionFilters = false,
  previewWhenLocked = false,
  catalogModulesEnabled,
}: Props) {
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("all");
  const meta = moduleMeta ?? getMockMeta(mockSlug as MockSlug);
  const displayLabel = meta.displayLabel;
  const mockComplete = mockStatus === "completed";

  const enabledModuleKeys = useMemo(
    () => resolveEnabledModuleKeys(modules, catalogModulesEnabled),
    [modules, catalogModulesEnabled],
  );

  const enabledCards = useMemo(
    () => MODULE_CARDS.filter((card) => enabledModuleKeys.includes(card.key)),
    [enabledModuleKeys],
  );

  const sectionFilters = useMemo(
    () => sectionFiltersForModules(modules, catalogModulesEnabled),
    [modules, catalogModulesEnabled],
  );

  const visibleCards = useMemo(() => {
    if (sectionFilter === "all") return enabledCards;
    return enabledCards.filter((c) => c.key === sectionFilter);
  }, [enabledCards, sectionFilter]);

  if (!mockAttemptId && !previewWhenLocked) {
    return (
      <p className="rounded-xl border border-dashed border-[var(--exam-border)] bg-[var(--exam-surface)] px-4 py-8 text-center text-[13px] text-[var(--exam-ink-muted)]">
        Start or resume {displayLabel} above to open enabled sections.
      </p>
    );
  }

  return (
    <section className="space-y-4" aria-labelledby="mock-sections-heading">
      {showSectionFilters ? (
        <>
          <h3 id="mock-sections-heading" className="sr-only">
            Sections
          </h3>
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <div className="flex min-w-min gap-2" role="tablist" aria-label="Filter sections">
            {sectionFilters.map((chip) => {
              const active = sectionFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSectionFilter(chip.id)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "bg-[var(--exam-accent)] text-white"
                      : "border border-[var(--exam-border)] bg-white text-[var(--exam-ink)]",
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
          </div>
        </>
      ) : (
        <h3
          id="mock-sections-heading"
          className="text-base font-bold text-[var(--exam-ink)] sm:text-[13px]"
        >
          Sections
        </h3>
      )}

      <ul
        className={cn(
          "grid gap-3",
          visibleCards.length >= 4
            ? "grid-cols-2 sm:grid-cols-4"
            : "grid-cols-2 sm:grid-cols-3",
        )}
      >
        {visibleCards.map((card) => {
          const mod = modules.find((m) => m.module === card.key);
          const status = mod?.status ?? "locked";
          const link =
            mod && mockAttemptId
              ? moduleHref(mockSlug, mockAttemptId, card.key, mod)
              : null;
          const href = link?.href ?? null;
          const isCurrent = status === "in_progress";
          const isDone = status === "completed";

          const Icon = MODULE_ICONS[card.key];
          const progress = moduleProgress(status);

          const inner = (
            <article
              className={cn(
                "flex h-full min-h-[168px] flex-col rounded-2xl border border-[var(--exam-accent)]/30 border-t-[3px] border-t-[var(--exam-accent)] bg-white p-3.5 shadow-sm transition-shadow sm:p-4",
                status === "locked" && "cursor-not-allowed opacity-65",
                href && "hover:shadow-md",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex size-9 items-center justify-center rounded-full bg-[var(--exam-accent-soft)] text-[var(--exam-accent)]">
                  <Icon className="size-4" aria-hidden />
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase",
                    isDone && "bg-emerald-100 text-emerald-800",
                    isCurrent && "bg-amber-100 text-amber-900",
                    status === "available" && "bg-[var(--exam-accent)]/15 text-[var(--exam-accent)]",
                    status === "locked" && "bg-[var(--exam-surface)] text-[var(--exam-ink-muted)]",
                  )}
                >
                  {statusLabel(status)}
                </span>
              </div>
              <h3 className="mt-3 text-[13px] font-bold leading-snug text-[var(--exam-ink)] sm:text-sm">
                {card.label}
              </h3>
              <p className="mt-1 flex-1 text-[11px] leading-snug text-[var(--exam-ink-muted)] sm:text-xs">
                {card.detail(mod, meta)}
              </p>
              {mod?.band != null && mod.band > 0 ? (
                <p className="mt-1 text-[10px] font-semibold text-emerald-700">
                  Band {mod.band.toFixed(1)}
                </p>
              ) : mod?.status === "completed" && card.key === "speaking" ? (
                <p className="mt-1 text-[10px] font-semibold text-amber-700">
                  Score coming soon · 24h review
                </p>
              ) : null}
              <div
                className="mt-2.5 h-1 overflow-hidden rounded-full bg-[var(--exam-border)]"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-[var(--exam-accent)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {href ? (
                <p className="mt-2 text-[11px] font-bold text-[var(--exam-accent)]">
                  {isDone ? "Open →" : isCurrent ? "Resume →" : "Start →"}
                </p>
              ) : (
                <p className="mt-2 text-[10px] text-[var(--exam-ink-muted)]">
                  {card.key === "reading" && status === "locked"
                    ? "Complete Listening first"
                    : card.key === "writing" && status === "locked"
                      ? "Complete Reading first"
                      : card.key === "speaking" && status === "locked"
                        ? enabledModuleKeys.includes("writing")
                          ? "Complete Writing first"
                          : "Complete Reading first"
                        : "Locked"}
                </p>
              )}
            </article>
          );

          return (
            <li key={card.key}>
              {href ? (
                <Link
                  href={href}
                  className="block h-full"
                  onClick={() => {
                    if (!link || !mockAttemptId) return;
                    prepareExamModuleNavigation(mockSlug, card.key, {
                      mockAttemptId,
                      auto: link.nav.auto,
                      sectionStart: link.nav.sectionStart,
                    });
                  }}
                >
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ul>

      {mockComplete && mockAttemptId ? (
        <Link
          href={mockResultsPath(mockSlug, mockAttemptId)}
          className="flex items-center justify-center gap-2 rounded-xl border border-[var(--exam-border)] bg-white px-4 py-3 text-[13px] font-bold text-[var(--exam-ink)] transition-colors hover:border-[var(--exam-accent)] hover:text-[var(--exam-accent)]"
        >
          View band report →
        </Link>
      ) : null}
    </section>
  );
}
