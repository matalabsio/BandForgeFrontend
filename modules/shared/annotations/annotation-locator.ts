import type { AnnotationSpan } from "@/modules/shared/annotations/types";

export type LocatedAnnotation = AnnotationSpan & { start: number; end: number };

export function locateAnnotations(
  text: string,
  annotations: AnnotationSpan[],
): LocatedAnnotation[] {
  const located: LocatedAnnotation[] = [];
  const occupied: Array<{ start: number; end: number }> = [];
  const overlaps = (start: number, end: number) =>
    occupied.some((range) => !(end <= range.start || start >= range.end));

  for (const annotation of annotations) {
    const phrase = annotation.text?.trim();
    if (!phrase) continue;
    if (
      Number.isInteger(annotation.start) &&
      Number.isInteger(annotation.end) &&
      annotation.start! >= 0 &&
      annotation.end! > annotation.start! &&
      annotation.end! <= text.length &&
      !overlaps(annotation.start!, annotation.end!)
    ) {
      occupied.push({ start: annotation.start!, end: annotation.end! });
      located.push({
        ...annotation,
        text: text.slice(annotation.start!, annotation.end!),
        start: annotation.start!,
        end: annotation.end!,
      });
      continue;
    }

    const lower = text.toLowerCase();
    const target = phrase.toLowerCase();
    let from = 0;
    while (from < text.length) {
      const start = lower.indexOf(target, from);
      if (start === -1) break;
      const end = start + phrase.length;
      if (!overlaps(start, end)) {
        occupied.push({ start, end });
        located.push({
          ...annotation,
          text: text.slice(start, end),
          start,
          end,
        });
        break;
      }
      from = start + 1;
    }
  }

  return located.sort((left, right) => left.start - right.start);
}
