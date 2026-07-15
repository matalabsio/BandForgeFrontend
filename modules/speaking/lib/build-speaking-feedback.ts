import type {
  SpeakingCriterionScore,
  SpeakingEvidenceQuote,
  SpeakingFeedback,
  SpeakingFluencyMetrics,
  SpeakingPartCard,
  SpeakingPatternCard,
  SpeakingReportPayload,
  SpeakingTranscriptHighlight,
} from "@/modules/speaking/types";

const CRITERION_LABELS: Record<SpeakingCriterionScore["key"], string> = {
  fluency: "Fluency & Coherence",
  lexical: "Lexical Resource",
  grammar: "Grammar Range & Accuracy",
  pronunciation: "Pronunciation",
};

const DEFAULT_TARGET_BAND = 7.5;

function roundBand(value: number): number {
  return Math.round(value * 2) / 2;
}

function clampBand(value: number): number {
  return roundBand(Math.max(0, Math.min(9, value)));
}

function heuristicCriteria(overall: number): SpeakingCriterionScore[] {
  return [
    { key: "fluency", label: CRITERION_LABELS.fluency, band: clampBand(overall) },
    {
      key: "lexical",
      label: CRITERION_LABELS.lexical,
      band: clampBand(overall - 0.5),
    },
    {
      key: "grammar",
      label: CRITERION_LABELS.grammar,
      band: clampBand(overall - 0.5),
    },
    {
      key: "pronunciation",
      label: CRITERION_LABELS.pronunciation,
      band: clampBand(overall),
    },
  ];
}

function criteriaFromHuman(
  report: SpeakingReportPayload,
): SpeakingCriterionScore[] | null {
  const h = report.human_criteria_scores;
  if (!h) return null;
  return [
    { key: "fluency", label: CRITERION_LABELS.fluency, band: clampBand(h.fluency) },
    { key: "lexical", label: CRITERION_LABELS.lexical, band: clampBand(h.lexical) },
    { key: "grammar", label: CRITERION_LABELS.grammar, band: clampBand(h.grammar) },
    {
      key: "pronunciation",
      label: CRITERION_LABELS.pronunciation,
      band: clampBand(h.pronunciation),
    },
  ];
}

function criteriaFromAi(report: SpeakingReportPayload): SpeakingCriterionScore[] | null {
  const bs = report.evaluation?.band_scores;
  if (bs) {
    return [
      { key: "fluency", label: CRITERION_LABELS.fluency, band: clampBand(bs.FC) },
      { key: "lexical", label: CRITERION_LABELS.lexical, band: clampBand(bs.LR) },
      { key: "grammar", label: CRITERION_LABELS.grammar, band: clampBand(bs.GRA) },
      {
        key: "pronunciation",
        label: CRITERION_LABELS.pronunciation,
        band: clampBand(bs.P),
      },
    ];
  }
  if (
    report.fluency == null ||
    report.lexical == null ||
    report.grammar == null ||
    report.pronunciation == null
  ) {
    return null;
  }
  return [
    {
      key: "fluency",
      label: CRITERION_LABELS.fluency,
      band: clampBand(report.fluency),
    },
    {
      key: "lexical",
      label: CRITERION_LABELS.lexical,
      band: clampBand(report.lexical),
    },
    {
      key: "grammar",
      label: CRITERION_LABELS.grammar,
      band: clampBand(report.grammar),
    },
    {
      key: "pronunciation",
      label: CRITERION_LABELS.pronunciation,
      band: clampBand(report.pronunciation),
    },
  ];
}

function criterionGapLabel(
  criteria: SpeakingCriterionScore[],
  targetBand: number,
): string {
  const lowest = [...criteria].sort((a, b) => a.band - b.band)[0];
  if (!lowest) return "Close the remaining gap to your target band.";
  const gap = Math.max(0, roundBand(targetBand - lowest.band));
  if (gap <= 0) return "You are at or above your current target band.";
  return `You need +${gap.toFixed(1)} in ${lowest.label} to reach your target of Band ${targetBand.toFixed(1)}.`;
}

function heuristicStrengths(band: number): string[] {
  const list = [
    "Maintains understandable pace and sequence of ideas.",
    "Uses topic vocabulary that supports clarity.",
    "Keeps responses relevant to the cue and follow-up prompts.",
  ];
  if (band >= 7) {
    list[0] = "Speaks with consistent flow and clear progression of ideas.";
    list[1] = "Uses a wider range of topic-specific vocabulary naturally.";
  }
  return list;
}

function heuristicImprovements(band: number): string[] {
  const list = [
    "Add one concrete example to each major point.",
    "Vary sentence openings to avoid repetitive rhythm.",
    "Use clearer signposting between ideas and conclusions.",
  ];
  if (band < 6) {
    list[0] = "Increase response length and development before concluding.";
    list[1] = "Reduce pauses by planning 2-3 key points before speaking.";
  }
  return list;
}

function heuristicNextBandAdvice(band: number): string {
  if (band >= 7) {
    return "You are close to the next band. Focus on lexical precision and deeper idea development in Part 2 to push higher.";
  }
  if (band >= 6) {
    return "Your base is solid. To move up, extend answers with specific examples and keep transitions smoother between ideas.";
  }
  return "Prioritise fluency first: practice timed answers with a simple point-example-conclusion structure for each response.";
}

function pronunciationConfidenceLabel(
  confidence: number | null | undefined,
): string | null {
  if (confidence == null || Number.isNaN(confidence)) return null;
  const clamped = Math.max(0, Math.min(1, confidence));
  if (clamped >= 0.75) return "Pronunciation confidence: high";
  if (clamped >= 0.45) return "Pronunciation confidence: medium";
  return "Pronunciation confidence: low";
}

function buildEvaluatedLabel(report: SpeakingReportPayload): string {
  const parts: string[] = ["Human verified"];
  if (report.provider_eval === "anthropic_claude" || report.provider_eval === "claude") {
    parts.push(
      report.model_eval
        ? `AI pre-score (Claude · ${report.model_eval})`
        : "AI pre-score (Claude)",
    );
  } else if (report.provider_eval === "groq") {
    parts.push(
      report.model_eval
        ? `AI pre-score (Groq · ${report.model_eval})`
        : "AI pre-score (Groq)",
    );
  } else if (report.ai_status === "ai_stub") {
    parts.push("AI pre-score (stub)");
  } else if (report.evaluation) {
    parts.push("AI pre-score applied");
  }
  return parts.join(" · ");
}

function findPhraseIndex(text: string, phrase: string): number {
  return text.indexOf(phrase);
}

const CRITERION_SHORT: Record<string, string> = {
  FC: "Fluency & Coherence",
  LR: "Lexical Resource",
  GRA: "Grammar",
  P: "Pronunciation",
};

function mapEvidenceHighlights(
  transcript: string | null,
  quotes: SpeakingEvidenceQuote[] | undefined,
): SpeakingTranscriptHighlight[] {
  if (!transcript || !quotes?.length) return [];
  const highlights: SpeakingTranscriptHighlight[] = [];
  const used = new Set<string>();
  for (const item of quotes) {
    const phrase = item.quote?.trim();
    if (!phrase) continue;
    const idx = findPhraseIndex(transcript, phrase);
    if (idx === -1) continue;
    const key = `${item.polarity}:${item.criterion}:${phrase.toLowerCase()}`;
    if (used.has(key)) continue;
    used.add(key);
    const isPron = item.criterion === "P";
    const kind = isPron
      ? "pronunciation"
      : item.polarity === "strength"
        ? "evidence_strength"
        : "evidence_weakness";
    const polarityLabel =
      item.polarity === "strength" ? "Strength" : "Needs work";
    const criterionLabel = CRITERION_SHORT[item.criterion] ?? item.criterion;
    highlights.push({
      text: phrase,
      polarity: item.polarity,
      criterion: item.criterion,
      kind,
      title: isPron ? "Pronunciation" : polarityLabel,
      body: `${polarityLabel} · ${criterionLabel}`,
    });
  }
  return highlights.slice(0, 8);
}

function mapPauseHighlights(
  transcript: string | null,
  markers: SpeakingReportPayload["pause_markers"],
): SpeakingTranscriptHighlight[] {
  if (!transcript || !markers?.length) return [];
  const highlights: SpeakingTranscriptHighlight[] = [];
  const used = new Set<string>();
  for (const marker of markers.slice(0, 6)) {
    const word = marker.after_word?.trim();
    if (!word) continue;
    const idx = findPhraseIndex(transcript, word);
    if (idx === -1) continue;
    const key = `pause:${word.toLowerCase()}:${marker.gap_sec}`;
    if (used.has(key)) continue;
    used.add(key);
    highlights.push({
      text: word,
      polarity: "weakness",
      criterion: "FC",
      kind: "fluency_pause",
      title: "Fluency pause",
      body: `Long pause after this word (~${marker.gap_sec.toFixed(1)}s). Aim for smoother linking.`,
    });
  }
  return highlights;
}

function mergeSpeakingHighlights(
  evidence: SpeakingTranscriptHighlight[],
  pauses: SpeakingTranscriptHighlight[],
): SpeakingTranscriptHighlight[] {
  const out = [...evidence];
  const texts = new Set(evidence.map((h) => h.text.toLowerCase()));
  for (const p of pauses) {
    if (texts.has(p.text.toLowerCase())) continue;
    out.push(p);
    if (out.length >= 12) break;
  }
  return out;
}

function mapPartCards(report: SpeakingReportPayload): SpeakingPartCard[] {
  const parts = report.evaluation?.part_performance;
  if (!parts?.length) return [];
  return parts.map((p) => ({
    part: p.part,
    note: p.note,
    band_estimate: clampBand(p.band_estimate),
  }));
}

function mapPatterns(report: SpeakingReportPayload): SpeakingPatternCard[] {
  const patterns = report.evaluation?.recurring_patterns;
  if (!patterns?.length) return [];
  return patterns.map((p) => ({
    pattern: p.pattern,
    criterion: p.criterion,
    frequency: p.frequency,
    examples: p.examples ?? [],
  }));
}

function normalizeFluency(
  metrics: SpeakingFluencyMetrics | null,
): SpeakingFluencyMetrics | null {
  if (!metrics) return null;
  const hasAny =
    metrics.words_per_minute != null ||
    metrics.total_speaking_seconds != null ||
    metrics.long_pauses != null ||
    metrics.response_count != null ||
    metrics.questions_asked != null;
  return hasAny ? metrics : null;
}

/** Prefer human criteria + AI evaluation; fall back to heuristics when empty. */
export function buildSpeakingFeedback(
  report: SpeakingReportPayload,
  options?: { targetBand?: number | null },
): SpeakingFeedback {
  const overall = report.overall_band;
  const target_band =
    options?.targetBand != null && Number.isFinite(options.targetBand)
      ? options.targetBand
      : DEFAULT_TARGET_BAND;
  const criteria =
    criteriaFromHuman(report) ??
    criteriaFromAi(report) ??
    heuristicCriteria(overall);
  const criterion_gap_label = criterionGapLabel(criteria, target_band);
  const ev = report.evaluation;
  const aiStrengths = ev?.strengths?.filter(Boolean) ?? [];
  const aiImprovements = ev?.improvements?.filter(Boolean) ?? [];
  const strengths =
    aiStrengths.length > 0 ? aiStrengths.slice(0, 6) : heuristicStrengths(overall);
  const improvements =
    aiImprovements.length > 0
      ? aiImprovements.slice(0, 6)
      : heuristicImprovements(overall);
  const nextAdvice = ev?.next_band_advice?.trim() ?? "";
  const next_band_advice =
    nextAdvice.length > 0 ? nextAdvice : heuristicNextBandAdvice(overall);
  const vocabulary_highlights = (ev?.vocabulary_highlights ?? [])
    .filter(Boolean)
    .slice(0, 8);
  const transcript = report.transcript?.trim() ? report.transcript : null;
  const evidenceHighlights = mapEvidenceHighlights(transcript, ev?.evidence_quotes);
  const pauseHighlights = mapPauseHighlights(transcript, report.pause_markers);
  const highlights = mergeSpeakingHighlights(evidenceHighlights, pauseHighlights);

  return {
    overall_band: overall,
    human_verified: report.human_verified !== false,
    criteria,
    criterion_gap_label,
    target_band,
    strengths,
    improvements,
    next_band_advice,
    vocabulary_highlights,
    part_cards: mapPartCards(report),
    fluency_metrics: normalizeFluency(report.fluency_metrics),
    patterns: mapPatterns(report),
    transcript,
    highlights,
    audio_play_url: report.audio_play_url,
    pronunciation_confidence_label: pronunciationConfidenceLabel(
      ev?.band_scores?.P_confidence,
    ),
    evaluated_label: buildEvaluatedLabel(report),
    reviewer_notes: report.reviewer_notes,
    student_name: report.student_name,
    submitted_at: report.submitted_at,
  };
}
