import type { ListeningPart } from "@/modules/listening/types";

export function isFormCompletionPart(part: ListeningPart): boolean {
  return (
    part.questions.length > 0 &&
    part.questions.every((q) => q.question_type.toLowerCase() === "form_completion")
  );
}
