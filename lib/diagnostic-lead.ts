export const DIAGNOSTIC_LEAD_KEY = "bf-diagnostic-lead";

export type DiagnosticGoalId =
  | "australian_pr"
  | "canada_pr"
  | "uk_visa"
  | "study_abroad"
  | "professional_registration"
  | "other";

export type DiagnosticTestDateOption = "booked" | "1-3_months" | "undecided";

export type DiagnosticNativeLanguage =
  | "telugu"
  | "hindi"
  | "tamil"
  | "bengali"
  | "kannada"
  | "malayalam"
  | "marathi"
  | "english";

export type DiagnosticPurposeId =
  | "immigration"
  | "university"
  | "professional"
  | "general";

export type DiagnosticLead = {
  fullName: string;
  phone: string;
  /** Optional — legacy leads may still have this from localStorage. */
  email?: string;
  goal: DiagnosticGoalId;
  goalLabel: string;
  targetBand: number;
  /** ISO date YYYY-MM-DD — IELTS exam date for plan timeline. */
  examDate: string;
  /** Onboarding step 3 — high-level purpose category. */
  purpose?: DiagnosticPurposeId;
  /** Onboarding step 4 — test date flexibility. */
  testDateOption?: DiagnosticTestDateOption;
  /** Onboarding step 5 — native language for tips. */
  nativeLanguage?: DiagnosticNativeLanguage;
};

export const DIAGNOSTIC_GOAL_OPTIONS: {
  id: DiagnosticGoalId;
  label: string;
  targetBand: number;
}[] = [
  { id: "australian_pr", label: "Australian PR", targetBand: 7.0 },
  { id: "canada_pr", label: "Canadian PR", targetBand: 7.0 },
  { id: "uk_visa", label: "UK Visa", targetBand: 6.5 },
  { id: "study_abroad", label: "Study Abroad", targetBand: 6.5 },
  {
    id: "professional_registration",
    label: "Professional Registration",
    targetBand: 7.0,
  },
  { id: "other", label: "Other", targetBand: 6.5 },
];

const LEGACY_GOAL_IDS: Record<string, DiagnosticGoalId> = {
  uk_study: "uk_visa",
  general: "other",
};

export function migrateGoalId(id: string | undefined): DiagnosticGoalId | undefined {
  if (!id) return undefined;
  if (LEGACY_GOAL_IDS[id]) return LEGACY_GOAL_IDS[id];
  if (DIAGNOSTIC_GOAL_OPTIONS.some((g) => g.id === id)) {
    return id as DiagnosticGoalId;
  }
  return undefined;
}

export function normalizeIndiaPhone(input: string): string {
  return input.replace(/\D/g, "").slice(-10);
}

export function isValidIndiaPhone(phone: string): boolean {
  const digits = normalizeIndiaPhone(phone);
  return digits.length === 10 && /^[6-9]/.test(digits);
}

/** Tomorrow in local time as YYYY-MM-DD (minimum selectable exam date). */
export function minExamDateIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function parseExamDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isValidFutureExamDate(examDate: string): boolean {
  const parsed = parseExamDate(examDate);
  if (!parsed) return false;
  const min = parseExamDate(minExamDateIso());
  if (!min) return false;
  return parsed >= min;
}

/** Calendar days from today until exam (0 on exam day). */
export function daysUntilExam(examDate: string): number {
  const exam = parseExamDate(examDate);
  if (!exam) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((exam.getTime() - today.getTime()) / 86_400_000);
  return Math.max(0, diff);
}

/** Inclusive prep window length for plan preview (prep start through exam). */
export function totalPrepDays(examDate: string): number {
  const remaining = daysUntilExam(examDate);
  return Math.max(1, remaining + 1);
}

export function isLeadComplete(lead: Partial<DiagnosticLead> | null): lead is DiagnosticLead {
  if (!lead?.fullName?.trim() || !lead.goal) return false;
  if (!isValidIndiaPhone(lead.phone ?? "")) return false;
  if (lead.testDateOption && lead.testDateOption !== "booked") {
    return Boolean(lead.examDate);
  }
  return isValidFutureExamDate(lead.examDate ?? "");
}

export const DIAGNOSTIC_PURPOSE_OPTIONS: {
  id: DiagnosticPurposeId;
  label: string;
  subtitle: string;
}[] = [
  { id: "immigration", label: "Immigration / PR", subtitle: "Australia, Canada, UK, NZ" },
  { id: "university", label: "University Admission", subtitle: "Undergraduate or postgraduate" },
  { id: "professional", label: "Professional Registration", subtitle: "Nursing, teaching, engineering" },
  { id: "general", label: "General Improvement", subtitle: "Overall English proficiency" },
];

export const NATIVE_LANGUAGE_OPTIONS: DiagnosticNativeLanguage[] = [
  "telugu", "hindi", "tamil", "bengali", "kannada", "malayalam", "marathi", "english",
];

const PURPOSE_TO_GOAL: Record<DiagnosticPurposeId, DiagnosticGoalId> = {
  immigration: "australian_pr",
  university: "study_abroad",
  professional: "professional_registration",
  general: "other",
};

const PURPOSE_TO_BAND: Record<DiagnosticPurposeId, number> = {
  immigration: 7.0,
  university: 6.5,
  professional: 7.0,
  general: 6.5,
};

export function purposeToGoal(purpose: DiagnosticPurposeId): { goal: DiagnosticGoalId; goalLabel: string } {
  const goalId = PURPOSE_TO_GOAL[purpose];
  const option = DIAGNOSTIC_GOAL_OPTIONS.find((g) => g.id === goalId) ?? DIAGNOSTIC_GOAL_OPTIONS[DIAGNOSTIC_GOAL_OPTIONS.length - 1];
  return { goal: option.id, goalLabel: option.label };
}

export function purposeDefaultBand(purpose: DiagnosticPurposeId): number {
  return PURPOSE_TO_BAND[purpose];
}

/** Generate a fallback exam date for non-booked options. */
export function fallbackExamDate(option: DiagnosticTestDateOption): string {
  const d = new Date();
  if (option === "1-3_months") {
    d.setMonth(d.getMonth() + 2);
  } else {
    d.setMonth(d.getMonth() + 3);
  }
  return d.toISOString().slice(0, 10);
}

function parseStoredLead(): (DiagnosticLead & { goal?: string }) | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DIAGNOSTIC_LEAD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DiagnosticLead & { goal?: string };
    const migratedGoal = migrateGoalId(parsed.goal);
    if (migratedGoal && migratedGoal !== parsed.goal) {
      const goal = goalFromId(migratedGoal);
      parsed.goal = goal.id;
      parsed.goalLabel = goal.label;
      parsed.targetBand = goal.targetBand;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function readDiagnosticLead(): DiagnosticLead | null {
  const parsed = parseStoredLead();
  if (!parsed || !isLeadComplete(parsed)) return null;
  return parsed;
}

/** Goal/purpose even when the stored lead is incomplete (e.g. no exam date). */
export function readDiagnosticLeadLoose(): Partial<DiagnosticLead> | null {
  return parseStoredLead();
}

/** Study Abroad Dream / Migration Dream — for dashboard greeting copy. */
export function ieltsDreamName(
  lead: Partial<DiagnosticLead> | null | undefined,
): string {
  const goal = (lead?.goal ?? "").toLowerCase();
  const purpose = (lead?.purpose ?? "").toLowerCase();
  const label = (lead?.goalLabel ?? "").toLowerCase();
  const blob = `${goal} ${purpose} ${label}`;

  if (
    purpose === "immigration" ||
    goal === "australian_pr" ||
    goal === "canada_pr" ||
    goal === "uk_visa" ||
    /immigrat|migration|\bpr\b|visa/.test(blob)
  ) {
    return "Migration Dream";
  }
  if (
    purpose === "university" ||
    goal === "study_abroad" ||
    /study|university|abroad/.test(blob)
  ) {
    return "Study Abroad Dream";
  }
  if (
    purpose === "professional" ||
    goal === "professional_registration" ||
    /profession|career/.test(blob)
  ) {
    return "Professional Dream";
  }
  return "IELTS Dream";
}

/** Prefer persisted profile fields, then localStorage lead, then generic copy. */
export function ieltsDreamNameFromProfile(opts: {
  purpose?: string | null;
  goal?: string | null;
  lead?: Partial<DiagnosticLead> | null;
}): string {
  if (opts.purpose || opts.goal) {
    return ieltsDreamName({
      purpose: (opts.purpose ?? undefined) as DiagnosticPurposeId | undefined,
      goal: (opts.goal ?? undefined) as DiagnosticGoalId | undefined,
    });
  }
  return ieltsDreamName(opts.lead ?? null);
}

export function saveDiagnosticLead(lead: DiagnosticLead): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DIAGNOSTIC_LEAD_KEY, JSON.stringify(lead));
  } catch {
    /* ignore */
  }
}

export function goalFromId(id: DiagnosticGoalId): (typeof DIAGNOSTIC_GOAL_OPTIONS)[number] {
  return (
    DIAGNOSTIC_GOAL_OPTIONS.find((g) => g.id === id) ??
    DIAGNOSTIC_GOAL_OPTIONS[DIAGNOSTIC_GOAL_OPTIONS.length - 1]
  );
}
