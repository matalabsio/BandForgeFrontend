"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  AnnotatedText,
  annotationDotClass,
  type AnnotationSpan,
} from "@/modules/shared/annotations";
import type { WritingEssayHighlight } from "@/modules/writing/types";

function toAnnotationSpans(
  highlights: WritingEssayHighlight[],
): AnnotationSpan[] {
  return highlights.map((hl, i) => ({
    id: `w-${hl.type}-${i}`,
    text: hl.text,
    kind: hl.type,
    title: hl.title ?? hl.type,
    body: hl.detail ?? "",
    suggestion: hl.suggestion,
  }));
}

type Props = {
  text: string;
  highlights: WritingEssayHighlight[];
};

export function AnnotatedEssay({ text, highlights }: Props) {
  const annotations = useMemo(
    () => toAnnotationSpans(highlights),
    [highlights],
  );

  return (
    <section className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
      <div className="border-b border-[#E2E8F0] px-3 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
            Your essay
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#64748B] sm:gap-3">
            {(
              [
                ["strong", "Strong"],
                ["improve", "Improve"],
                ["grammar", "Grammar"],
                ["spelling", "Spelling"],
              ] as const
            ).map(([kind, label]) =>
              highlights.some((h) => h.type === kind) ? (
                <span
                  key={kind}
                  className="inline-flex items-center gap-1.5"
                >
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      annotationDotClass(kind),
                    )}
                    aria-hidden
                  />
                  {label}
                </span>
              ) : null,
            )}
          </div>
        </div>
      </div>
      <div className="min-h-[220px] flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:min-h-[280px] sm:px-5 sm:py-5">
        <div className="max-w-none break-words text-[15px] leading-[1.75] sm:text-[16px]">
          <AnnotatedText text={text} annotations={annotations} />
        </div>
      </div>
      <div className="border-t border-[#E2E8F0] px-3 py-2.5 sm:px-5">
        <p className="text-[11px] text-[#64748B]">
          {highlights.length} annotations — hover or tap underlined text for
          details and suggestions.
        </p>
      </div>
    </section>
  );
}
