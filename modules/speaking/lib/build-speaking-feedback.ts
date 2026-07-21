import type {
  SpeakingCriterionKey,
  SpeakingCriterionScore,
  SpeakingFeedback,
  SpeakingPartReport,
  SpeakingReportPayload,
  SpeakingUiEvidence,
} from "@/modules/speaking/types";

const CRITERIA: ReadonlyArray<{
  key: SpeakingCriterionKey;
  label: string;
  shortLabel: string;
}> = [
  { key: "fluency", label: "Fluency & Coherence", shortLabel: "FC" },
  { key: "lexical", label: "Lexical Resource", shortLabel: "LR" },
  { key: "grammar", label: "Grammar Range & Accuracy", shortLabel: "GRA" },
  { key: "pronunciation", label: "Pronunciation", shortLabel: "Pron" },
];

const REQUIRED_SECTIONS = [
  "attempt",
  "student",
  "release",
  "scores",
  "parts",
  "responses",
  "fluency_summary",
  "pronunciation_advisory",
  "evidence",
  "patterns",
  "summary",
  "analysis",
] as const;

export class SpeakingReportContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpeakingReportContractError";
  }
}

function finiteBand(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 9) {
    throw new SpeakingReportContractError(`The report has an invalid ${field} band score.`);
  }
  return value;
}

export function targetDelta(score: number, targetBand: number | null): number | null {
  if (targetBand == null || !Number.isFinite(targetBand)) return null;
  return Math.round((targetBand - score) * 10) / 10;
}

export function findBiggestGap(
  criteria: SpeakingCriterionScore[],
): SpeakingCriterionScore | null {
  return criteria.reduce<SpeakingCriterionScore | null>((largest, criterion) => {
    if (criterion.targetGap == null || criterion.targetGap <= 0) return largest;
    if (!largest || (largest.targetGap ?? 0) < criterion.targetGap) return criterion;
    return largest;
  }, null);
}

export function ieltsDescriptor(score: number): string {
  if (score >= 9) return "Expert User";
  if (score >= 8) return "Very Good User";
  if (score >= 7) return "Good User";
  if (score >= 6) return "Competent User";
  if (score >= 5) return "Modest User";
  if (score >= 4) return "Limited User";
  if (score >= 3) return "Extremely Limited User";
  if (score >= 2) return "Intermittent User";
  if (score >= 1) return "Non-user";
  return "Did not attempt";
}

function assertV2(report: SpeakingReportPayload): void {
  if (report.schema_version !== "speaking-report.v2") {
    throw new SpeakingReportContractError(
      "This speaking report uses an unsupported format. No score details were inferred.",
    );
  }
  const record = report as unknown as Record<string, unknown>;
  const missing = REQUIRED_SECTIONS.filter((section) => record[section] == null);
  if (missing.length > 0) {
    throw new SpeakingReportContractError(
      `This released report is incomplete (${missing.join(", ")} unavailable). No missing analysis was inferred.`,
    );
  }
  if (
    !Array.isArray(report.parts) ||
    !Array.isArray(report.responses) ||
    !Array.isArray(report.evidence) ||
    !Array.isArray(report.patterns) ||
    !Array.isArray(report.summary.strengths) ||
    !Array.isArray(report.summary.improvements) ||
    !Array.isArray(report.analysis.unavailable_sections)
  ) {
    throw new SpeakingReportContractError(
      "This released report contains malformed analysis data. No replacement content was generated.",
    );
  }
}

/** Strict speaking-report.v2 adapter. It never reads legacy or AI score fallbacks. */
export function buildSpeakingFeedback(report: SpeakingReportPayload): SpeakingFeedback {
  assertV2(report);

  const overallBand = finiteBand(report.scores.overall, "overall");
  const targetBand =
    typeof report.student.target_band_at_release === "number" &&
    Number.isFinite(report.student.target_band_at_release)
      ? report.student.target_band_at_release
      : null;

  const criteria = CRITERIA.map(({ key, label, shortLabel }) => {
    const source = report.scores.criteria?.[key];
    if (!source) {
      throw new SpeakingReportContractError(
        `The released report is missing the human ${label} score. No score was estimated.`,
      );
    }
    const band = finiteBand(source.band, label);
    return {
      key,
      label,
      shortLabel,
      band,
      targetGap:
        typeof source.target_gap === "number" && Number.isFinite(source.target_gap)
          ? source.target_gap
          : targetDelta(band, targetBand),
    };
  });

  const responseById = new Map(report.responses.map((response) => [response.id, response]));
  const parts: SpeakingPartReport[] = report.parts.map((part) => {
    const responses = part.response_ids.flatMap((id) => {
      const response = responseById.get(id);
      if (!response) return [];
      const evidence: SpeakingUiEvidence[] = report.evidence
        .filter((item) => item.response_id === response.id)
        .map((item) => ({
          ...item,
          start_char: item.span?.char_start,
          end_char: item.span?.char_end,
          start_ms: item.span?.start_ms,
          end_ms: item.span?.end_ms,
        }));
      return [
        {
          ...response,
          transcript_words: response.transcript_words ?? [],
          sequence_number: response.sequence,
          duration_seconds: response.duration_sec,
          audioUrl: response.audio_url?.trim() || null,
          pauseMarkers: (response.pause_markers ?? []).map((marker) => ({
            start_ms: marker.start_ms,
            end_ms: marker.end_ms,
            gap_sec: marker.duration_ms / 1000,
          })),
          evidence,
        },
      ];
    });
    return {
      ...part,
      band_estimate: part.ai_band,
      note: part.ai_note,
      responses,
      evidence: report.evidence
        .filter((item) => item.part === part.part)
        .map((item) => ({
          ...item,
          start_char: item.span?.char_start,
          end_char: item.span?.char_end,
          start_ms: item.span?.start_ms,
          end_ms: item.span?.end_ms,
        })),
    };
  });

  const computedGap = findBiggestGap(criteria);
  const declaredGap = report.scores.biggest_gap
    ? criteria.find(
        (criterion) => criterion.key === report.scores.biggest_gap?.criterion,
      ) ?? null
    : null;

  return {
    schemaVersion: report.schema_version,
    attempt: report.attempt,
    student: report.student,
    release: report.release,
    overallBand,
    descriptor: ieltsDescriptor(overallBand),
    criteria,
    targetBand,
    biggestGap: declaredGap?.targetGap && declaredGap.targetGap > 0 ? declaredGap : computedGap,
    parts,
    fluencySummary: report.fluency_summary,
    pronunciationAdvisory: report.pronunciation_advisory,
    patterns: report.patterns.map((pattern) => ({
      ...pattern,
      examples: pattern.examples.map((example) => example.text),
    })),
    summary: {
      strengths: report.summary.strengths,
      improvements: report.summary.improvements,
      vocabulary_highlights: report.summary.vocabulary,
      next_band_advice: report.summary.next_advice ?? null,
      public_examiner_note: report.summary.examiner_note ?? null,
    },
    analysis: report.analysis,
  };
}
