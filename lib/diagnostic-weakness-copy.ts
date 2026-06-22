import type { DiagnosticModuleReview } from "@/lib/diagnostic-session";

const SKILL_PHRASES: Record<string, string> = {
  map_labelling: "map-labelling",
  spelling: "spelling",
  inference: "inference questions",
  multiple_choice: "multiple-choice items",
  form_completion: "form completion",
  sentence_completion: "sentence completion",
  true_false_ng: "Yes / No / Not Given items",
  tfng: "Yes / No / Not Given items",
  matching: "matching headings",
  general: "common question types",
};

function worstSkillPhrase(review?: DiagnosticModuleReview): string | null {
  if (!review?.bySkill) return null;
  let worst: { skill: string; rate: number } | null = null;
  for (const [skill, { correct, total }] of Object.entries(review.bySkill)) {
    if (total <= 0) continue;
    const rate = correct / total;
    if (!worst || rate < worst.rate) {
      worst = { skill, rate };
    }
  }
  if (!worst || worst.rate >= 1) return null;
  const phrase = SKILL_PHRASES[worst.skill] ?? worst.skill.replace(/_/g, " ");
  return phrase;
}

export function listeningWeaknessCopy(review?: DiagnosticModuleReview): string {
  const skill = worstSkillPhrase(review);
  if (skill) return `Lost marks on ${skill}`;
  return "Accuracy issues on common listening traps";
}

export function readingWeaknessCopy(review?: DiagnosticModuleReview): string {
  const skill = worstSkillPhrase(review);
  if (skill?.includes("Yes")) return `Missed all ${skill}`;
  if (skill) return `Struggled with ${skill}`;
  return "Detail and inference under time pressure";
}

export function writingWeaknessCopy(band: number | null, wordCount?: number): string {
  if (band != null && band < 5.5) return "Weak task response & cohesion";
  if (wordCount != null && wordCount < 150) return "Response too short for the task";
  if (band != null && band < 6.5) return "Task response needs clearer structure";
  return "Fine-tune cohesion and lexical range";
}

export function speakingWeaknessCopy(
  band: number | null,
  completed?: boolean,
): string {
  if (!completed) return "Complete speaking for a full estimate";
  if (band != null && band < 6) return "Limited range of complex grammar";
  if (band != null && band < 7) return "Fluency and pronunciation need polish";
  return "Push toward natural, extended responses";
}

export function highestImpactModule(
  bands: {
    listening: number | null;
    reading: number | null;
    writing: number | null;
    speaking: number | null;
  },
): { key: keyof typeof bands; label: string } {
  const entries: { key: keyof typeof bands; label: string; band: number }[] = [
    { key: "listening", label: "Listening", band: bands.listening ?? 9 },
    { key: "reading", label: "Reading", band: bands.reading ?? 9 },
    { key: "writing", label: "Writing Task Response", band: bands.writing ?? 9 },
    { key: "speaking", label: "Speaking Fluency", band: bands.speaking ?? 9 },
  ];
  const weakest = entries.reduce((a, b) => (a.band <= b.band ? a : b));
  return { key: weakest.key, label: weakest.label };
}
