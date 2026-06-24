export const DIAGNOSTIC_LEAD_KEY = "bf-diagnostic-lead";

export type DiagnosticGoalId =
  | "australian_pr"
  | "uk_study"
  | "canada_pr"
  | "general";

export type DiagnosticLead = {
  fullName: string;
  phone: string;
  email: string;
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
  { id: "uk_study", label: "UK university study", targetBand: 6.5 },
  { id: "canada_pr", label: "Canada PR", targetBand: 7.0 },
  { id: "general", label: "General improvement", targetBand: 6.5 },
];

export function normalizeIndiaPhone(input: string): string {
  return input.replace(/\D/g, "").slice(-10);
}

export function isValidIndiaPhone(phone: string): boolean {
  const digits = normalizeIndiaPhone(phone);
  return digits.length === 10 && /^[6-9]/.test(digits);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isLeadComplete(lead: Partial<DiagnosticLead> | null): lead is DiagnosticLead {
  if (!lead?.fullName?.trim() || !lead.goal) return false;
  if (!isValidIndiaPhone(lead.phone ?? "")) return false;
  return isValidEmail(lead.email ?? "");
}

export function readDiagnosticLead(): DiagnosticLead | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DIAGNOSTIC_LEAD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DiagnosticLead;
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
  return DIAGNOSTIC_GOAL_OPTIONS.find((g) => g.id === id) ?? DIAGNOSTIC_GOAL_OPTIONS[3];
}
