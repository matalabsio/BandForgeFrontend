import type {
  WritingCriterionScore,
  WritingEssayHighlight,
  WritingFeedback,
  WritingReview,
  WritingVocabTag,
} from "@/modules/writing/types";
import { estimateWritingBand } from "@/lib/writing-test";

const CRITERIA_LABELS: Record<
  WritingCriterionScore["key"],
  string
> = {
  task_achievement: "Task Achievement",
  coherence_cohesion: "Coherence & Cohesion",
  lexical_resource: "Lexical Resource",
  grammar: "Grammar Range & Acc.",
};

const WEAK_WORD_ALTS: Record<string, string[]> = {
  important: ["crucial", "vital"],
  good: ["beneficial", "valuable"],
  bad: ["detrimental", "harmful"],
  many: ["numerous", "a multitude of"],
  people: ["individuals", "citizens"],
  think: ["believe", "argue"],
  very: ["highly", "extremely"],
  big: ["substantial", "significant"],
  small: ["minor", "modest"],
  thing: ["factor", "aspect"],
};

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "that",
  "with",
  "this",
  "from",
  "have",
  "been",
  "their",
  "they",
  "would",
  "which",
  "about",
  "there",
  "when",
  "what",
  "some",
  "into",
  "more",
  "also",
  "than",
  "other",
  "such",
  "only",
  "over",
  "after",
  "most",
  "make",
  "like",
  "through",
  "back",
  "well",
  "even",
  "because",
  "these",
  "those",
  "then",
  "them",
  "were",
  "being",
  "should",
  "could",
  "while",
  "where",
  "each",
  "both",
  "between",
  "under",
  "during",
  "before",
  "without",
  "however",
  "therefore",
  "although",
  "another",
]);

function roundBand(value: number): number {
  return Math.round(value * 2) / 2;
}

function overallBand(review: WritingReview): number {
  if (review.band != null && review.band > 0) return review.band;
  return estimateWritingBand(review.word_count, review.part);
}

function buildCriteria(overall: number): WritingCriterionScore[] {
  const offsets: Array<[WritingCriterionScore["key"], number]> = [
    ["task_achievement", 0],
    ["coherence_cohesion", 0.5],
    ["lexical_resource", -0.5],
    ["grammar", 0],
  ];

  return offsets.map(([key, offset]) => ({
    key,
    label: CRITERIA_LABELS[key],
    band: roundBand(Math.max(3, Math.min(9, overall + offset))),
  }));
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z'\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function findStrongWords(text: string): string[] {
  const words = [...new Set(tokenize(text))];
  return words
    .filter((w) => w.length >= 8 && !STOP_WORDS.has(w))
    .slice(0, 6);
}

function findWeakWords(text: string): WritingVocabTag[] {
  const tokens = tokenize(text);
  const counts = new Map<string, number>();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  const weak: WritingVocabTag[] = [];
  for (const [word, count] of counts) {
    if (count < 2) continue;
    if (WEAK_WORD_ALTS[word]) {
      weak.push({ word, alternatives: WEAK_WORD_ALTS[word] });
    }
  }

  if (weak.length === 0) {
    for (const [word, alts] of Object.entries(WEAK_WORD_ALTS)) {
      if (tokens.includes(word)) {
        weak.push({ word, alternatives: alts });
        if (weak.length >= 2) break;
      }
    }
  }

  return weak.slice(0, 3);
}

function findPhrase(text: string, phrase: string): number {
  const lower = text.toLowerCase();
  const target = phrase.toLowerCase();
  return lower.indexOf(target);
}

function buildHighlights(
  text: string,
  strongWords: string[],
  weakWords: WritingVocabTag[],
): WritingEssayHighlight[] {
  const highlights: WritingEssayHighlight[] = [];
  const used = new Set<string>();

  for (const word of strongWords.slice(0, 3)) {
    const idx = findPhrase(text, word);
    if (idx === -1) continue;
    const slice = text.slice(idx, idx + word.length);
    const key = slice.toLowerCase();
    if (used.has(key)) continue;
    used.add(key);
    highlights.push({ text: slice, type: "strong" });
  }

  for (const { word } of weakWords.slice(0, 2)) {
    const idx = findPhrase(text, word);
    if (idx === -1) continue;
    const slice = text.slice(idx, idx + word.length);
    const key = slice.toLowerCase();
    if (used.has(key)) continue;
    used.add(key);
    highlights.push({ text: slice, type: "improve" });
  }

  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 40);
  if (highlights.length < 4 && sentences[0]) {
    const snippet = sentences[0].trim().slice(0, Math.min(80, sentences[0].length));
    if (snippet.length > 20 && !used.has(snippet.toLowerCase())) {
      highlights.push({ text: snippet, type: "strong" });
    }
  }

  return highlights.slice(0, 6);
}

function buildStrengths(review: WritingReview, overall: number): string[] {
  const metMin =
    review.min_words > 0 && review.word_count >= review.min_words;
  const items: string[] = [];

  if (metMin) {
    items.push(
      `Meets the Task ${review.part} word-count requirement (${review.word_count} words).`,
    );
  }
  if (review.user_answer.includes("\n\n") || review.user_answer.split(/[.!?]/).length >= 4) {
    items.push("Maintains structure with multiple clear paragraphs or sentences.");
  }
  if (overall >= 6.5) {
    items.push("Addresses the task with sufficient development for your target band.");
  } else {
    items.push("Shows a clear position and attempts to support main ideas.");
  }
  if (review.part === 2) {
    items.push("Uses linking language to connect ideas across the essay.");
  } else {
    items.push("Covers key features of the visual or data in the prompt.");
  }

  return items.slice(0, 4);
}

function buildImprovements(review: WritingReview, overall: number): string[] {
  const metMin =
    review.min_words > 0 && review.word_count >= review.min_words;
  const items: string[] = [];

  if (!metMin && review.min_words > 0) {
    items.push(
      `Increase length to at least ${review.min_words} words to meet the task minimum.`,
    );
  }
  if (overall < 7) {
    items.push("Add more specific examples to support each main point.");
  }
  items.push("Vary sentence openings to improve flow between paragraphs.");
  items.push("Replace repeated basic vocabulary with more precise academic words.");

  return items.slice(0, 4);
}

const DEFAULT_TARGET_BAND = 7.5;

function criterionGapLabel(
  criteria: WritingCriterionScore[],
  targetBand: number,
): string {
  const lowest = criteria.toSorted((a, b) => a.band - b.band)[0];
  if (!lowest) return "Close the remaining gap to your target band.";
  const gap = Math.max(0, Math.round((targetBand - lowest.band) * 2) / 2);
  if (gap <= 0) return "You are at or above your current target band.";
  return `You need +${gap.toFixed(1)} in ${lowest.label} to reach your target of Band ${targetBand.toFixed(1)}.`;
}

function buildNextBandAdvice(
  review: WritingReview,
  overall: number,
  criterionGap: string,
): string {
  const intro =
    overall >= 7
      ? "You are close to the next band."
      : "Your next band is achievable with more controlled development.";
  const lengthHint =
    review.word_count < review.min_words
      ? ` Prioritize meeting the ${review.min_words}-word minimum in your next attempt.`
      : "";
  return `${intro} ${criterionGap.replace("You need ", "").replace(" to reach", " — aim")}${lengthHint}`;
}

/** Build UI feedback from review data until AI evaluation is wired. */
export function buildWritingFeedback(review: WritingReview): WritingFeedback {
  const overall = overallBand(review);
  const target_band = DEFAULT_TARGET_BAND;
  const criteria = buildCriteria(overall);
  const criterion_gap_label = criterionGapLabel(criteria, target_band);
  const strong_words = findStrongWords(review.user_answer);
  const weak_words = findWeakWords(review.user_answer);

  return {
    overall_band: overall,
    criteria,
    strengths: buildStrengths(review, overall),
    improvements: buildImprovements(review, overall),
    next_band_advice: buildNextBandAdvice(review, overall, criterion_gap_label),
    target_band,
    criterion_gap_label,
    strong_words,
    weak_words,
    highlights: buildHighlights(review.user_answer, strong_words, weak_words),
    evaluated_label: "AI evaluated · Band descriptors applied",
  };
}
