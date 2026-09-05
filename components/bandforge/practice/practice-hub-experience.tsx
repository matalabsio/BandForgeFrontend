"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clock, Loader2, Play } from "lucide-react";
import { BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import { PlanOpeningSkeleton } from "@/components/bandforge/plan/plan-skeletons";
import { completePracticeHub } from "@/lib/practice-api";
import {
  nextPlanTask,
  planExerciseHref,
  planStepOpenHref,
  type PlanTaskKind,
} from "@/lib/plan-task-flow";
import {
  completePlanStepAndGetNextHref,
  shouldCompleteHubForPlanTask,
} from "@/lib/plan-step-completion";
import {
  appendSkillContext,
  parseVideoEmbed,
  resolveSubmitHref,
} from "@/lib/practice-submit";
import type { MockUnlock, PracticeHubDetail, PracticeSkill } from "@/lib/practice-types";
import { practiceSkillLabel } from "@/lib/practice-types";
import { speakingHubDisplayTitle, speakingHubPartLabel } from "@/lib/speaking-skill-course";
import {
  writingHubDisplayTitle,
  writingHubTaskLabel,
  writingHubTitleLooksLikeSlug,
} from "@/lib/writing-skill-course";
import { cn } from "@/lib/utils";

export type { PlanTaskKind };

type Props = {
  skill: PracticeSkill;
  hub: PracticeHubDetail;
  mockUnlock: MockUnlock | null;
  fromPlan?: boolean;
  planTask?: PlanTaskKind | null;
  planTaskId?: string | null;
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

const PLAN_TASK_LABEL: Record<PlanTaskKind, string> = {
  watch: "Watch",
  practice: "Practice",
  submit: "Submit",
};

function VideoBlock({
  title,
  url,
  onEnded,
  autoPlay,
}: {
  title: string;
  url: string;
  onEnded?: () => void;
  autoPlay?: boolean;
}) {
  const embed = parseVideoEmbed(url);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!autoPlay || embed.kind !== "direct") return;
    const el = videoRef.current;
    if (!el) return;
    void el.play().catch(() => {
      /* autoplay may be blocked; user can press play */
    });
  }, [autoPlay, embed.kind, url]);

  if (embed.kind === "none") {
    return (
      <div className="flex aspect-video flex-col items-center justify-center rounded-xl border border-dashed border-border-soft bg-ink/[0.02] px-4 text-center">
        <Play className="size-8 text-ink/25" strokeWidth={1.5} />
        <p className="mt-2 text-sm font-semibold text-navy">{title}</p>
        <p className="mt-1 text-xs text-muted">Video coming soon</p>
      </div>
    );
  }

  if (embed.kind === "direct") {
    return (
      <div className="overflow-hidden rounded-xl border border-border-soft bg-black">
        <video
          ref={videoRef}
          key={url}
          title={title}
          src={embed.embedUrl}
          controls
          className="aspect-video w-full"
          preload="auto"
          onEnded={onEnded}
        />
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

function appendPlanParams(
  href: string,
  {
    fromPlan,
    planTask,
    planTaskId,
  }: {
    fromPlan: boolean;
    planTask: PlanTaskKind | null | undefined;
    planTaskId: string | null | undefined;
  },
): string {
  if (!fromPlan) return href;
  const url = new URL(href, "http://localhost");
  url.searchParams.set("from", "plan");
  if (planTask) url.searchParams.set("task", planTask);
  if (planTaskId) url.searchParams.set("taskId", planTaskId);
  return `${url.pathname}${url.search}`;
}

function resolveHubDisplayTitle(skill: PracticeSkill, hub: PracticeHubDetail): string {
  const position = hub.set_number > 0 ? hub.set_number : 1;
  if (skill === "writing") return writingHubDisplayTitle(hub, position);
  if (skill === "speaking") return speakingHubDisplayTitle(hub, position);
  const raw = (hub.title || "").trim();
  if (
    !raw ||
    writingHubTitleLooksLikeSlug(raw) ||
    (/^[a-z0-9_-]{8,}$/i.test(raw) && (raw.includes("-") || raw.includes("_")))
  ) {
    return hub.set_number > 0 ? `Set ${hub.set_number}` : "Practice set";
  }
  return raw;
}

function resolveHubTaskBadge(skill: PracticeSkill, hub: PracticeHubDetail): string | null {
  if (skill === "writing") return writingHubTaskLabel(hub);
  if (skill === "speaking") return speakingHubPartLabel(hub);
  return null;
}

function practiceCtaLabel(status: PracticeHubDetail["status"]): string {
  if (status === "completed") return "Review exercise";
  if (status === "in_progress") return "Continue practice";
  return "Start practice";
}

export function PracticeHubExperience({
  skill,
  hub,
  mockUnlock,
  fromPlan = false,
  planTask = null,
  planTaskId = null,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(hub.status);
  const [completing, setCompleting] = useState(false);
  const [watchDone, setWatchDone] = useState(false);
  const [videoIndex, setVideoIndex] = useState(0);
  const [progressMsg, setProgressMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const advancingRef = useRef(false);

  const focus = fromPlan ? planTask ?? "practice" : null;
  const videos = hub.videos;

  const submitConfig = (hub.submit_config ?? {}) as {
    type?: string;
    catalog_number?: number;
    part?: number;
    href?: string;
  };
  const baseSubmitHref = appendSkillContext(
    resolveSubmitHref(submitConfig, skill),
    skill,
  );
  const submitHref = appendPlanParams(baseSubmitHref, {
    fromPlan,
    planTask,
    planTaskId,
  });
  const exerciseHref = planStepOpenHref({
    skill,
    hubId: hub.id,
    task: planTask === "submit" ? "submit" : "practice",
    taskId: planTaskId,
    bankNumber: hub.bank_number,
    catalogNumber: submitConfig.catalog_number,
    part: submitConfig.part,
    submitConfig,
  });
  const bankExerciseHref = planExerciseHref({
    skill,
    hubId: hub.id,
    task: planTask === "submit" ? "submit" : "practice",
    taskId: planTaskId,
  });
  const isBankOnly = submitConfig.type === "bank" && !submitConfig.href?.includes("/test/");
  // Prefer mock module UI (plan or hub CTA); thin bank exercise only as fallback.
  const practiceCtaHref =
    !isBankOnly &&
    (skill === "writing" ||
      skill === "listening" ||
      skill === "reading" ||
      skill === "speaking")
      ? fromPlan
        ? exerciseHref
        : submitHref
      : isBankOnly
        ? bankExerciseHref
        : submitHref;

  const setIndex = hub.sort_order > 0 ? hub.set_number : hub.set_number;
  const totalSets = mockUnlock?.required ?? 12;

  const goToNextAfterWatch = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    setWatchDone(true);
    const nextHref =
      completePlanStepAndGetNextHref({
        fromPlan,
        skill,
        hubId: hub.id,
        currentTask: "watch",
        currentTaskId: planTaskId,
        bankNumber: hub.bank_number,
        catalogNumber: submitConfig.catalog_number,
        part: submitConfig.part,
        submitConfig,
        preferExercise: true,
        completeHub: false,
      }) ?? "/study-plan/today";
    const goingToPractice = nextHref !== "/study-plan/today";
    setProgressMsg(
      goingToPractice
        ? "Watch done — opening practice…"
        : "Watch done — back to today’s plan…",
    );
    router.push(nextHref);
  }, [
    fromPlan,
    hub.bank_number,
    hub.id,
    planTaskId,
    router,
    skill,
    submitConfig,
  ]);

  // Practice/submit → real MT module when hub is module-targeted.
  // Legacy Watch with no real hub videos → skip straight to Practice.
  useEffect(() => {
    if (!fromPlan) return;
    if (focus === "watch" && hub.videos.length === 0) {
      goToNextAfterWatch();
      return;
    }
    if (focus !== "practice" && focus !== "submit") return;
    if (!isBankOnly) {
      router.replace(exerciseHref);
      return;
    }
    if (focus !== "practice") return;
    router.replace(bankExerciseHref);
  }, [
    fromPlan,
    focus,
    exerciseHref,
    bankExerciseHref,
    isBankOnly,
    router,
    hub.videos.length,
    goToNextAfterWatch,
  ]);

  function handleVideoEnded() {
    if (videoIndex < videos.length - 1) {
      setVideoIndex((i) => i + 1);
      return;
    }
    goToNextAfterWatch();
  }

  async function handleWatchDone() {
    if (watchDone || completing) return;
    setCompleting(true);
    setError(null);
    try {
      goToNextAfterWatch();
    } catch {
      setError("Could not continue. Please try again.");
      advancingRef.current = false;
    } finally {
      setCompleting(false);
    }
  }

  function handleSubmitStepDone() {
    if (completing || watchDone || advancingRef.current) return;
    advancingRef.current = true;
    setCompleting(true);
    const nextHref =
      completePlanStepAndGetNextHref({
        fromPlan,
        skill,
        hubId: hub.id,
        currentTask: "submit",
        currentTaskId: planTaskId,
        bankNumber: hub.bank_number,
        catalogNumber: submitConfig.catalog_number,
        part: submitConfig.part,
        submitConfig,
        preferExercise: true,
        completeHub: shouldCompleteHubForPlanTask(skill, "submit"),
      }) ?? "/study-plan/today";
    setProgressMsg(
      nextHref === "/study-plan/today"
        ? "Submit done — back to today’s plan…"
        : "Submit done — continuing…",
    );
    router.push(nextHref);
  }

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
      if (fromPlan) {
        const nextHref = completePlanStepAndGetNextHref({
          fromPlan,
          skill,
          hubId: hub.id,
          currentTask: planTask,
          currentTaskId: planTaskId,
          bankNumber: hub.bank_number,
          catalogNumber: submitConfig.catalog_number,
          part: submitConfig.part,
          submitConfig,
          completeHub: false,
        });
        router.push(nextHref ?? "/study-plan/today");
      }
    } catch {
      setError("Could not mark hub complete. Please try again.");
    } finally {
      setCompleting(false);
    }
  }

  const backHref = fromPlan ? "/study-plan/today" : `/practice/${skill}`;
  const backLabel = fromPlan
    ? "Back to today’s plan"
    : `Back to ${practiceSkillLabel(skill)} hubs`;

  const activeVideo = videos[videoIndex];
  const nextAfterWatch = nextPlanTask("watch", skill);
  const displayTitle = resolveHubDisplayTitle(skill, hub);
  const taskBadge = resolveHubTaskBadge(skill, hub);
  const practicePrompt = hub.practice_prompt?.trim() ?? "";
  const hasVideos = videos.length > 0;
  const mockProgress =
    mockUnlock && mockUnlock.required > 0
      ? { completed: mockUnlock.completed, required: mockUnlock.required }
      : null;

  // Brief skeleton while redirecting plan module steps to real test session.
  if (
    fromPlan &&
    (focus === "practice" || focus === "submit") &&
    (!isBankOnly || focus === "practice")
  ) {
    const label =
      skill === "writing"
        ? "Opening Writing task…"
        : skill === "listening"
          ? "Opening Listening test…"
          : skill === "reading"
            ? "Opening Reading passage…"
            : skill === "speaking"
              ? "Opening Speaking test…"
            : "Opening practice…";
    return <PlanOpeningSkeleton label={label} />;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan transition-colors hover:text-cyan/80"
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
          {backLabel}
        </Link>

        {fromPlan ? (
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <BfSectionEyebrow>
                {focus ? `Today’s plan · ${PLAN_TASK_LABEL[focus]}` : "Today’s plan"}
              </BfSectionEyebrow>
              <BfSectionHeading className="mt-2">{displayTitle}</BfSectionHeading>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                <Clock className="size-3.5" strokeWidth={2} />
                ~{hub.estimated_min} min
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[28px] border border-navy/10 bg-white shadow-[0_8px_32px_rgba(15,23,42,0.05)]">
            <div className="border-b border-ink/[0.05] bg-gradient-to-br from-navy/[0.03] to-transparent px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <BfSectionEyebrow>
                    Bank {hub.bank_number} · Set {setIndex} of {totalSets}
                  </BfSectionEyebrow>
                  <BfSectionHeading className="mt-2">{displayTitle}</BfSectionHeading>
                  <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-3.5" strokeWidth={2} />
                      ~{hub.estimated_min} min
                    </span>
                    {taskBadge ? (
                      <>
                        <span aria-hidden>·</span>
                        <span>{taskBadge}</span>
                      </>
                    ) : null}
                    {mockProgress ? (
                      <>
                        <span aria-hidden>·</span>
                        <span>
                          {mockProgress.completed} of {mockProgress.required} sets done
                        </span>
                      </>
                    ) : null}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    STATUS_STYLE[status],
                  )}
                >
                  {status === "completed" ? (
                    <Check className="size-3" strokeWidth={2.5} />
                  ) : null}
                  {STATUS_LABEL[status]}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-muted">
                {status === "completed"
                  ? "You’ve finished this set. Review your work or continue to the next hub."
                  : "Complete the exercise for this set, then mark it done to track your course progress."}
              </p>
              <div className="flex flex-col gap-2 sm:items-end">
                <Link
                  href={practiceCtaHref}
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-cyan px-5 text-sm font-bold text-navy transition-colors hover:bg-brand-sky-hover"
                >
                  {practiceCtaLabel(status)}
                  <ArrowRight className="size-4" strokeWidth={2.5} />
                </Link>
                {status !== "completed" ? (
                  <button
                    type="button"
                    onClick={() => void handleComplete()}
                    disabled={completing}
                    className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border-soft bg-white px-4 text-sm font-semibold text-navy transition-colors hover:bg-ink/[0.02] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {completing ? <Loader2 className="size-4 animate-spin" /> : null}
                    Mark complete
                  </button>
                ) : null}
              </div>
            </div>

            {progressMsg || error ? (
              <div className="border-t border-ink/[0.05] px-5 py-3 sm:px-6">
                {progressMsg ? (
                  <p className="text-sm font-semibold text-emerald-700">{progressMsg}</p>
                ) : null}
                {error ? (
                  <p className="text-sm font-semibold text-red-600">{error}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </header>

      {(!fromPlan || focus === "watch") && hasVideos ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-navy">Videos</h2>
            {videos.length > 1 ? (
              <span className="font-mono text-xs text-muted">
                {videoIndex + 1} of {videos.length}
              </span>
            ) : null}
          </div>
          {activeVideo ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-navy">{activeVideo.title}</p>
              <VideoBlock
                title={activeVideo.title}
                url={activeVideo.url}
                autoPlay={videoIndex > 0}
                onEnded={fromPlan && focus === "watch" ? handleVideoEnded : undefined}
              />
              {fromPlan && focus === "watch" && videoIndex < videos.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setVideoIndex((i) => i + 1)}
                  className="text-sm font-semibold text-cyan hover:underline"
                >
                  Skip to next video →
                </button>
              ) : null}
            </div>
          ) : null}
          {fromPlan && focus === "watch" ? (
            <div className="rounded-2xl border border-border-soft bg-white px-5 py-5">
              {progressMsg ? (
                <p className="mb-3 text-sm font-semibold text-emerald-700">{progressMsg}</p>
              ) : (
                <p className="mb-3 text-sm text-muted">
                  {videos.length > 1
                    ? "Finish a video to auto-play the next. After the last one, we open Practice."
                    : nextAfterWatch
                      ? "When you’re done, continue to Practice."
                      : "Mark watch done when finished."}
                </p>
              )}
              {error ? (
                <p className="mb-3 text-sm font-semibold text-red-600">{error}</p>
              ) : null}
              <button
                type="button"
                onClick={() => void handleWatchDone()}
                disabled={watchDone || completing}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold",
                  watchDone
                    ? "cursor-default bg-emerald-100 text-emerald-800"
                    : "bg-navy text-white hover:bg-navy/90 disabled:opacity-60",
                )}
              >
                {completing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : watchDone ? (
                  <Check className="size-4" strokeWidth={2.5} />
                ) : null}
                {watchDone
                  ? "Continuing…"
                  : nextAfterWatch
                    ? "Mark watch done · Continue to Practice"
                    : "Mark watch done"}
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {(fromPlan && (focus === "practice" || focus === "submit")) ||
      (!fromPlan && practicePrompt) ? (
        <section className="space-y-3">
          {fromPlan ? (
            <h2 className="font-display text-lg font-bold text-navy">
              {focus === "submit" ? "Submit" : "Practice"}
            </h2>
          ) : (
            <h2 className="font-display text-lg font-bold text-navy">Instructions</h2>
          )}
          <div className="rounded-2xl border border-border-soft bg-white px-5 py-5">
            {practicePrompt ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
                {practicePrompt}
              </p>
            ) : fromPlan ? (
              <p className="text-sm text-muted">
                {focus === "submit"
                  ? "Confirm today’s submit for this set when you’re ready."
                  : "Work through today’s practice for this set."}
              </p>
            ) : null}
            {fromPlan && focus === "submit" ? (
              <>
                <p className="mt-3 text-sm text-muted">
                  Confirm today’s submit for this set. You can reopen the exercise
                  if you need to change answers.
                </p>
                {progressMsg ? (
                  <p className="mt-2 text-sm font-semibold text-emerald-700">
                    {progressMsg}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSubmitStepDone}
                    disabled={completing}
                    className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-60"
                  >
                    {completing ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    Mark submit done
                  </button>
                  <Link
                    href={practiceCtaHref}
                    className="inline-flex rounded-full border border-border-soft bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-ink/[0.02]"
                  >
                    Open exercise
                  </Link>
                </div>
              </>
            ) : fromPlan ? (
              <>
                <p className="mt-3 text-sm text-muted">
                  Work through today’s practice for this set.
                </p>
                <Link
                  href={practiceCtaHref}
                  className="mt-4 inline-flex rounded-full bg-cyan px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-sky-hover"
                >
                  Start practice
                </Link>
              </>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
