"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Check, Lock, Unlock } from "lucide-react";
import { BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import type { MockUnlock, PracticeHub, PracticeSkill } from "@/lib/practice-types";
import { practiceSkillLabel } from "@/lib/practice-types";
import { skillMockPath } from "@/lib/practice-submit";
import { cn } from "@/lib/utils";

type Props = {
  skill: PracticeSkill;
  hubs: PracticeHub[];
  mockUnlock: MockUnlock | null;
  highlightHubId?: string | null;
  mockLockedMessage?: boolean;
};

const STATUS_LABEL: Record<PracticeHub["status"], string> = {
  pending: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

const STATUS_STYLE: Record<PracticeHub["status"], string> = {
  pending: "bg-ink/5 text-ink/55",
  in_progress: "bg-amber-50 text-amber-800",
  completed: "bg-emerald-50 text-emerald-700",
};

export function PracticeHubListExperience({
  skill,
  hubs,
  mockUnlock,
  highlightHubId = null,
  mockLockedMessage = false,
}: Props) {
  const highlightRef = useRef<HTMLLIElement>(null);
  const completed = hubs.filter((h) => h.status === "completed").length;
  const total = hubs.length;
  const required = mockUnlock?.required ?? 12;

  useEffect(() => {
    if (highlightHubId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightHubId]);

  return (
    <div className="space-y-8">
      <header>
        <BfSectionEyebrow>Practice hubs</BfSectionEyebrow>
        <BfSectionHeading className="mt-2">
          {practiceSkillLabel(skill)}
        </BfSectionHeading>
        <p className="mt-2 text-sm text-muted">
          {completed} of {total || required} sets completed
          {mockUnlock?.unlocked ? " · Mock unlocked" : " · Complete all sets to unlock mock"}
        </p>
        {mockLockedMessage ? (
          <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Complete all {required} sets to unlock the full {practiceSkillLabel(skill)}{" "}
            mock.
          </p>
        ) : null}
      </header>

      {hubs.length === 0 ? (
        <div className="rounded-2xl border border-border-soft bg-white px-5 py-5 text-sm text-muted">
          <p>No practice hubs are available for this skill yet.</p>
          <p className="mt-2">
            <Link href="/study-plan/today" className="font-semibold text-cyan hover:underline">
              Open today&apos;s plan
            </Link>{" "}
            or contact support if your programme should include practice sets.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {hubs.map((hub) => {
            const highlighted = highlightHubId === hub.id;
            const setLabel = `Set ${hub.set_number} of ${required}`;
            return (
              <li
                key={hub.id}
                ref={highlighted ? highlightRef : undefined}
                className={cn(
                  "w-full rounded-2xl border bg-white px-4 py-4 sm:px-5",
                  highlighted
                    ? "border-cyan ring-2 ring-cyan/20"
                    : "border-border-soft",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-semibold tracking-[0.08em] text-cyan uppercase">
                      Bank {hub.bank_number} · {setLabel}
                    </p>
                    <p className="mt-1 font-display text-base font-bold text-navy">
                      {hub.title}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      ~{hub.estimated_min} min
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      STATUS_STYLE[hub.status],
                    )}
                  >
                    {hub.status === "completed" ? (
                      <Check className="size-3" strokeWidth={2.5} />
                    ) : null}
                    {STATUS_LABEL[hub.status]}
                  </span>
                </div>
                <Link
                  href={`/practice/${skill}/${hub.id}`}
                  className="mt-3 inline-flex text-sm font-semibold text-cyan hover:underline"
                >
                  View hub →
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div
        className={cn(
          "rounded-2xl border px-5 py-5",
          mockUnlock?.unlocked
            ? "border-emerald-200 bg-emerald-50/60"
            : "border-border-soft bg-white",
        )}
      >
        <div className="flex items-center gap-2">
          {mockUnlock?.unlocked ? (
            <Unlock className="size-5 text-emerald-600" strokeWidth={2} />
          ) : (
            <Lock className="size-5 text-ink/45" strokeWidth={2} />
          )}
          <p className="font-display text-base font-bold text-navy">
            Full {practiceSkillLabel(skill)} mock
          </p>
        </div>
        <p className="mt-2 text-sm text-muted">
          {mockUnlock?.unlocked
            ? "You have completed all required sets. Take the full mock when ready."
            : `${mockUnlock?.completed ?? completed} / ${required} sets complete — mock unlocks at ${required}/${required}.`}
        </p>
        {mockUnlock?.unlocked ? (
          <Link
            href={skillMockPath(skill)}
            className="mt-3 inline-flex rounded-full bg-cyan px-4 py-2 text-sm font-semibold text-white hover:bg-brand-sky-hover"
          >
            Start mock test
          </Link>
        ) : null}
      </div>
    </div>
  );
}
