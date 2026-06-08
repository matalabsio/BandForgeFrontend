import { isFormCompletionPart } from "@/modules/listening/lib/form-completion";
import { hasInlineBlank } from "@/modules/listening/lib/inline-blank";
import { sanitizeInstructionText } from "@/modules/listening/lib/part-instructions";
import { GREENFIELD_LISTENING_STAGES } from "@/modules/listening/listening-test-stages";
import type { ListeningOption, ListeningPart, ListeningQuestion } from "@/modules/listening/types";

export type ListeningQuestionBlock =
  | { kind: "form"; questions: ListeningQuestion[] }
  | {
      kind: "choose_two";
      questions: [ListeningQuestion, ListeningQuestion];
      instruction: string | null;
      stem: string;
      options: ListeningOption[];
    }
  | {
      kind: "matching";
      questions: ListeningQuestion[];
      instruction: string | null;
      options: ListeningOption[];
    }
  | {
      kind: "sentence_completion";
      questions: ListeningQuestion[];
      instruction: string | null;
    }
  | { kind: "mcq_single"; question: ListeningQuestion };

function qNum(q: ListeningQuestion): number {
  return q.display_number ?? q.question_number;
}

function sortedQuestions(part: ListeningPart): ListeningQuestion[] {
  return part.questions.toSorted((a, b) => qNum(a) - qNum(b));
}

function optionsKey(options: ListeningOption[] | null | undefined): string {
  if (!options?.length) return "";
  return options.map((o) => `${o.label}:${o.text}`).join("|");
}

export function isChooseTwoInstruction(text: string | null | undefined): boolean {
  if (!text) return false;
  return /choose\s+two/i.test(text);
}

function questionInstruction(q: ListeningQuestion): string | null {
  return sanitizeInstructionText(q.instructions);
}

export function isChooseTwoPair(a: ListeningQuestion, b: ListeningQuestion): boolean {
  if (a.question_type.toLowerCase() !== "mcq" || b.question_type.toLowerCase() !== "mcq") {
    return false;
  }
  if (a.prompt.trim() !== b.prompt.trim()) return false;
  if (optionsKey(a.options) !== optionsKey(b.options)) return false;
  const instr =
    questionInstruction(a) ?? questionInstruction(b) ?? "";
  return isChooseTwoInstruction(instr);
}

function isGapFillType(type: string): boolean {
  const t = type.toLowerCase();
  return t === "sentence_completion" || t === "note_completion";
}

function canJoinSentenceGroup(q: ListeningQuestion): boolean {
  const t = q.question_type.toLowerCase();
  if (!isGapFillType(t)) return false;
  return hasInlineBlank(q.prompt) || t === "sentence_completion" || t === "note_completion";
}

function blockInstruction(questions: ListeningQuestion[]): string | null {
  for (const q of questions) {
    const instr = questionInstruction(q);
    if (instr) return instr;
  }
  return null;
}

function matchingOptions(questions: ListeningQuestion[]): ListeningOption[] {
  const anchor = questions.find((q) => q.options?.length) ?? questions[0];
  return anchor?.options ?? [];
}

function instructionFromBlocks(part: ListeningPart): string | null {
  const blocks = groupListeningQuestions(part);
  for (const block of blocks) {
    if (block.kind === "choose_two") continue;
    if (block.kind === "form") {
      const instr = blockInstruction(block.questions);
      if (instr) return instr;
    }
    if (block.kind === "matching" || block.kind === "sentence_completion") {
      if (block.instruction) return block.instruction;
    }
    if (block.kind === "mcq_single") {
      const instr = questionInstruction(block.question);
      if (instr && !isChooseTwoInstruction(instr)) return instr;
    }
  }
  return null;
}

/** Part-level instruction for the audio panel (avoid Q1-only "Choose TWO" for the whole part). */
export function audioPanelInstruction(
  part: ListeningPart,
  mockSlug?: string,
): string | null {
  const fromDb = instructionFromBlocks(part);
  if (fromDb) return fromDb;

  if (mockSlug === "m01" || mockSlug === undefined) {
    const stage = GREENFIELD_LISTENING_STAGES.find((s) => s.part === part.part);
    if (stage?.description) return stage.description;
  }
  return null;
}

export function groupListeningQuestions(part: ListeningPart): ListeningQuestionBlock[] {
  if (isFormCompletionPart(part)) {
    return [{ kind: "form", questions: sortedQuestions(part) }];
  }

  const sorted = sortedQuestions(part);
  const blocks: ListeningQuestionBlock[] = [];
  let i = 0;

  while (i < sorted.length) {
    const q = sorted[i];
    const next = sorted[i + 1];

    if (next && isChooseTwoPair(q, next)) {
      blocks.push({
        kind: "choose_two",
        questions: [q, next],
        instruction: blockInstruction([q, next]),
        stem: q.prompt,
        options: q.options ?? [],
      });
      i += 2;
      continue;
    }

    if (q.question_type.toLowerCase() === "matching") {
      const group: ListeningQuestion[] = [q];
      let j = i + 1;
      const key = optionsKey(q.options);
      while (j < sorted.length && sorted[j].question_type.toLowerCase() === "matching") {
        if (optionsKey(sorted[j].options) !== key && key) break;
        group.push(sorted[j]);
        j++;
      }
      blocks.push({
        kind: "matching",
        questions: group,
        instruction: blockInstruction(group),
        options: matchingOptions(group),
      });
      i = j;
      continue;
    }

    if (canJoinSentenceGroup(q)) {
      const group: ListeningQuestion[] = [q];
      let j = i + 1;
      while (j < sorted.length && canJoinSentenceGroup(sorted[j])) {
        group.push(sorted[j]);
        j++;
      }
      blocks.push({
        kind: "sentence_completion",
        questions: group,
        instruction: blockInstruction(group),
      });
      i = j;
      continue;
    }

    if (q.question_type.toLowerCase() === "mcq" && q.options?.length) {
      blocks.push({ kind: "mcq_single", question: q });
      i += 1;
      continue;
    }

    blocks.push({ kind: "mcq_single", question: q });
    i += 1;
  }

  return blocks;
}

export function blockQuestionRange(questions: ListeningQuestion[]): string {
  if (questions.length === 0) return "Questions";
  const nums = questions.map(qNum);
  const start = Math.min(...nums);
  const end = Math.max(...nums);
  return start === end ? `Question ${start}` : `Questions ${start}–${end}`;
}
