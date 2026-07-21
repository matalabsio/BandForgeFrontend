import type {
  SpeakingReportEvidence,
  SpeakingResponseReport,
} from "@/modules/speaking/types";
import type { AnnotationSpan } from "@/modules/shared/annotations";

export type ReportTabKey = "ArrowLeft" | "ArrowRight" | "Home" | "End";

export function nextReportTab(
  parts: number[],
  current: number,
  key: string,
): number {
  if (parts.length === 0) return current;
  const index = Math.max(0, parts.indexOf(current));
  if (key === "Home") return parts[0];
  if (key === "End") return parts[parts.length - 1];
  if (key === "ArrowRight") return parts[(index + 1) % parts.length];
  if (key === "ArrowLeft") return parts[(index - 1 + parts.length) % parts.length];
  return current;
}

function evidenceTitle(item: SpeakingReportEvidence): string {
  const title = item.title?.trim()
    ? item.title
    : item.polarity === "strength"
      ? "Strength"
      : "Needs work";
  return `${item.criterion} · ${title}`;
}

export function responseAnnotations(
  response: SpeakingResponseReport,
): AnnotationSpan[] {
  return response.evidence.flatMap((item, index) => {
    if (!item.quote?.trim()) return [];
    const body = [item.issue, item.explanation].filter(Boolean).join(" · ");
    return [{
      id: `${response.id}-${index}`,
      text: item.quote,
      kind: item.polarity === "strength" ? "evidence_strength" : "evidence_weakness",
      title: evidenceTitle(item),
      body,
      suggestion: item.suggestion?.trim() || undefined,
      start: item.start_char ?? undefined,
      end: item.end_char ?? undefined,
    }];
  });
}

export function formatMetricLabel(key: string): string {
  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatMetricValue(value: number | string | boolean): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number" && !Number.isInteger(value)) {
    return value.toFixed(1);
  }
  return String(value);
}
