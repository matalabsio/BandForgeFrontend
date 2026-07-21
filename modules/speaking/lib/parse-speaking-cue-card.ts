export type SpeakingCueCard = {
  title: string;
  bullets: string[];
  finalInstruction: string | null;
};

/** Parse a Part 2 cue card without turning its final "and explain…" line into a bullet. */
export function parseSpeakingCueCard(text: string): SpeakingCueCard {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const guidanceIndex = lines.findIndex((line) =>
    /^you should (say|cover|include)\s*:?\s*$/i.test(line),
  );
  const titleLines = guidanceIndex >= 0 ? lines.slice(0, guidanceIndex) : lines.slice(0, 1);
  const detailLines = lines.slice(guidanceIndex >= 0 ? guidanceIndex + 1 : 1);
  const finalInstruction =
    [...detailLines].reverse().find((line) => /^and\s+(explain|say|describe)\b/i.test(line)) ??
    null;
  const bullets = detailLines
    .filter((line) => line !== finalInstruction)
    .map((line) => line.replace(/^[•*-]\s*/, "").trim())
    .filter(Boolean);

  return {
    title: titleLines.join(" ") || text,
    bullets,
    finalInstruction,
  };
}
