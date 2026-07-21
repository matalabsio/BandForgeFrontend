import type { SpeakingPendingTranscriptResponse } from "@/modules/speaking/types";

export type SpeakingTranscriptGroup = {
  part: number;
  label: string;
  responses: SpeakingPendingTranscriptResponse[];
};

const PART_LABELS: Record<number, string> = {
  1: "Introduction",
  2: "Long Turn",
  3: "Discussion",
};

export function groupSpeakingTranscripts(
  responses: SpeakingPendingTranscriptResponse[],
): SpeakingTranscriptGroup[] {
  const byPart = new Map<number, SpeakingPendingTranscriptResponse[]>();
  for (const response of [...responses].sort(
    (left, right) => left.sequence - right.sequence,
  )) {
    const group = byPart.get(response.part) ?? [];
    group.push(response);
    byPart.set(response.part, group);
  }
  return [...byPart.entries()]
    .sort(([left], [right]) => left - right)
    .map(([part, items]) => ({
      part,
      label: PART_LABELS[part] ?? "Speaking",
      responses: items,
    }));
}

export function speakingTranscriptStatus(
  status: string,
): "complete" | "processing" | "failed" {
  if (status === "completed") return "complete";
  if (status === "failed") return "failed";
  return "processing";
}
