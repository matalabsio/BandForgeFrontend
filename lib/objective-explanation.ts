/** Client mirror of backend `app.listening.explanations.build_explanation`. */

export function buildObjectiveExplanation(options: {
  prompt: string;
  userAnswer: string | null | undefined;
  correctAnswer: string | null | undefined;
  isCorrect: boolean;
}): string {
  const { prompt, userAnswer, correctAnswer, isCorrect } = options;
  const label = (prompt || "this question").trim();

  if (isCorrect) {
    return `Correct — your answer for "${label}" matches the recording.`;
  }

  if (!(userAnswer ?? "").trim()) {
    return `No answer given. For "${label}", the acceptable answer is: ${correctAnswer || "—"}.`;
  }

  const accepted = (correctAnswer || "—").replace(/\//g, " or ");
  return (
    `For "${label}", acceptable answers include: ${accepted}. ` +
    "Check spelling and the two-word limit when you listen again."
  );
}
