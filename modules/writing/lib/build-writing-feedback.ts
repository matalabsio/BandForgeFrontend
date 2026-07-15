import type {
  GrammarMistake,
  SpellingMistake,
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

function criteriaFromAi(review: WritingReview): WritingCriterionScore[] | null {
  const raw = review.ai_criteria;
  if (!raw || typeof raw !== "object") return null;
  const map: Array<[WritingCriterionScore["key"], string]> = [
    ["task_achievement", "task_achievement"],
    ["coherence_cohesion", "coherence"],
    ["lexical_resource", "lexical_resource"],
    ["grammar", "grammar"],
  ];
  const out: WritingCriterionScore[] = [];
  for (const [key, source] of map) {
    const value = raw[source];
    if (typeof value !== "number") return null;
    out.push({ key, label: CRITERIA_LABELS[key], band: roundBand(value) });
  }
  return out;
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

function buildAiHighlights(
  text: string,
  spellingMistakes: SpellingMistake[],
  grammarMistakes: GrammarMistake[],
): WritingEssayHighlight[] {
  const highlights: WritingEssayHighlight[] = [];
  const used = new Set<string>();

  for (const mistake of spellingMistakes.slice(0, 8)) {
    const idx = findPhrase(text, mistake.original);
    if (idx === -1) continue;
    const slice = text.slice(idx, idx + mistake.original.length);
    const key = `spelling:${slice.toLowerCase()}`;
    if (used.has(key)) continue;
    used.add(key);
    highlights.push({
      text: slice,
      type: "spelling",
      title: "Spelling",
      detail: "Check the spelling of this word.",
      suggestion: mistake.correction || undefined,
    });
  }

  for (const mistake of grammarMistakes.slice(0, 6)) {
    const idx = findPhrase(text, mistake.original);
    if (idx === -1) continue;
    const slice = text.slice(idx, idx + mistake.original.length);
    const key = `grammar:${slice.toLowerCase()}`;
    if (used.has(key)) continue;
    used.add(key);
    highlights.push({
      text: slice,
      type: "grammar",
      title: "Grammar",
      detail: mistake.issue?.trim() || "Adjust the grammar in this phrase.",
      suggestion: mistake.correction || undefined,
    });
  }

  return highlights;
}

function buildAiStrongHighlights(
  text: string,
  spans: { text: string; reason?: string }[] | undefined,
): WritingEssayHighlight[] {
  if (!spans || spans.length === 0) return [];
  const highlights: WritingEssayHighlight[] = [];
  const used = new Set<string>();
  for (const span of spans.slice(0, 4)) {
    const phrase = span.text?.trim();
    if (!phrase) continue;
    const idx = findPhrase(text, phrase);
    if (idx === -1) continue;
    const slice = text.slice(idx, idx + phrase.length);
    const key = `strong:${slice.toLowerCase()}`;
    if (used.has(key)) continue;
    used.add(key);
    highlights.push({
      text: slice,
      type: "strong",
      title: "Strong span",
      detail: span.reason?.trim() || "Clear, effective phrasing.",
    });
  }
  return highlights;
}

function buildVocabHighlights(
  text: string,
  strongWords: string[],
  weakWords: WritingVocabTag[],
): WritingEssayHighlight[] {
  const highlights: WritingEssayHighlight[] = [];
  const used = new Set<string>();

  for (const word of strongWords.slice(0, 4)) {
    const idx = findPhrase(text, word);
    if (idx === -1) continue;
    const slice = text.slice(idx, idx + word.length);
    const key = `strong-word:${slice.toLowerCase()}`;
    if (used.has(key)) continue;
    used.add(key);
    highlights.push({
      text: slice,
      type: "strong",
      title: "Strong vocabulary",
      detail: "Precise or academic word choice.",
    });
  }

  for (const { word, alternatives } of weakWords.slice(0, 4)) {
    const idx = findPhrase(text, word);
    if (idx === -1) continue;
    const slice = text.slice(idx, idx + word.length);
    const key = `weak:${slice.toLowerCase()}`;
    if (used.has(key)) continue;
    used.add(key);
    highlights.push({
      text: slice,
      type: "improve",
      title: "Vocabulary",
      detail: "Consider a more precise alternative.",
      suggestion: alternatives?.filter(Boolean).slice(0, 3).join(", ") || undefined,
    });
  }

  return highlights;
}

function buildEvaluatedLabel(review: WritingReview): string {
  if (review.ai_provider === "claude") {
    return review.ai_model_name
      ? `AI evaluated (Claude · ${review.ai_model_name})`
      : "AI evaluated (Claude)";
  }
  if (review.ai_provider === "groq") {
    return review.ai_model_name
      ? `AI evaluated (Groq fallback · ${review.ai_model_name})`
      : "AI evaluated (Groq fallback)";
  }
  if (review.ai_model_name) {
    return `AI evaluated (${review.ai_model_name})`;
  }
  if (review.ai_available === false) {
    return "AI unavailable · Using rubric fallback";
  }
  return "AI evaluated · Band descriptors applied";
}

function confidenceLabel(confidence: number | null | undefined): string | null {
  if (confidence == null || Number.isNaN(confidence)) return null;
  const clamped = Math.max(0, Math.min(1, confidence));
  if (clamped >= 0.75) return "AI confidence: high";
  if (clamped >= 0.45) return "AI confidence: medium";
  return "AI confidence: low";
}

function vocabFromAi(review: WritingReview): {
  strong_words: string[];
  weak_words: WritingVocabTag[];
} | null {
  const items = review.vocabulary_highlights;
  if (!items || items.length === 0) return null;
  const strong_words = items
    .filter((v) => v.polarity === "strong" && v.word?.trim())
    .map((v) => v.word.trim())
    .slice(0, 6);
  const weak_words: WritingVocabTag[] = items
    .filter((v) => v.polarity === "weak" && v.word?.trim())
    .map((v) => ({
      word: v.word.trim(),
      alternatives: (v.alternatives ?? []).filter(Boolean).slice(0, 3),
    }))
    .slice(0, 6);
  if (strong_words.length === 0 && weak_words.length === 0) return null;
  return { strong_words, weak_words };
}

function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return !(aEnd <= bStart || aStart >= bEnd);
}

/** Merge sources: strong_spans → spelling → grammar → weak vocab → strong words. Cap 12. */
function mergeWritingHighlights(
  text: string,
  batches: WritingEssayHighlight[][],
  cap = 12,
): WritingEssayHighlight[] {
  const out: WritingEssayHighlight[] = [];
  const placed: Array<{ start: number; end: number }> = [];

  for (const batch of batches) {
    for (const hl of batch) {
      if (out.length >= cap) return out;
      const idx = findPhrase(text, hl.text);
      if (idx === -1) continue;
      const end = idx + hl.text.length;
      if (placed.some((p) => rangesOverlap(idx, end, p.start, p.end))) continue;
      placed.push({ start: idx, end });
      out.push({ ...hl, text: text.slice(idx, end) });
    }
  }
  return out;
}

function buildHighlights(
  text: string,
  strongWords: string[],
  weakWords: WritingVocabTag[],
): WritingEssayHighlight[] {
  const highlights = buildVocabHighlights(text, strongWords, weakWords);
  const used = new Set(highlights.map((h) => h.text.toLowerCase()));

  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 40);
  if (highlights.length < 4 && sentences[0]) {
    const snippet = sentences[0].trim().slice(0, Math.min(80, sentences[0].length));
    if (snippet.length > 20 && !used.has(snippet.toLowerCase())) {
      highlights.push({
        text: snippet,
        type: "strong",
        title: "Strong span",
        detail: "Clear opening development.",
      });
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

/** Build UI feedback from review data — prefer AI fields when present. */
export function buildWritingFeedback(
  review: WritingReview,
  options?: { targetBand?: number | null },
): WritingFeedback {
  const overall = overallBand(review);
  const target_band =
    options?.targetBand != null && Number.isFinite(options.targetBand)
      ? options.targetBand
      : DEFAULT_TARGET_BAND;
  const criteria = criteriaFromAi(review) ?? buildCriteria(overall);
  const criterion_gap_label = criterionGapLabel(criteria, target_band);
  const aiVocab = vocabFromAi(review);
  const strong_words = aiVocab?.strong_words.length
    ? aiVocab.strong_words
    : findStrongWords(review.user_answer);
  const weak_words =
    aiVocab && aiVocab.weak_words.length > 0
      ? aiVocab.weak_words
      : findWeakWords(review.user_answer);
  const aiStrengths = review.ai_strengths ?? [];
  const aiImprovements = review.ai_improvements ?? [];
  const strengths =
    aiStrengths.length > 0 ? aiStrengths.slice(0, 4) : buildStrengths(review, overall);
  const improvements =
    aiImprovements.length > 0
      ? aiImprovements.slice(0, 4)
      : buildImprovements(review, overall);
  const spelling_mistakes = review.spelling_mistakes ?? [];
  const grammar_mistakes = review.grammar_mistakes ?? [];
  const aiMistakeHighlights = buildAiHighlights(
    review.user_answer,
    spelling_mistakes,
    grammar_mistakes,
  );
  const aiStrongHighlights = buildAiStrongHighlights(
    review.user_answer,
    review.strong_spans,
  );
  const vocabHighlights = buildVocabHighlights(
    review.user_answer,
    strong_words,
    weak_words,
  );
  const heuristicHighlights = buildHighlights(
    review.user_answer,
    strong_words,
    weak_words,
  );
  const aiMerged = mergeWritingHighlights(review.user_answer, [
    aiStrongHighlights,
    aiMistakeHighlights.filter((h) => h.type === "spelling"),
    aiMistakeHighlights.filter((h) => h.type === "grammar"),
    vocabHighlights.filter((h) => h.type === "improve"),
    vocabHighlights.filter((h) => h.type === "strong"),
  ]);
  const highlights =
    aiMerged.length > 0 ? aiMerged : heuristicHighlights;
  const evaluated_label = buildEvaluatedLabel(review);
  const aiNextBand = review.next_band_advice?.trim() ?? "";
  const next_band_advice =
    aiNextBand.length > 0
      ? aiNextBand
      : buildNextBandAdvice(review, overall, criterion_gap_label);
  const confidence_label = confidenceLabel(review.confidence);

  return {
    overall_band: overall,
    criteria,
    strengths,
    improvements,
    next_band_advice,
    target_band,
    criterion_gap_label,
    strong_words,
    weak_words,
    highlights,
    spelling_mistakes,
    grammar_mistakes,
    evaluated_label,
    confidence_label,
    human_verified: review.human_verified === true || review.band_source === "human",
    reviewer_notes: review.reviewer_notes ?? null,
  };
}
