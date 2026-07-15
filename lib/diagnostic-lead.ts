export const DIAGNOSTIC_LEAD_KEY = "bf-diagnostic-lead";

export type DiagnosticGoalId =
  | "australian_pr"
  | "canada_pr"
  | "uk_visa"
  | "study_abroad"
  | "professional_registration"
  | "other";

export type DiagnosticLead = {
  fullName: string;
  phone: string;
  /** Optional — legacy leads may still have this from localStorage. */
  email?: string;
  goal: DiagnosticGoalId;
  goalLabel: string;
  targetBand: number;
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

export function isLeadComplete(lead: Partial<DiagnosticLead> | null): lead is DiagnosticLead {
  if (!lead?.fullName?.trim() || !lead.goal) return false;
  return isValidIndiaPhone(lead.phone ?? "");
}

export function readDiagnosticLead(): DiagnosticLead | null {
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
    if (!isLeadComplete(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
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
