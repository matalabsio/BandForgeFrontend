/** Rule-based MATA Coach persona copy for module-complete reviews (v1, no AI). */

import type { ModuleReviewGroup, ObjectiveModule } from "@/lib/module-review-types";

type CoachArgs = {
  module: ObjectiveModule;
  rawScore: number;
  total: number;
  groups: ModuleReviewGroup[];
};

const MODULE_LABEL: Record<ObjectiveModule, string> = {
  listening: "Listening",
  reading: "Reading",
};

function pct(group: ModuleReviewGroup): number {
  if (group.total_questions === 0) return 1;
  return group.raw_score / group.total_questions;
}

function encouragement(ratio: number): string {
  if (ratio >= 0.85) return "That is a strong, exam-ready result.";
  if (ratio >= 0.7) return "That is solid work with a little room to sharpen.";
  if (ratio >= 0.5) return "You are on your way — a few focused sessions will lift this.";
  return "There is clear ground to gain here, and it is very trainable.";
}

/** One short paragraph summarising the whole module for the coach card. */
export function buildModuleCoachMessage({
  module,
  rawScore,
  total,
  groups,
}: CoachArgs): string {
  const label = MODULE_LABEL[module];
  const ratio = total > 0 ? rawScore / total : 0;
  const scored = groups.filter((g) => g.total_questions > 0);

  const spanLabel =
    module === "listening"
      ? `all ${scored.length} parts`
      : `all ${new Set(scored.map((g) => g.label.split(" · ")[0])).size} passages`;

  const sentences: string[] = [
    `You scored ${rawScore} out of ${total} across ${spanLabel}.`,
    encouragement(ratio),
  ];

  const weakest = [...scored].sort((a, b) => pct(a) - pct(b))[0];
  const strongest = [...scored].sort((a, b) => pct(b) - pct(a))[0];
  if (weakest && strongest && weakest.label !== strongest.label) {
    if (pct(weakest) < 1) {
      sentences.push(
        `Your strongest area was ${strongest.label} (${strongest.raw_score}/${strongest.total_questions}); ${weakest.label} (${weakest.raw_score}/${weakest.total_questions}) is where the next gains are.`,
      );
    }
  }

  sentences.push(
    "Open each section below to see exactly which answers were right and where to adjust.",
  );

  return sentences.join(" ");
}

export function moduleCoachTitle(module: ObjectiveModule): string {
  return `MATA Coach · ${MODULE_LABEL[module]}`;
}
