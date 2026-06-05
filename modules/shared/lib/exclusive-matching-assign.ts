export type ExclusiveAssignResult =
  | { ok: true; next: Record<string, string>; changes: { id: string; value: string }[] }
  | { ok: false; reason: "slot_occupied" | "label_in_use" | "invalid_label" };

export type PlanExclusiveAssignParams = {
  answers: Record<string, string>;
  questions: { id: string }[];
  targetQuestionId: string;
  label: string;
  normalize: (raw: string) => string;
  /** When dragging from a row, pass source question id to allow move. */
  sourceQuestionId?: string | null;
};

function findQuestionIdByLabel(
  answers: Record<string, string>,
  questions: { id: string }[],
  label: string,
  normalize: (raw: string) => string,
  excludeId?: string,
): string | null {
  for (const q of questions) {
    if (excludeId && q.id === excludeId) continue;
    if (normalize(answers[q.id] ?? "") === label) return q.id;
  }
  return null;
}

export function planExclusiveAssign(
  params: PlanExclusiveAssignParams,
): ExclusiveAssignResult {
  const {
    answers,
    questions,
    targetQuestionId,
    label,
    normalize,
    sourceQuestionId = null,
  } = params;

  const normalized = normalize(label);
  if (!normalized) {
    return { ok: false, reason: "invalid_label" };
  }

  const targetCurrent = normalize(answers[targetQuestionId] ?? "");
  if (targetCurrent && targetCurrent !== normalized) {
    return { ok: false, reason: "slot_occupied" };
  }

  if (targetCurrent === normalized) {
    return { ok: true, next: { ...answers }, changes: [] };
  }

  const ownerId = findQuestionIdByLabel(
    answers,
    questions,
    normalized,
    normalize,
    sourceQuestionId ?? undefined,
  );

  if (ownerId && ownerId !== sourceQuestionId) {
    if (!sourceQuestionId) {
      return { ok: false, reason: "label_in_use" };
    }
  }

  const next = { ...answers };
  const changes: { id: string; value: string }[] = [];

  if (sourceQuestionId && normalize(answers[sourceQuestionId] ?? "") === normalized) {
    next[sourceQuestionId] = "";
    changes.push({ id: sourceQuestionId, value: "" });
  } else if (ownerId && ownerId !== targetQuestionId) {
    next[ownerId] = "";
    changes.push({ id: ownerId, value: "" });
  }

  next[targetQuestionId] = normalized;
  changes.push({ id: targetQuestionId, value: normalized });

  return { ok: true, next, changes };
}

export function planExclusiveClear(
  answers: Record<string, string>,
  questionId: string,
): { next: Record<string, string>; changes: { id: string; value: string }[] } {
  if (!answers[questionId]?.trim()) {
    return { next: { ...answers }, changes: [] };
  }
  const next = { ...answers, [questionId]: "" };
  return { next, changes: [{ id: questionId, value: "" }] };
}
