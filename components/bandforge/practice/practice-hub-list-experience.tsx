"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  type ComponentType,
  type SVGProps,
} from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  Lock,
  Unlock,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import { DASH_EASE } from "@/components/bandforge/dashboard/motion";
import type { MockUnlock, PracticeHub, PracticeSkill } from "@/lib/practice-types";
import { PRACTICE_SKILLS, practiceSkillLabel } from "@/lib/practice-types";
import { skillMockPath } from "@/lib/practice-submit";
import { cn } from "@/lib/utils";
import { PrefetchHrefs } from "@/components/bandforge/prefetch-hrefs";

type Props = {
  skill: PracticeSkill;
  hubs: PracticeHub[];
  mockUnlock: MockUnlock | null;
  highlightHubId?: string | null;
  mockLockedMessage?: boolean;
  hubLockedMessage?: boolean;
};

const SKILL_ICON: Record<
  PracticeSkill,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  listening: HeadphonesIcon,
  reading: BookIcon,
  writing: PencilIcon,
  speaking: MicIcon,
};

const STATUS_LABEL: Record<PracticeHub["status"], string> = {
  pending: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

function isHubAccessible(hub: PracticeHub): boolean {
  return hub.accessible !== false;
}

/** Prefer clean set labels when backend title is a slug/id. */
function hubDisplayTitle(hub: PracticeHub, required: number): string {
  const raw = (hub.title || "").trim();
  const looksLikeSlug =
    !raw ||
    /^[a-z]+-(b\d+-s\d+|custom-)/i.test(raw) ||
    (/^[a-z0-9-]{10,}$/i.test(raw) && raw.includes("-"));
  if (looksLikeSlug) return `Set ${hub.set_number}`;
  return raw;
}

function groupByBank(hubs: PracticeHub[]): { bank: number; hubs: PracticeHub[] }[] {
  const map = new Map<number, PracticeHub[]>();
  for (const hub of hubs) {
    const list = map.get(hub.bank_number) ?? [];
    list.push(hub);
    map.set(hub.bank_number, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([bank, rows]) => ({
      bank,
      hubs: rows.sort((a, b) => a.set_number - b.set_number),
    }));
}

export function PracticeHubListExperience({
  skill,
  hubs,
  mockUnlock,
  highlightHubId = null,
  mockLockedMessage = false,
  hubLockedMessage = false,
}: Props) {
  const highlightRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const SkillIcon = SKILL_ICON[skill];

  const completed = hubs.filter((h) => h.status === "completed").length;
  const total = hubs.length;
  const required = mockUnlock?.required ?? Math.max(total, 12);
  const pct =
    required > 0 ? Math.min(100, Math.round((completed / required) * 100)) : 0;

  const currentHub = hubs.find(
    (h) => isHubAccessible(h) && h.status !== "completed",
  );
  const banks = useMemo(() => groupByBank(hubs), [hubs]);
  const prefetchHrefs = useMemo(() => {
    const hrefs: string[] = [];
    if (currentHub) hrefs.push(`/practice/${skill}/${currentHub.id}`);
    for (const h of hubs) {
      if (isHubAccessible(h) && h.status !== "completed") {
        hrefs.push(`/practice/${skill}/${h.id}`);
        if (hrefs.length >= 4) break;
      }
    }
    return hrefs;
  }, [currentHub, hubs, skill]);

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
      <nav
        className="flex gap-1 overflow-x-auto rounded-xl border border-border-soft bg-white p-1"
        aria-label="Practice skills"
      >
        {PRACTICE_SKILLS.map((key) => {
          const active = key === skill;
          return (
            <Link
              key={key}
              href={`/practice/${key}`}
              className={cn(
                "min-w-0 flex-1 rounded-lg px-3 py-2.5 text-center text-[13px] font-semibold whitespace-nowrap transition-colors",
                active
                  ? "bg-cyan text-white"
                  : "text-muted hover:bg-ink/5 hover:text-navy",
              )}
            >
              {practiceSkillLabel(key)}
            </Link>
          );
        })}
      </nav>
      <div
        className="pointer-events-none absolute -inset-x-4 -top-6 -z-10 h-72 overflow-hidden sm:-inset-x-8"
        aria-hidden
      >
        <div className="absolute -left-10 top-0 size-56 rounded-full bg-cyan/20 blur-3xl" />
        <div className="absolute right-0 top-8 size-48 rounded-full bg-teal/15 blur-3xl" />
      </div>

      {/* Hero */}
      <header className="overflow-hidden rounded-[28px] border border-white/60 bg-white/55 p-5 shadow-[0_8px_40px_rgba(8,145,178,0.08),0_1px_0_rgba(255,255,255,0.85)_inset] backdrop-blur-[24px] backdrop-saturate-[150%] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-cyan text-navy shadow-[0_0_0_4px_rgba(0,188,212,0.18)]">
              <SkillIcon className="size-5" strokeWidth={2.1} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal">
                Practice hubs
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">
                {practiceSkillLabel(skill)}
              </h1>
              <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-muted">
                Finish sets in order. Completed sets stay open for review —
                unlock the full mock at {required}/{required}.
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
              <p className="font-display text-lg font-bold tabular-nums leading-none text-ink">
                {completed}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold text-muted">
                / {required}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted">
            <span>Mock progress</span>
            <span className="font-mono font-semibold tabular-nums text-ink">
              {pct}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal to-cyan transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {hubLockedMessage ? (
          <p
            role="alert"
            className="mt-4 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-3.5 py-2.5 text-[13px] text-amber-950"
          >
            That set is locked. Complete{" "}
            {currentHub ? (
              <span className="font-semibold">
                Bank {currentHub.bank_number} · Set {currentHub.set_number}
              </span>
            ) : (
              "the previous set"
            )}{" "}
            first.
          </p>
        ) : null}
        {mockLockedMessage ? (
          <p
            role="alert"
            className="mt-4 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-3.5 py-2.5 text-[13px] text-amber-950"
          >
            Complete all {required} sets to unlock the full{" "}
            {practiceSkillLabel(skill)} mock.
          </p>
        ) : null}
      </header>

      {/* Continue current */}
      {currentHub ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: DASH_EASE }}
        >
          <Link
            href={`/practice/${skill}/${currentHub.id}`}
            className="group relative flex cursor-pointer flex-col gap-4 overflow-hidden rounded-[28px] border border-navy/15 bg-navy p-5 text-white shadow-[0_16px_40px_rgba(15,23,42,0.22)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60 sm:flex-row sm:items-center sm:justify-between sm:p-6"
          >
            <div
              className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full bg-cyan/25 blur-3xl"
              aria-hidden
            />
            <div className="relative min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan">
                Continue · Bank {currentHub.bank_number}
              </p>
              <p className="mt-1 font-display text-xl font-bold tracking-tight sm:text-[1.35rem]">
                {hubDisplayTitle(currentHub, required)}
                <span className="ml-2 text-base font-semibold text-white/55">
                  of {required}
                </span>
              </p>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[13px] text-white/65">
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="size-3.5" aria-hidden />~
                  {currentHub.estimated_min} min
                </span>
                <span>·</span>
                <span>{STATUS_LABEL[currentHub.status]}</span>
              </p>
            </div>
            <span className="relative inline-flex min-h-12 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-cyan px-5 text-[14px] font-bold text-navy transition-colors group-hover:bg-brand-sky-hover sm:w-auto sm:min-w-[160px]">
              {currentHub.status === "in_progress" ? "Resume" : "Start set"}
              <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
            </span>
          </Link>
        </motion.div>
      ) : null}

      {hubs.length === 0 ? (
        <div className="rounded-[28px] border border-white/60 bg-white/55 px-5 py-10 text-center backdrop-blur-xl">
          <p className="text-sm text-muted">
            No practice hubs are available for this skill yet.
          </p>
          <p className="mt-2 text-sm text-muted">
            <Link
              href="/study-plan/today"
              className="font-semibold text-teal hover:underline"
            >
              Open today&apos;s plan
            </Link>{" "}
            or contact support if your programme should include practice sets.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {banks.map(({ bank, hubs: bankHubs }) => {
            const bankDone = bankHubs.filter(
              (h) => h.status === "completed",
            ).length;
            return (
              <section
                key={bank}
                className="overflow-hidden rounded-[28px] border border-white/60 bg-white/50 shadow-[0_8px_32px_rgba(15,23,42,0.04)] backdrop-blur-xl"
              >
                <div className="flex items-center justify-between gap-3 border-b border-ink/[0.05] px-4 py-3.5 sm:px-5">
                  <div>
                    <h2 className="font-display text-base font-bold text-ink">
                      Bank {bank}
                    </h2>
                    <p className="mt-0.5 text-[12px] text-muted">
                      {bankDone}/{bankHubs.length} sets complete
                    </p>
                  </div>
                  <span className="rounded-full bg-cyan-soft/80 px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-teal ring-1 ring-cyan/20">
                    {bankHubs.length} sets
                  </span>
                </div>

                <ul className="grid gap-2.5 p-3 sm:grid-cols-2 sm:gap-3 sm:p-4 lg:grid-cols-3">
                  {bankHubs.map((hub) => {
                    const accessible = isHubAccessible(hub);
                    const highlighted = highlightHubId === hub.id;
                    const isCurrent =
                      accessible &&
                      hub.status !== "completed" &&
                      currentHub?.id === hub.id;
                    const done = hub.status === "completed";

                    const cardInner = (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-xl",
                              !accessible && "bg-ink/[0.04] text-ink/35",
                              accessible &&
                                done &&
                                "bg-teal text-white",
                              accessible &&
                                !done &&
                                isCurrent &&
                                "bg-cyan text-navy",
                              accessible &&
                                !done &&
                                !isCurrent &&
                                "bg-cyan-soft text-teal",
                            )}
                          >
                            {!accessible ? (
                              <Lock className="size-3.5" strokeWidth={2.5} />
                            ) : done ? (
                              <Check className="size-3.5" strokeWidth={2.5} />
                            ) : (
                              <span className="text-[12px] font-bold tabular-nums">
                                {hub.set_number}
                              </span>
                            )}
                          </span>
                          {isCurrent ? (
                            <span className="rounded-full bg-cyan/20 px-2 py-0.5 text-[10px] font-semibold text-navy">
                              Current
                            </span>
                          ) : done ? (
                            <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-semibold text-teal">
                              Done
                            </span>
                          ) : !accessible ? (
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
                            {hubDisplayTitle(hub, required)}
                          </p>
                          <p
                            className={cn(
                              "mt-1 text-[12px]",
                              accessible ? "text-muted" : "text-ink/35",
                            )}
                          >
                            ~{hub.estimated_min} min
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
                              {done ? "Review" : "Open set"}
                              <ArrowRight
                                className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                                aria-hidden
                              />
                            </span>
                          ) : (
                            <p className="text-[11.5px] leading-snug text-ink/35">
                              Finish the previous set to unlock
                            </p>
                          )}
                        </div>
                      </>
                    );

                    return (
                      <li key={hub.id} className="min-h-0">
                        {accessible ? (
                          <Link
                            href={`/practice/${skill}/${hub.id}`}
                            ref={(node) => {
                              if (highlighted) highlightRef.current = node;
                            }}
                            className={cn(
                              "group flex h-full min-h-[148px] cursor-pointer flex-col rounded-2xl border px-3.5 py-3.5 transition-[transform,box-shadow,border-color,background-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50",
                              done
                                ? "border-teal/20 bg-teal/[0.04] hover:border-teal/35 hover:bg-teal/[0.07]"
                                : "border-ink/8 bg-white/80 hover:-translate-y-0.5 hover:border-cyan/35 hover:bg-white hover:shadow-[0_12px_28px_rgba(8,145,178,0.12)]",
                              isCurrent &&
                                "border-cyan/50 bg-cyan-soft/40 ring-1 ring-cyan/25",
                              highlighted &&
                                "border-cyan ring-2 ring-cyan/30",
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
                          >
                            {cardInner}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {/* Mock unlock */}
      <div
        className={cn(
          "overflow-hidden rounded-[28px] border p-5 sm:p-6",
          mockUnlock?.unlocked
            ? "border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white shadow-[0_8px_32px_rgba(16,185,129,0.12)]"
            : "border-white/60 bg-white/55 shadow-[0_8px_32px_rgba(15,23,42,0.04)] backdrop-blur-xl",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                mockUnlock?.unlocked
                  ? "bg-emerald-500 text-white"
                  : "bg-ink/[0.05] text-ink/45",
              )}
            >
              {mockUnlock?.unlocked ? (
                <Unlock className="size-5" strokeWidth={2} />
              ) : (
                <Lock className="size-5" strokeWidth={2} />
              )}
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-bold tracking-tight text-ink">
                Full {practiceSkillLabel(skill)} mock
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">
                {mockUnlock?.unlocked
                  ? "All required sets complete. Take the full mock when you are ready."
                  : `${mockUnlock?.completed ?? completed} of ${required} sets complete — unlocks at ${required}/${required}.`}
              </p>
            </div>
          </div>

          {mockUnlock?.unlocked ? (
            <Link
              href={skillMockPath(skill)}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-navy px-5 text-[13px] font-bold text-white transition-colors hover:bg-navy/90"
            >
              Start mock test
              <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
            </Link>
          ) : (
            <div className="w-full max-w-[180px] sm:w-40">
              <div className="mb-1 flex justify-between text-[10px] font-semibold text-muted">
                <span>Unlock</span>
                <span className="tabular-nums">
                  {mockUnlock?.completed ?? completed}/{required}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-ink/[0.06]">
                <div
                  className="h-full rounded-full bg-teal/70"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (((mockUnlock?.completed ?? completed) / required) *
                          100) ||
                          0,
                      ),
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
