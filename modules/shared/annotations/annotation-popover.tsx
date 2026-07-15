"use client";

import { cn } from "@/lib/utils";
import { annotationPopoverAccent } from "@/modules/shared/annotations/styles";
import type { AnnotationSpan } from "@/modules/shared/annotations/types";
import type { CSSProperties, Ref } from "react";

export const ANNOTATION_POPOVER_WIDTH = 256;

type Props = {
  annotation: AnnotationSpan;
  id: string;
  /** Fixed viewport position (portal). */
  style?: CSSProperties;
  className?: string;
  tipRef?: Ref<HTMLDivElement>;
};

export function AnnotationPopover({
  annotation,
  id,
  style,
  className,
  tipRef,
}: Props) {
  return (
    <div
      ref={tipRef}
      id={id}
      role="tooltip"
      style={style}
      className={cn(
        "box-border w-64 rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-lg",
        "whitespace-normal break-words text-left normal-case leading-normal",
        annotationPopoverAccent(annotation.kind),
        className,
      )}
    >
      <p className="m-0 text-[11px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
        {annotation.title}
      </p>
      {annotation.body ? (
        <p className="mt-1.5 mb-0 text-[13px] leading-relaxed text-[#334155]">
          {annotation.body}
        </p>
      ) : null}
      {annotation.suggestion ? (
        <p className="mt-2 mb-0 rounded-lg bg-surface-alt px-2.5 py-1.5 text-[12px] leading-snug font-medium text-[#0D1F3C]">
          <span className="text-[#64748B]">Try: </span>
          {annotation.suggestion}
        </p>
      ) : null}
    </div>
  );
}
