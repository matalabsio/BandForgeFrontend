"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  Lock,
  Unlock,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { PencilIcon } from "@/components/bandforge/dashboard/icons";
import { DASH_EASE } from "@/components/bandforge/dashboard/motion";
import { PrefetchHrefs } from "@/components/bandforge/prefetch-hrefs";
import { examPathForMockStart } from "@/lib/mock-catalog";
import type { MockUnlock, PracticeHub } from "@/lib/practice-types";
import { cn } from "@/lib/utils";
import {
  findCurrentWritingHub,
  isWritingHubAccessible,
  resolveWritingMockUiState,
  resolveWritingTrackFromUnlock,
  writingCourseProgress,
  writingHubCtaLabel,
  writingHubDisplayTitle,
  writingHubTaskLabel,
  writingHubUiState,
  writingMockLockedCopy,
  writingMockUnavailableCopy,
  writingMockUsedCopy,
  writingMocksRemaining,
  writingTrackLabel,
} from "@/lib/writing-skill-course";
import { mockApi } from "@/modules/mock/services/mock-api";

type Props = {
  hubs: PracticeHub[];
  mockUnlock: MockUnlock | null;
  highlightHubId?: string | null;
  mockLockedMessage?: boolean;
  hubLockedMessage?: boolean;
};

const STATUS_LABEL: Record<PracticeHub["status"], string> = {
  pending: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

export function WritingSkillCourseHome({
  hubs,
  mockUnlock,
  highlightHubId = null,
  mockLockedMessage = false,
  hubLockedMessage = false,
}: Props) {
  const highlightRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const track = resolveWritingTrackFromUnlock(mockUnlock);
  const trackLabel = writingTrackLabel(track);
  const { completed, total } = writingCourseProgress(hubs, mockUnlock);
  const pct =
    total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const currentHub = findCurrentWritingHub(hubs);
  const mockState = resolveWritingMockUiState(mockUnlock);
  const mocksLeft = writingMocksRemaining(mockUnlock);

  const prefetchHrefs = useMemo(() => {
    const hrefs: string[] = [];
    if (currentHub) hrefs.push(`/practice/writing/${currentHub.id}`);
    for (const h of hubs) {
      if (isWritingHubAccessible(h) && h.status !== "completed") {
        hrefs.push(`/practice/writing/${h.id}`);
        if (hrefs.length >= 4) break;
      }
    }
    return hrefs;
  }, [currentHub, hubs]);

  useEffect(() => {
    if (highlightHubId && highlightRef.current) {
      highlightRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightHubId]);

  return (
    <div className="relative space-y-6 pb-2 sm:space-y-8">
      <PrefetchHrefs hrefs={prefetchHrefs} />
      <div
        className="pointer-events-none absolute -inset-x-4 -top-6 -z-10 h-72 overflow-hidden sm:-inset-x-8"
        aria-hidden
      >
        <div className="absolute -left-10 top-0 size-56 rounded-full bg-cyan/20 blur-3xl" />
        <div className="absolute right-0 top-8 size-48 rounded-full bg-teal/15 blur-3xl" />
      </div>

      <header className="overflow-hidden rounded-[28px] border border-white/60 bg-white/55 p-5 shadow-[0_8px_40px_rgba(8,145,178,0.08),0_1px_0_rgba(255,255,255,0.85)_inset] backdrop-blur-[24px] backdrop-saturate-[150%] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-cyan text-navy shadow-[0_0_0_4px_rgba(0,188,212,0.18)]">
              <PencilIcon className="size-5" strokeWidth={2.1} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal">
                Writing Skill
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">
                Course home
              </h1>
              {trackLabel ? (
                <p className="mt-1.5 text-[13px] font-semibold text-navy">
                  {trackLabel}
                </p>
              ) : null}
              <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-muted">
                Complete hubs in order. Progress and unlocks come from your
                Writing Skill programme — review finished hubs anytime.
              </p>
            </div>
          </div>

          <div className="relative flex size-[4.5rem] shrink-0 items-center justify-center sm:size-20">
            <svg
              viewBox="0 0 72 72"
              className="absolute inset-0 size-full -rotate-90"
              aria-hidden
            >
              <circle
                cx="36"
                cy="36"
                r="30"
                fill="none"
                stroke="rgba(15,23,42,0.08)"
                strokeWidth="6"
              />
              <circle
                cx="36"
                cy="36"
                r="30"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                className="text-cyan"
                strokeDasharray={`${2 * Math.PI * 30}`}
                strokeDashoffset={`${2 * Math.PI * 30 * (1 - pct / 100)}`}
                style={{
                  transition: reduce ? undefined : "stroke-dashoffset 0.6s ease",
                }}
              />
            </svg>
            <div className="text-center">
              <p
                className="font-display text-lg font-bold tabular-nums leading-none text-ink"
                data-testid="writing-course-progress-completed"
              >
                {completed}
              </p>
              <p
                className="mt-0.5 text-[10px] font-semibold text-muted"
                data-testid="writing-course-progress-total"
              >
                / {total}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted">
            <span>Progress</span>
            <span className="font-mono font-semibold tabular-nums text-ink">
              {completed} / {total}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal to-cyan transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
              data-testid="writing-course-progress-bar"
            />
          </div>
        </div>

        {hubLockedMessage ? (
          <p
            role="alert"
            className="mt-4 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-3.5 py-2.5 text-[13px] text-amber-950"
          >
            That hub is locked. Complete the previous hub first
            {currentHub ? (
              <>
                {" "}
                (
                <span className="font-semibold">
                  {writingHubDisplayTitle(currentHub, 1)}
                </span>
                )
              </>
            ) : null}
            .
          </p>
        ) : null}
        {mockLockedMessage ? (
          <p
            role="alert"
            className="mt-4 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-3.5 py-2.5 text-[13px] text-amber-950"
          >
            {writingMockLockedCopy()}
          </p>
        ) : null}
      </header>

      {currentHub ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: DASH_EASE }}
        >
          <Link
            href={`/practice/writing/${currentHub.id}`}
            data-testid="writing-course-continue-cta"
            className="group relative flex cursor-pointer flex-col gap-4 overflow-hidden rounded-[28px] border border-navy/15 bg-navy p-5 text-white shadow-[0_16px_40px_rgba(15,23,42,0.22)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60 sm:flex-row sm:items-center sm:justify-between sm:p-6"
          >
            <div
              className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full bg-cyan/25 blur-3xl"
              aria-hidden
            />
            <div className="relative min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan">
                Current hub
              </p>
              <p className="mt-1 font-display text-xl font-bold tracking-tight sm:text-[1.35rem]">
                {writingHubDisplayTitle(currentHub, 1)}
              </p>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[13px] text-white/65">
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="size-3.5" aria-hidden />~
                  {currentHub.estimated_min} min
                </span>
                {writingHubTaskLabel(currentHub) ? (
                  <>
                    <span>·</span>
                    <span>{writingHubTaskLabel(currentHub)}</span>
                  </>
                ) : null}
                <span>·</span>
                <span>{STATUS_LABEL[currentHub.status]}</span>
              </p>
            </div>
            <span className="relative inline-flex min-h-12 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-cyan px-5 text-[14px] font-bold text-navy transition-colors group-hover:bg-brand-sky-hover sm:w-auto sm:min-w-[160px]">
              {currentHub.status === "in_progress" ? "Continue" : "Start"}
              <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
            </span>
          </Link>
        </motion.div>
      ) : null}

      {hubs.length === 0 ? (
        <div className="rounded-[28px] border border-white/60 bg-white/55 px-5 py-10 text-center backdrop-blur-xl">
          <p className="text-sm text-muted">
            No Writing Skill hubs are available for your track yet.
          </p>
        </div>
      ) : (
        <section
          className="overflow-hidden rounded-[28px] border border-white/60 bg-white/50 shadow-[0_8px_32px_rgba(15,23,42,0.04)] backdrop-blur-xl"
          aria-label="Writing Skill hubs"
        >
          <div className="flex items-center justify-between gap-3 border-b border-ink/[0.05] px-4 py-3.5 sm:px-5">
            <div>
              <h2 className="font-display text-base font-bold text-ink">
                Course hubs
              </h2>
              <p className="mt-0.5 text-[12px] text-muted">
                {completed}/{total} complete
              </p>
            </div>
            <span className="rounded-full bg-cyan-soft/80 px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-teal ring-1 ring-cyan/20">
              {hubs.length} hubs
            </span>
          </div>

          <ul className="grid gap-2.5 p-3 sm:grid-cols-2 sm:gap-3 sm:p-4 lg:grid-cols-3">
            {hubs.map((hub, index) => {
              const position = index + 1;
              const state = writingHubUiState(hub, currentHub?.id);
              const accessible = isWritingHubAccessible(hub);
              const highlighted = highlightHubId === hub.id;
              const done = hub.status === "completed";
              const taskLabel = writingHubTaskLabel(hub);
              const title = writingHubDisplayTitle(hub, position);
              const cta = writingHubCtaLabel(state);
              const lockedReason =
                hub.locked_reason?.trim() ||
                "Complete the previous hub to unlock";

              const cardInner = (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl",
                        state === "locked" && "bg-ink/[0.04] text-ink/35",
                        state === "completed" && "bg-teal text-white",
                        state === "current" && "bg-cyan text-navy",
                        state === "open" && "bg-cyan-soft text-teal",
                      )}
                    >
                      {state === "locked" ? (
                        <Lock className="size-3.5" strokeWidth={2.5} />
                      ) : done ? (
                        <Check className="size-3.5" strokeWidth={2.5} />
                      ) : (
                        <span className="text-[12px] font-bold tabular-nums">
                          {hub.set_number > 0 ? hub.set_number : position}
                        </span>
                      )}
                    </span>
                    {state === "current" ? (
                      <span className="rounded-full bg-cyan/20 px-2 py-0.5 text-[10px] font-semibold text-navy">
                        Current
                      </span>
                    ) : state === "completed" ? (
                      <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-semibold text-teal">
                        Done
                      </span>
                    ) : state === "locked" ? (
                      <span className="rounded-full bg-ink/[0.04] px-2 py-0.5 text-[10px] font-semibold text-ink/40">
                        Locked
                      </span>
                    ) : (
                      <span className="rounded-full bg-ink/[0.04] px-2 py-0.5 text-[10px] font-semibold text-muted">
                        Open
                      </span>
                    )}
                  </div>

                  <div className="mt-3 min-w-0">
                    <p
                      className={cn(
                        "font-display text-[15px] font-bold tracking-tight",
                        accessible ? "text-ink" : "text-ink/45",
                      )}
                    >
                      {title}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-[12px]",
                        accessible ? "text-muted" : "text-ink/35",
                      )}
                    >
                      {taskLabel ? `${taskLabel} · ` : null}~
                      {hub.estimated_min} min
                      {accessible && !done
                        ? ` · ${STATUS_LABEL[hub.status]}`
                        : null}
                    </p>
                  </div>

                  <div className="mt-auto pt-3">
                    {accessible ? (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[12.5px] font-semibold",
                          done ? "text-teal" : "text-[#0E7490]",
                        )}
                      >
                        {cta}
                        <ArrowRight
                          className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </span>
                    ) : (
                      <p className="text-[11.5px] leading-snug text-ink/35">
                        {lockedReason}
                      </p>
                    )}
                  </div>
                </>
              );

              return (
                <li
                  key={hub.id}
                  className="min-h-0"
                  data-testid={`writing-hub-card-${hub.id}`}
                  data-hub-state={state}
                >
                  {accessible ? (
                    <Link
                      href={`/practice/writing/${hub.id}`}
                      ref={(node) => {
                        if (highlighted) highlightRef.current = node;
                      }}
                      className={cn(
                        "group flex h-full min-h-[148px] cursor-pointer flex-col rounded-2xl border px-3.5 py-3.5 transition-[transform,box-shadow,border-color,background-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50",
                        done
                          ? "border-teal/20 bg-teal/[0.04] hover:border-teal/35 hover:bg-teal/[0.07]"
                          : "border-ink/8 bg-white/80 hover:-translate-y-0.5 hover:border-cyan/35 hover:bg-white hover:shadow-[0_12px_28px_rgba(8,145,178,0.12)]",
                        state === "current" &&
                          "border-cyan/50 bg-cyan-soft/40 ring-1 ring-cyan/25",
                        highlighted && "border-cyan ring-2 ring-cyan/30",
                      )}
                    >
                      {cardInner}
                    </Link>
                  ) : (
                    <div
                      ref={(node) => {
                        if (highlighted) highlightRef.current = node;
                      }}
                      className={cn(
                        "flex h-full min-h-[148px] flex-col rounded-2xl border border-ink/[0.06] bg-ink/[0.02] px-3.5 py-3.5",
                        highlighted && "ring-2 ring-amber-300/50",
                      )}
                      aria-disabled="true"
                    >
                      {cardInner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <WritingSkillMockSection
        mockUnlock={mockUnlock}
        mockState={mockState}
        mocksLeft={mocksLeft}
      />
    </div>
  );
}

function WritingSkillMockSection({
  mockUnlock,
  mockState,
  mocksLeft,
}: {
  mockUnlock: MockUnlock | null;
  mockState: ReturnType<typeof resolveWritingMockUiState>;
  mocksLeft: number | null;
}) {
  const unlocked = mockState === "unlocked";
  const used = mockState === "used";
  const unavailable = mockState === "unavailable";

  let body: string;
  if (unlocked) {
    body =
      mocksLeft != null
        ? `Writing Mock ready · ${mocksLeft} remaining`
        : "Writing Mock ready. Start when you are prepared.";
  } else if (used) {
    body = writingMockUsedCopy();
  } else if (unavailable) {
    body = writingMockUnavailableCopy();
  } else {
    body = writingMockLockedCopy();
  }

  return (
    <div
      data-testid="writing-skill-mock-section"
      data-mock-state={mockState}
      className={cn(
        "overflow-hidden rounded-[28px] border p-5 sm:p-6",
        unlocked
          ? "border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white shadow-[0_8px_32px_rgba(16,185,129,0.12)]"
          : "border-white/60 bg-white/55 shadow-[0_8px_32px_rgba(15,23,42,0.04)] backdrop-blur-xl",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-2xl",
              unlocked
                ? "bg-emerald-500 text-white"
                : "bg-ink/[0.05] text-ink/45",
            )}
          >
            {unlocked ? (
              <Unlock className="size-5" strokeWidth={2} />
            ) : (
              <Lock className="size-5" strokeWidth={2} />
            )}
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg font-bold tracking-tight text-ink">
              Writing Mock
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{body}</p>
          </div>
        </div>

        {unlocked && mockUnlock?.mock_test_id ? (
          <WritingSkillMockStartButton mockTestId={mockUnlock.mock_test_id} />
        ) : null}
      </div>
    </div>
  );
}

function WritingSkillMockStartButton({ mockTestId }: { mockTestId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onStart() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await mockApi.start(mockTestId);
      const path = examPathForMockStart(mockTestId, {
        mock_attempt_id: res.mock_attempt_id,
        current_module: res.current_module,
        part: res.part,
      });
      router.push(path);
    } catch {
      setError(writingMockUnavailableCopy());
      setBusy(false);
    }
  }

  return (
    <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto">
      <button
        type="button"
        data-testid="writing-skill-mock-start"
        disabled={busy}
        onClick={onStart}
        className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-navy px-5 text-[13px] font-bold text-white transition-colors hover:bg-navy/90 disabled:cursor-wait disabled:opacity-70"
      >
        {busy ? "Starting…" : "Start mock"}
        <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
      </button>
      {error ? (
        <p role="alert" className="text-[12px] text-amber-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}
