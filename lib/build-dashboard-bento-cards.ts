import type {
  MagicBentoCardData,
  MagicBentoHubBar,
  MagicBentoSkillBar,
} from "@/components/bandforge/dashboard/magic-bento-types";
import type { SkillBands } from "@/lib/diagnostic-performance";
import {
  localIsoToday,
  presentWeeklyFocusHeadline,
  weekFocusBars,
} from "@/lib/focus-week-progress";
import type {
  LearningProfile,
  LearningStudyPlan,
  SkillHubProgress,
} from "@/lib/learning-types";
import type { ExamTimeline } from "@/lib/dashboard-plan-math";
import type { DashboardStartNow } from "@/lib/plan-start-task";

const SKILL_ORDER = ["listening", "reading", "writing", "speaking"] as const;
const SKILL_LABEL: Record<(typeof SKILL_ORDER)[number], string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

/** Server-safe local calendar date (avoids importing client-only plan-step-completion). */
function localIsoTodayLegacy(date: Date = new Date()): string {
  return localIsoToday(date);
}

type BandGapInput = {
  currentBand: number | null;
  gap: number;
  scoredCount: number;
  isPartial: boolean;
  targetBand: number;
  bands: SkillBands;
};

/** Light card surface — BandForge dashboard paper */
const CARD_BG = "#ffffff";

function skillBars(bands: SkillBands): MagicBentoSkillBar[] {
  return SKILL_ORDER.map((key) => {
    const value = bands[key];
    const pct =
      value != null && value > 0
        ? Math.min(100, Math.round((value / 9) * 100))
        : 0;
    return {
      key,
      label: SKILL_LABEL[key],
      value,
      pct,
    };
  });
}

function weakestSkillLabel(bands: SkillBands): string | null {
  let weakest: { key: (typeof SKILL_ORDER)[number]; band: number } | null =
    null;
  for (const key of SKILL_ORDER) {
    const band = bands[key];
    if (band == null || band <= 0) continue;
    if (!weakest || band < weakest.band) {
      weakest = { key, band };
    }
  }
  if (!weakest) return null;
  return `${SKILL_LABEL[weakest.key]} · ${weakest.band.toFixed(1)}`;
}

function formatExamDate(examDate: string | null): string | null {
  if (!examDate) return null;
  const parsed = new Date(`${examDate.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function hubBars(
  hubProgress: Record<string, SkillHubProgress> | undefined,
): { bars: MagicBentoHubBar[]; completed: number; total: number; href: string } {
  const bars: MagicBentoHubBar[] = SKILL_ORDER.map((key) => {
    const row = hubProgress?.[key];
    const completed = row?.completed_count ?? 0;
    const total = row?.total_count ?? 12;
    return {
      key,
      label: SKILL_LABEL[key],
      pct: total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0,
      unlocked: row?.mock_unlocked ?? false,
    };
  });
  const completed = bars.reduce((n, b, i) => {
    const row = hubProgress?.[SKILL_ORDER[i]];
    return n + (row?.completed_count ?? 0);
  }, 0);
  const total = SKILL_ORDER.reduce(
    (n, key) => n + (hubProgress?.[key]?.total_count ?? 12),
    0,
  );
  const firstUnlocked = SKILL_ORDER.find(
    (key) => hubProgress?.[key]?.mock_unlocked,
  );
  return {
    bars,
    completed,
    total,
    href: firstUnlocked ? `/practice/${firstUnlocked}` : "/study-plan",
  };
}

function progressExamMeta(examTimeline: ExamTimeline): {
  examLabel: string;
  metaLabel: string;
} {
  const examLabel = formatExamDate(examTimeline.examDate);
  const remaining = examTimeline.daysRemaining;

  if (remaining != null && remaining > 0 && examLabel) {
    return {
      examLabel: `Exam · ${examLabel}`,
      metaLabel: remaining === 1 ? "1 day left" : `${remaining} days left`,
    };
  }
  if (remaining === 0 && examTimeline.examDate) {
    const passed = examTimeline.examDate < localIsoTodayLegacy();
    return {
      examLabel: examLabel ? `Exam · ${examLabel}` : "Exam date",
      metaLabel: passed ? "Update date" : "Exam day",
    };
  }
  if (examLabel) {
    return {
      examLabel: `Exam · ${examLabel}`,
      metaLabel: "View date",
    };
  }
  return {
    examLabel: "No exam date",
    metaLabel: "Add date",
  };
}

function todayTaskProgress(
  tasks: LearningProfile["todays_tasks"],
): number {
  const actionable = tasks.filter((t) => t.status !== "skipped");
  if (actionable.length === 0) return 0;
  const done = actionable.filter((t) => t.status === "done").length;
  return Math.round((done / actionable.length) * 100);
}

export type BuildDashboardBentoCardsInput = {
  learning: LearningProfile;
  startNow: DashboardStartNow | null;
  bandGap: BandGapInput;
  examTimeline: ExamTimeline;
  overallPlanPct: number;
};

export type DashboardFocusRecomputeInput = {
  studyPlan: LearningStudyPlan;
  weeklyFocus: string;
  skillDifficulty: Record<string, string> | null | undefined;
  weeklyHubCompletions: LearningProfile["weekly_hub_completions"];
};

/** Recompute Focus card visual/description after client plan cache merge. */
export function recomputeFocusBentoCard(
  card: MagicBentoCardData,
  input: DashboardFocusRecomputeInput,
): MagicBentoCardData {
  if (card.label !== "Focus" || card.visual?.kind !== "week") return card;

  const focus = presentWeeklyFocusHeadline(
    input.weeklyFocus,
    input.skillDifficulty ?? null,
  );
  const weekProg = weekFocusBars(
    input.studyPlan,
    focus.skillKeys,
    input.weeklyHubCompletions ?? [],
  );

  return {
    ...card,
    title: focus.headline,
    description:
      weekProg.total > 0
        ? `${weekProg.done} of ${weekProg.total} tasks this week`
        : focus.support,
    visual: {
      kind: "week",
      bars: weekProg.bars,
      done: weekProg.done,
      total: weekProg.total,
      pct: weekProg.pct,
    },
  };
}

/** Build the 6 MagicBento cards for the personalized dashboard. */
export function buildDashboardBentoCards({
  learning,
  startNow,
  bandGap,
  examTimeline,
}: BuildDashboardBentoCardsInput): MagicBentoCardData[] {
  const studyPlan = learning.study_plan;
  const skillDifficulty =
    learning.skill_difficulty ?? studyPlan.skill_difficulty ?? null;

  const focus = presentWeeklyFocusHeadline(
    studyPlan.weekly_focus,
    skillDifficulty,
  );
  const weekProg = weekFocusBars(
    studyPlan,
    focus.skillKeys,
    learning.weekly_hub_completions ?? [],
  );

  const gapDesc =
    bandGap.scoredCount === 0
      ? "Take a mock to see your band"
      : bandGap.gap > 0 && bandGap.currentBand != null
        ? `${bandGap.gap.toFixed(1)} bands left to target`
        : "You’re on track for your target";

  const gapPct =
    bandGap.currentBand != null && bandGap.targetBand > 0
      ? Math.min(
          100,
          Math.round((bandGap.currentBand / bandGap.targetBand) * 100),
        )
      : 0;

  const weak = weakestSkillLabel(bandGap.bands);
  const skillTitle = weak ?? "No scores yet";
  const skillDesc = bandGap.isPartial
    ? `${bandGap.scoredCount} of 4 skills scored`
    : bandGap.scoredCount === 0
      ? "Complete a mock to unlock skill bands"
      : "See your full skill breakdown";

  const hubs = hubBars(learning.hub_progress);
  const examMeta = progressExamMeta(examTimeline);
  const todayPct = todayTaskProgress(learning.todays_tasks);

  const writingHub = learning.hub_progress?.writing;
  const writingCompleted = writingHub?.completed_count ?? 0;
  const writingTotal = writingHub?.total_count ?? 12;
  const writingPct =
    writingTotal > 0
      ? Math.min(100, Math.round((writingCompleted / writingTotal) * 100))
      : 0;
  const writingMockUnlocked = writingHub?.mock_unlocked ?? false;
  const writingTitle =
    writingCompleted > 0
      ? `${writingCompleted} of ${writingTotal} hubs`
      : "Writing hubs";

  const startCard: MagicBentoCardData = startNow
    ? {
        label: "Practice",
        title: "Start today’s practice",
        description: "",
        color: CARD_BG,
        href: startNow.href,
        ctaLabel: "Start now",
        icon: "practice",
        visual: { kind: "cta", progress: todayPct, ready: true },
      }
    : {
        label: "Practice",
        title: "You’re done for today",
        description: "",
        color: CARD_BG,
        href: "/study-plan/today",
        ctaLabel: "View plan",
        icon: "practice",
        visual: { kind: "cta", progress: 100, ready: false },
      };

  const progressCard: MagicBentoCardData = {
    label: "Progress",
    title: "Band progress",
    description: gapDesc,
    color: CARD_BG,
    icon: "progress",
    examLabel: examMeta.examLabel,
    metaLabel: examMeta.metaLabel,
    visual: {
      kind: "gap",
      current: bandGap.currentBand,
      target: bandGap.targetBand,
      pct: gapPct,
      gap: bandGap.gap,
    },
  };

  const writingCard: MagicBentoCardData = {
    label: "Writing",
    title: writingTitle,
    description: writingMockUnlocked
      ? "Mock unlocked — keep practising"
      : "Task 1 and Task 2 practice",
    color: CARD_BG,
    icon: "writing",
    href: "/practice/writing",
    ctaLabel: "Open Writing",
    visual: {
      kind: "writing",
      completed: writingCompleted,
      total: writingTotal,
      pct: writingPct,
      mockUnlocked: writingMockUnlocked,
    },
  };

  return [
    startCard,
    writingCard,
    {
      label: "Skills",
      title: skillTitle,
      description: skillDesc,
      color: CARD_BG,
      icon: "skills",
      visual: {
        kind: "skills",
        bars: skillBars(bandGap.bands),
        scoredCount: bandGap.scoredCount,
      },
    },
    {
      label: "Focus",
      title: focus.headline,
      description:
        weekProg.total > 0
          ? `${weekProg.done} of ${weekProg.total} tasks this week`
          : focus.support,
      color: CARD_BG,
      icon: "focus",
      visual: {
        kind: "week",
        bars: weekProg.bars,
        done: weekProg.done,
        total: weekProg.total,
        pct: weekProg.pct,
      },
    },
    {
      label: "Hubs",
      title:
        hubs.completed > 0
          ? `${hubs.completed} of ${hubs.total} done`
          : "Skill hubs",
      description:
        hubs.bars.some((b) => b.unlocked)
          ? "Mocks unlocked — keep going"
          : "Finish hubs to unlock mocks",
      color: CARD_BG,
      icon: "hubs",
      href: "/practice",
      ctaLabel: "Open hubs",
      visual: {
        kind: "hubs",
        bars: hubs.bars,
        completed: hubs.completed,
        total: hubs.total,
      },
    },
    progressCard,
  ];
}
