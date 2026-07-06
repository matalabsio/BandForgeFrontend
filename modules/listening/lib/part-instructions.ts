import type { ListeningPart } from "@/modules/listening/types";

const BOX_CHARS = /[╔╠╚║═╗╝╣╦╩┌┐└┘│─]/;

/** Strip ASCII form templates and notes/form meta markers; keep IELTS instruction lines only. */
export function sanitizeInstructionText(text: string | null | undefined): string | null {
  if (!text?.trim()) return null;
  const lines: string[] = [];
  for (const raw of text.split("\n")) {
    if (BOX_CHARS.test(raw)) break;
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("@@notes_") || line.startsWith("@@form_title@@")) break;
    if (
      lines.length === 0 &&
      line.toUpperCase().includes("FORM") &&
      !/^(complete|write|questions|choose)/i.test(line)
    ) {
      continue;
    }
    lines.push(line);
  }
  return lines.length > 0 ? lines.join("\n") : null;
}

export function sortedPartQuestions(part: ListeningPart) {
  return part.questions.toSorted((a, b) => a.question_number - b.question_number);
}

export function groupInstruction(part: ListeningPart): string | null {
  const withInstructions = part.questions.find((q) => q.instructions?.trim());
  return sanitizeInstructionText(withInstructions?.instructions);
}

export function instructionForQuestion(
  part: ListeningPart,
  question: ListeningPart["questions"][number],
): string | null {
  const fromQuestion = sanitizeInstructionText(question.instructions);
  if (fromQuestion) return fromQuestion;
  if (question.question_type.toLowerCase() === "matching") {
    const anchor = sortedPartQuestions(part).find(
      (q) => q.question_type.toLowerCase() === "matching" && q.instructions?.trim(),
    );
    return sanitizeInstructionText(anchor?.instructions);
  }
  return null;
}

export function formatQuestionTypeLabel(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
