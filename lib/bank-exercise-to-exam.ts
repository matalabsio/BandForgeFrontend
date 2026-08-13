import { listeningOptionLabelFromValue } from "@/modules/listening/lib/listening-option-value";
import { isChooseTwoInstruction } from "@/modules/listening/lib/listening-question-groups";
import type {
  ListeningOption,
  ListeningPart,
  ListeningQuestion,
} from "@/modules/listening/types";
import type { ReadingQuestion } from "@/modules/reading/types";
import type { BankExerciseStart } from "@/lib/practice-api";
import type { SpeakingQuestionManifest } from "@/modules/speaking/types";

const UI_TO_SLUG: Record<string, string> = {
  "Form completion": "form_completion",
  "Note completion": "note_completion",
  "Sentence completion": "sentence_completion",
  "MCQ — single answer": "mcq",
  "MCQ — choose TWO": "mcq",
  Matching: "matching",
  "Table completion": "table_completion",
  "Map/plan/diagram labelling": "map_labeling",
  "Flow-chart completion": "flowchart_completion",
  "Summary completion": "summary_completion_box",
  "True / False / Not Given": "tfng",
  "Yes / No / Not Given": "tfng",
};

function toSlug(type: string): string {
  const trimmed = type.trim();
  if (UI_TO_SLUG[trimmed]) return UI_TO_SLUG[trimmed];
  const lower = trimmed.toLowerCase();
  if (lower.includes("choose") && lower.includes("two")) return "mcq";
  if (lower.includes("mcq") || lower.includes("multiple choice")) return "mcq";
  return lower.replace(/[\s—–-]+/g, "_");
}

function parseOptions(raw: unknown): ListeningOption[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return raw.map((item, i) => {
    if (item && typeof item === "object") {
      const row = item as { label?: unknown; text?: unknown };
      const label = String(row.label ?? String.fromCharCode(65 + i)).trim();
      const text = String(row.text ?? label).trim();
      return { label: label || String.fromCharCode(65 + i), text: text || label };
    }
    const text = String(item ?? "").trim();
    return { label: String.fromCharCode(65 + i), text };
  });
}

function optionsKey(options: ListeningOption[] | null): string {
  if (!options?.length) return "";
  return options.map((o) => `${o.label}:${o.text}`).join("|");
}

function looksLikeChooseTwo(
  a: { slug: string; prompt: string; options: ListeningOption[] | null },
  b: { slug: string; prompt: string; options: ListeningOption[] | null },
): boolean {
  if (a.slug !== "mcq" || b.slug !== "mcq") return false;
  if (a.prompt.trim() !== b.prompt.trim()) return false;
  return optionsKey(a.options) === optionsKey(b.options) && Boolean(a.options?.length);
}

export function flattenExamAnswers(
  answers: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [id, value] of Object.entries(answers)) {
    out[id] = listeningOptionLabelFromValue(value);
  }
  return out;
}

export function bankExerciseToListeningPart(
  exercise: BankExerciseStart,
): ListeningPart {
  const section = exercise.section;
  const partNum = Math.min(4, Math.max(1, section.part || 1)) as 1 | 2 | 3 | 4;
  const audioUrl = section.audio_url?.trim() || null;
  const mapped = section.questions.map((q) => {
    const slug = toSlug(q.question_type);
    return {
      id: q.id,
      slug,
      prompt: q.prompt,
      options: parseOptions(q.options),
      instructions: (q.instructions || section.instructions || "").trim() || null,
      question_number: q.question_number,
    };
  });

  const questions: ListeningQuestion[] = mapped.map((q, i) => {
    let instructions = q.instructions;
    const prev = mapped[i - 1];
    const next = mapped[i + 1];
    const pairWithNext = next && looksLikeChooseTwo(q, next);
    const pairWithPrev = prev && looksLikeChooseTwo(prev, q);
    if ((pairWithNext || pairWithPrev) && !isChooseTwoInstruction(instructions)) {
      instructions = "Choose TWO letters, A-E.";
    }
    return {
      id: q.id,
      part: partNum,
      question_number: q.question_number,
      display_number: q.question_number,
      question_type: q.slug,
      prompt: q.prompt,
      instructions,
      options: q.options,
      audio_url: audioUrl,
    };
  });

  const common =
    questions.find((q) => q.question_type)?.question_type ?? "mixed";

  return {
    part: partNum,
    title: section.title?.trim() || `Part ${partNum}`,
    context: section.instructions?.trim() || "Listening practice",
    common_question_type: common,
    questions,
  };
}

export function bankExerciseToReadingQuestions(
  exercise: BankExerciseStart,
): ReadingQuestion[] {
  return exercise.section.questions.map((q) => ({
    id: q.id,
    question_number: q.question_number,
    display_number: q.question_number,
    question_type: toSlug(q.question_type),
    prompt: q.prompt,
    options: parseOptions(q.options),
  }));
}

export function bankExerciseWritingPrompt(exercise: BankExerciseStart): {
  title: string;
  prompt: string;
  imageUrl: string | null;
  part: 1 | 2;
} {
  const section = exercise.section;
  const first = section.questions[0];
  const prompt =
    (section.passage_text || "").trim() ||
    (first?.prompt || "").trim() ||
    "Write your response below.";
  const part = (section.part >= 2 ? 2 : 1) as 1 | 2;
  return {
    title: section.title?.trim() || `Writing Task ${part}`,
    prompt,
    imageUrl: section.image_url?.trim() || null,
    part,
  };
}

function speakingPart(raw: number): 1 | 2 | 3 {
  if (raw === 2) return 2;
  if (raw === 3) return 3;
  return 1;
}

function optionRecord(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Record<string, unknown>;
}

function optionNumber(opts: Record<string, unknown>, key: string): number | undefined {
  const n = Number(opts[key]);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** Bank hub questions → same manifest shape as mock /test speaking. */
export function bankExerciseToSpeakingManifest(
  exercise: BankExerciseStart,
): SpeakingQuestionManifest[] {
  const fallbackPart = speakingPart(exercise.part);
  return exercise.section.questions.map((q, i) => {
    const opts = optionRecord(q.options);
    const kind =
      String(opts.kind || "") === "part2_intro" || fallbackPart === 2
        ? ("part2_intro" as const)
        : ("question" as const);
    const part = kind === "part2_intro" ? 2 : fallbackPart;
    const recordSec =
      optionNumber(opts, "record_sec") ?? optionNumber(opts, "speak_time_sec");
    return {
      id: q.id,
      part,
      questionNumber: q.question_number || i + 1,
      sequence: i + 1,
      prompt: q.prompt.trim() || "(prompt)",
      kind,
      videoUrl: q.video_url?.trim() || undefined,
      prepSec: optionNumber(opts, "prep_sec"),
      recordSec,
      maxRecordSec: recordSec,
    };
  });
}
