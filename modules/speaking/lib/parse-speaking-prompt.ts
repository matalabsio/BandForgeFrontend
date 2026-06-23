export type ParsedSpeakingPrompt = {
  partLabel: string;
  title: string;
  guidance: string;
  bullets: string[];
};

/** Split DB prompt into structured UI blocks. */
export function parseSpeakingPrompt(raw: string): ParsedSpeakingPrompt {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const partLabel = lines[0]?.startsWith("Part ")
    ? lines[0].split("—")[0]?.trim() ?? "Part 1"
    : "Part 1";

  const titleLine =
    lines.find((line) => line.includes("Introduction")) ??
    lines[0] ??
    "Introduction and interview";

  const title = titleLine.includes("—")
    ? titleLine.split("—").slice(1).join("—").trim()
    : titleLine;

  const guidance =
    lines.find((line) => line.toLowerCase().includes("record your answer")) ??
    "Please record your answer (about 1–2 minutes).";

  const bulletStart = lines.findIndex((line) => line.includes("please cover"));
  const questionLine =
    bulletStart > 0
      ? lines[bulletStart - 1]
      : lines.find((line) => line.toLowerCase().startsWith("tell me")) ?? "";

  const bullets = lines
    .filter((line) => line.startsWith("•") || line.startsWith("-"))
    .map((line) => line.replace(/^[•-]\s*/, "").trim());

  const fallbackBullets = [
    "Who you are and what you do now",
    "Why you are taking the IELTS exam",
    "Where you plan to go (study, work, or migration)",
    "Your main goal or purpose for taking the test",
  ];

  return {
    partLabel,
    title: questionLine || title,
    guidance,
    bullets: bullets.length > 0 ? bullets : fallbackBullets,
  };
}
