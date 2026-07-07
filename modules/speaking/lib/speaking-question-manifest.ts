import type { DiagnosticPack } from "@/lib/diagnostic-pack";
import type { SpeakingQuestionManifest } from "@/modules/speaking/types";

/** Phase A stub manifest for full mock speaking (Parts 1, 2, 3). */
export const MOCK_SPEAKING_MANIFEST: SpeakingQuestionManifest[] = [
  {
    id: "mock-p1-q1",
    part: 1,
    questionNumber: 1,
    prompt: "Let's talk about your hometown. Where are you from?",
    kind: "question",
  },
  {
    id: "mock-p1-q2",
    part: 1,
    questionNumber: 2,
    prompt: "What do you like most about living there?",
    kind: "question",
  },
  {
    id: "mock-p1-q3",
    part: 1,
    questionNumber: 3,
    prompt: "Has your hometown changed much in recent years?",
    kind: "question",
  },
  {
    id: "mock-p1-q4",
    part: 1,
    questionNumber: 4,
    prompt: "Would you recommend your hometown to a visitor?",
    kind: "question",
  },
  {
    id: "mock-p2-intro",
    part: 2,
    questionNumber: 1,
    prompt:
      "Describe a skill you learned that you are proud of.\n\nYou should say:\n• what the skill was\n• when and how you learned it\n• why you are proud of it\n\nand explain how this skill has helped you.",
    kind: "part2_intro",
    prepSec: 60,
    recordSec: 120,
  },
  {
    id: "mock-p3-q1",
    part: 3,
    questionNumber: 1,
    prompt: "Why do you think continuous learning is important?",
    kind: "question",
  },
  {
    id: "mock-p3-q2",
    part: 3,
    questionNumber: 2,
    prompt: "How has technology changed the way people learn new skills?",
    kind: "question",
  },
  {
    id: "mock-p3-q3",
    part: 3,
    questionNumber: 3,
    prompt: "Do you think schools prepare students well for real-world skills?",
    kind: "question",
  },
];

export function diagnosticManifestFromPack(pack: DiagnosticPack): SpeakingQuestionManifest[] {
  const items: SpeakingQuestionManifest[] = pack.speaking.part1.questions.map((q, i) => ({
    id: q.id,
    part: 1,
    questionNumber: i + 1,
    prompt: q.prompt,
    kind: "question" as const,
    maxRecordSec: q.maxSec,
  }));

  if (pack.speaking.part2.enabled && pack.speaking.part2.cueCard.trim()) {
    items.push({
      id: "diagnostic-p2",
      part: 2,
      questionNumber: 1,
      prompt: pack.speaking.part2.cueCard,
      kind: "part2_intro",
      prepSec: pack.speaking.part2.prepSec,
      recordSec: pack.speaking.part2.recordSec,
    });
  }

  return items;
}

export function part2ManifestItem(
  manifest: SpeakingQuestionManifest[],
): SpeakingQuestionManifest | null {
  return manifest.find((m) => m.kind === "part2_intro") ?? null;
}

export function questionsForPart(
  manifest: SpeakingQuestionManifest[],
  part: 1 | 3,
): SpeakingQuestionManifest[] {
  return manifest.filter((m) => m.part === part && m.kind === "question");
}

export function flattenExamSteps(manifest: SpeakingQuestionManifest[]): SpeakingQuestionManifest[] {
  const p1 = questionsForPart(manifest, 1);
  const p2 = part2ManifestItem(manifest);
  const p3 = questionsForPart(manifest, 3);
  return [...p1, ...(p2 ? [p2] : []), ...p3];
}
