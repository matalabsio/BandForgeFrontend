import type {
  MagicBentoCardData,
  MagicBentoHubBar,
  MagicBentoSkillBar,
  MagicBentoWeekBar,
} from "@/components/bandforge/dashboard/magic-bento-types";
import type { SkillBands } from "@/lib/diagnostic-performance";
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
const WEEKDAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"] as const;

/** Light card surface — BandForge dashboard paper */
const CARD_BG = "#ffffff";

/** Server-safe local calendar date (avoids importing client-only plan-step-completion). */
function localIsoToday(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

type BandGapInput = {
  currentBand: number | null;
  gap: number;
  scoredCount: number;
  isPartial: boolean;
  targetBand: number;
  bands: SkillBands;
};

function presentWeeklyFocusHeadline(
  weeklyFocus: string | null | undefined,
  skillDifficulty: Record<string, string> | null | undefined,
): { headline: string; support: string; skillKeys: string[] } {
  if (!weeklyFocus?.trim()) {
    return {
      headline: "Stay consistent",
      support: "Your weekly focus unlocks after plan setup.",
      skillKeys: [],
    };
  }

  const raw = weeklyFocus.trim().replace(/^Focus:\s*/i, "").trim();
  const skillKeys = SKILL_ORDER.filter((key) => {
    const label = SKILL_LABEL[key];
    return new RegExp(`\\b${label}\\b`, "i").test(raw);
  });

  const bareSkillList =
    skillKeys.length > 0 &&
    raw
      .replace(/\s*&\s*/g, " ")
      .replace(/,/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .every((token) =>
        SKILL_ORDER.some(
          (k) => SKILL_LABEL[k].toLowerCase() === token.toLowerCase(),
        ),
      );

  let headline = raw;
  if (skillKeys.length === 1) {
    headline = SKILL_LABEL[skillKeys[0]];
  } else if (bareSkillList) {
    headline = skillKeys.map((k) => SKILL_LABEL[k]).join(" & ");
  }

  const hardFocus = skillKeys.filter((k) => skillDifficulty?.[k] === "hard");
  let support = "Today’s work is built around this focus.";
  if (hardFocus.length === 1 && skillKeys.length === 1) {
    support = "Highest priority this week.";
  } else if (hardFocus.length > 0) {
    support = `${hardFocus.map((k) => SKILL_LABEL[k]).join(" & ")} marked hard.`;
  } else if (skillKeys.length === 1) {
    support = "Primary focus this week.";
  }

  return { headline, support, skillKeys: [...skillKeys] };
}

function weekFocusBars(
  plan: LearningStudyPlan | null | undefined,
  focusSkillKeys: string[],
): { bars: MagicBentoWeekBar[]; done: number; total: number } {
  const todayIso = localIsoToday();
  const d = new Date(`${todayIso}T12:00:00`);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  const dates = Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, "0");
    const dd = String(x.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  });

  const byDate = new Map<
    string,
    LearningStudyPlan["weeks"][number]["days"][number]
  >();
  for (const week of plan?.weeks ?? []) {
    for (const dayRow of week.days) {
      byDate.set(dayRow.date, dayRow);
    }
  }

  const skillFilter =
    focusSkillKeys.length > 0
      ? new Set(focusSkillKeys.map((k) => k.toLowerCase()))
      : null;

  let done = 0;
  let total = 0;
  const bars: MagicBentoWeekBar[] = dates.map((date, i) => {
    const tasks = (byDate.get(date)?.tasks ?? []).filter(
      (t) => t.status !== "skipped",
    );
    const filtered = tasks.filter((t) => {
      if (!skillFilter) return true;
      return skillFilter.has((t.module || "").toLowerCase());
    });
    const dayTotal = filtered.length;
    const dayDone = filtered.filter((t) => t.status === "done").length;
    if (date <= todayIso) {
      total += dayTotal;
      done += dayDone;
    }
    return {
      letter: WEEKDAY_LETTERS[i],
      pct: dayTotal > 0 ? Math.round((dayDone / dayTotal) * 100) : 0,
      isToday: date === todayIso,
    };
  });

  return { bars, done, total };
}

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
    const passed = examTimeline.examDate < localIsoToday();
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
  const weekProg = weekFocusBars(studyPlan, focus.skillKeys);

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

  return [
    startCard,
    {
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
    },
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
      visual: {
        kind: "hubs",
        bars: hubs.bars,
        completed: hubs.completed,
        total: hubs.total,
      },
    },
    {
      label: "",
      title: "",
      description: "",
      color: CARD_BG,
      empty: true,
    },
  ];
}
