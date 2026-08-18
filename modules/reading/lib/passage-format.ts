export type PassageBlock =
  | { kind: "title"; text: string }
  | { kind: "paragraph"; label: string; text: string };

function htmlParagraphs(raw: string): string[] | null {
  if (!/<p\b/i.test(raw)) return null;
  const parts = raw
    .split(/<\/p>/i)
    .map((chunk) => chunk.replace(/<p\b[^>]*>/gi, "").trim())
    .filter((chunk) => chunk.replace(/<br\s*\/?>/gi, "").trim().length > 0);
  return parts.length > 0 ? parts : null;
}

/** Split founder passage text into title + labelled paragraphs (A, B, …). */
export function parsePassageBlocks(raw: string): PassageBlock[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const htmlParts = htmlParagraphs(trimmed);
  if (htmlParts) {
    return htmlParts.map((text, i) =>
      i === 0
        ? { kind: "title" as const, text }
        : { kind: "paragraph" as const, label: "", text },
    );
  }

  const parts = trimmed.split(/\n\n+/);
  const blocks: PassageBlock[] = [];

  for (let i = 0; i < parts.length; i++) {
    const chunk = parts[i].trim();
    if (!chunk) continue;

    const paraMatch = chunk.match(/^([A-G])\s{2,}([\s\S]*)$/);
    if (paraMatch) {
      blocks.push({
        kind: "paragraph",
        label: paraMatch[1],
        text: paraMatch[2].trim(),
      });
      continue;
    }

    if (i === 0 && !/^[A-G]\s{2,}/.test(chunk)) {
      const lines = chunk.split("\n");
      const title = lines[0]?.trim() ?? chunk;
      const rest = lines.slice(1).join("\n").trim();
      blocks.push({ kind: "title", text: title });
      if (rest) {
        const inner = rest.match(/^([A-G])\s{2,}([\s\S]*)$/);
        if (inner) {
          blocks.push({ kind: "paragraph", label: inner[1], text: inner[2].trim() });
        } else {
          blocks.push({ kind: "paragraph", label: "", text: rest });
        }
      }
      continue;
    }

    blocks.push({ kind: "paragraph", label: "", text: chunk });
  }

  return blocks;
}
