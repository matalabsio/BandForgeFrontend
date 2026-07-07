import type { ModuleReviewQuestion } from "@/lib/module-review-types";

export type SectionQuestionStatus = "correct" | "incorrect" | "skipped";

export type SectionReviewQuestion = ModuleReviewQuestion & {
  status: SectionQuestionStatus;
  groupLabel?: string;
};

export function questionStatus(q: ModuleReviewQuestion): SectionQuestionStatus {
  const answer = q.user_answer?.trim() ?? "";
  if (!answer) return "skipped";
  return q.is_correct ? "correct" : "incorrect";
}

export function flattenModuleQuestions(
  groups: { label: string; questions: ModuleReviewQuestion[] }[],
): SectionReviewQuestion[] {
  const out: SectionReviewQuestion[] = [];
  for (const group of groups) {
    for (const q of group.questions) {
      out.push({ ...q, status: questionStatus(q), groupLabel: group.label });
    }
  }
  return out.sort((a, b) => a.question_number - b.question_number);
}

export function formatRecordedDuration(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return "—";
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
