"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, Clock, Loader2, Play } from "lucide-react";
import { BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import { completePracticeHub } from "@/lib/practice-api";
import {
  appendSkillContext,
  parseVideoEmbed,
  resolveSubmitHref,
} from "@/lib/practice-submit";
import type { MockUnlock, PracticeHubDetail, PracticeSkill } from "@/lib/practice-types";
import { practiceSkillLabel } from "@/lib/practice-types";
import { cn } from "@/lib/utils";

type Props = {
  skill: PracticeSkill;
  hub: PracticeHubDetail;
  mockUnlock: MockUnlock | null;
};

const STATUS_LABEL: Record<PracticeHubDetail["status"], string> = {
  pending: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

const STATUS_STYLE: Record<PracticeHubDetail["status"], string> = {
  pending: "bg-ink/5 text-ink/55",
  in_progress: "bg-amber-50 text-amber-800",
  completed: "bg-emerald-50 text-emerald-700",
};

function VideoBlock({ title, url }: { title: string; url: string }) {
  const embed = parseVideoEmbed(url);

  if (embed.kind === "none") {
    return (
      <div className="flex aspect-video flex-col items-center justify-center rounded-xl border border-dashed border-border-soft bg-ink/[0.02] px-4 text-center">
        <Play className="size-8 text-ink/25" strokeWidth={1.5} />
        <p className="mt-2 text-sm font-semibold text-navy">{title}</p>
        <p className="mt-1 text-xs text-muted">Video coming soon</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border-soft bg-black">
      <iframe
        title={title}
        src={embed.embedUrl}
        className="aspect-video w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export function PracticeHubExperience({ skill, hub, mockUnlock }: Props) {
  const [status, setStatus] = useState(hub.status);
  const [completing, setCompleting] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitHref = appendSkillContext(
    resolveSubmitHref(hub.submit_config, skill),
    skill,
  );
  const setIndex = hub.sort_order > 0 ? hub.set_number : hub.set_number;
  const totalSets = mockUnlock?.required ?? 12;

  async function handleComplete() {
    if (status === "completed" || completing) return;
    setCompleting(true);
    setError(null);
    try {
      const result = await completePracticeHub(hub.id);
      setStatus(result.status);
      const { completed_count, required_for_mock, mock_unlocked } = result.skill_progress;
      setProgressMsg(
        mock_unlocked
          ? `All ${required_for_mock} sets complete — mock unlocked!`
          : `${completed_count} of ${required_for_mock} sets complete`,
      );
    } catch {
      setError("Could not mark hub complete. Please try again.");
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Link
          href={`/practice/${skill}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan hover:underline"
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
          Back to {practiceSkillLabel(skill)} hubs
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <BfSectionEyebrow>
              Bank {hub.bank_number} · Set {setIndex} of {totalSets}
            </BfSectionEyebrow>
            <BfSectionHeading className="mt-2">{hub.title}</BfSectionHeading>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
              <Clock className="size-3.5" strokeWidth={2} />
              ~{hub.estimated_min} min
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
              STATUS_STYLE[status],
            )}
          >
            {status === "completed" ? (
              <Check className="size-3" strokeWidth={2.5} />
            ) : null}
            {STATUS_LABEL[status]}
          </span>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-navy">Videos</h2>
        {hub.videos.length === 0 ? (
          <p className="rounded-2xl border border-border-soft bg-white px-5 py-4 text-sm text-muted">
            Video content for this set is on the way. Use the practice prompt below
            while we finish production.
          </p>
        ) : (
          <ul className="space-y-4">
            {hub.videos.map((video, idx) => (
              <li key={`${video.title}-${idx}`} className="space-y-2">
                <p className="text-sm font-semibold text-navy">{video.title}</p>
                <VideoBlock title={video.title} url={video.url} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-navy">Practice</h2>
        <div className="rounded-2xl border border-border-soft bg-white px-5 py-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
            {hub.practice_prompt || "Practice instructions will appear here."}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-navy">Submit</h2>
        <div className="rounded-2xl border border-border-soft bg-white px-5 py-5">
          <p className="text-sm text-muted">
            When you are ready, complete the module exercise for this set.
          </p>
          <Link
            href={submitHref}
            className="mt-4 inline-flex rounded-full bg-cyan px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-sky-hover"
          >
            Start practice
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-navy">Complete</h2>
        <div className="rounded-2xl border border-border-soft bg-white px-5 py-5">
          <p className="text-sm text-muted">
            Finished watching and practicing? Mark this set complete to track progress
            toward your skill mock unlock.
          </p>
          {progressMsg ? (
            <p className="mt-2 text-sm font-semibold text-emerald-700">{progressMsg}</p>
          ) : null}
          {error ? (
            <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>
          ) : null}
          <button
            type="button"
            onClick={() => void handleComplete()}
            disabled={status === "completed" || completing}
            className={cn(
              "mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold",
              status === "completed"
                ? "cursor-default bg-emerald-100 text-emerald-800"
                : "bg-navy text-white hover:bg-navy/90 disabled:opacity-60",
            )}
          >
            {completing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : status === "completed" ? (
              <Check className="size-4" strokeWidth={2.5} />
            ) : null}
            {status === "completed" ? "Set complete" : "Mark complete"}
          </button>
        </div>
      </section>
    </div>
  );
}
