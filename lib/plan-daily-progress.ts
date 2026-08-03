/** Client-side log of today's plan practice outcomes (bands / accuracy). */

export type PlanDayOutcome = {
  skill: "listening" | "reading" | "writing" | "speaking";
  taskType: "watch" | "practice" | "submit";
  /** Estimated band from scored module, if available. */
  band?: number | null;
  /** Correct / total for objective modules. */
  rawScore?: number | null;
  totalQuestions?: number | null;
  /** 0–100 accuracy when raw/total known. */
  accuracyPct?: number | null;
  recordedAt: string;
};

const STORAGE_KEY = "bf-plan-day-outcomes";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

type DayBucket = {
  date: string;
  outcomes: PlanDayOutcome[];
};

function readBucket(): DayBucket {
  if (typeof window === "undefined") {
    return { date: todayKey(), outcomes: [] };
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: todayKey(), outcomes: [] };
    const parsed = JSON.parse(raw) as DayBucket;
    if (!parsed || parsed.date !== todayKey() || !Array.isArray(parsed.outcomes)) {
      return { date: todayKey(), outcomes: [] };
    }
    return parsed;
  } catch {
    return { date: todayKey(), outcomes: [] };
  }
}

function writeBucket(bucket: DayBucket): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(bucket));
  } catch {
    /* ignore quota */
  }
}

export function recordPlanDayOutcome(
  outcome: Omit<PlanDayOutcome, "recordedAt" | "accuracyPct"> & {
    accuracyPct?: number | null;
  },
): void {
  const accuracyPct =
    outcome.accuracyPct ??
    (outcome.rawScore != null &&
    outcome.totalQuestions != null &&
    outcome.totalQuestions > 0
      ? Math.round((outcome.rawScore / outcome.totalQuestions) * 100)
      : null);

  const next: PlanDayOutcome = {
    ...outcome,
    accuracyPct,
    recordedAt: new Date().toISOString(),
  };

  const bucket = readBucket();
  // Keep latest outcome per skill+taskType for today.
  const filtered = bucket.outcomes.filter(
    (o) => !(o.skill === next.skill && o.taskType === next.taskType),
  );
  writeBucket({ date: todayKey(), outcomes: [...filtered, next] });
}

export function readPlanDayOutcomes(): PlanDayOutcome[] {
  return readBucket().outcomes;
}

export function clearPlanDayOutcomes(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
