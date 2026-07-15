"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import {
  ANNOTATION_POPOVER_WIDTH,
  AnnotationPopover,
} from "@/modules/shared/annotations/annotation-popover";
import { annotationMarkClass } from "@/modules/shared/annotations/styles";
import type { AnnotationSpan } from "@/modules/shared/annotations/types";

type Located = AnnotationSpan & { start: number; end: number };

type TipCoords = { top: number; left: number };

function locateAnnotations(
  text: string,
  annotations: AnnotationSpan[],
): Located[] {
  const located: Located[] = [];
  const occupied: Array<{ start: number; end: number }> = [];

  const overlaps = (start: number, end: number) =>
    occupied.some((o) => !(end <= o.start || start >= o.end));

  for (const ann of annotations) {
    const phrase = ann.text?.trim();
    if (!phrase) continue;
    const lower = text.toLowerCase();
    const target = phrase.toLowerCase();
    let from = 0;
    while (from < text.length) {
      const idx = lower.indexOf(target, from);
      if (idx === -1) break;
      const end = idx + phrase.length;
      if (!overlaps(idx, end)) {
        occupied.push({ start: idx, end });
        located.push({
          ...ann,
          text: text.slice(idx, end),
          start: idx,
          end,
        });
        break;
      }
      from = idx + 1;
    }
  }

  return located.sort((a, b) => a.start - b.start);
}

function positionTip(anchor: DOMRect, tipHeight: number): TipCoords {
  const tipW = ANNOTATION_POPOVER_WIDTH;
  const gap = 8;
  const margin = 12;
  const vw = typeof window !== "undefined" ? window.innerWidth : tipW;
  const vh = typeof window !== "undefined" ? window.innerHeight : tipHeight;

  let left = anchor.left + anchor.width / 2 - tipW / 2;
  left = Math.max(margin, Math.min(left, vw - tipW - margin));

  const below = anchor.bottom + gap;
  const above = anchor.top - tipHeight - gap;
  const preferBelow = below + tipHeight <= vh - margin;
  let top = preferBelow ? below : Math.max(margin, above);
  if (top + tipHeight > vh - margin) {
    top = Math.max(margin, vh - tipHeight - margin);
  }

  return { top, left };
}

type Props = {
  text: string;
  annotations: AnnotationSpan[];
  className?: string;
  emptyFallback?: ReactNode;
};

export function AnnotatedText({
  text,
  annotations,
  className,
  emptyFallback,
}: Props) {
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const anchorBtnRef = useRef<HTMLButtonElement | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [coords, setCoords] = useState<TipCoords | null>(null);
  const [mounted, setMounted] = useState(false);
  const located = locateAnnotations(text, annotations);

  const close = useCallback(() => {
    setOpenId(null);
    setCoords(null);
    anchorBtnRef.current = null;
  }, []);

  const openFor = useCallback((id: string, button: HTMLButtonElement) => {
    anchorBtnRef.current = button;
    setOpenId(id);
    setCoords(positionTip(button.getBoundingClientRect(), 140));
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!openId || !anchorBtnRef.current) return;

    const update = () => {
      const btn = anchorBtnRef.current;
      if (!btn) return;
      const tipH = tipRef.current?.offsetHeight ?? 140;
      setCoords(positionTip(btn.getBoundingClientRect(), tipH));
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [openId]);

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      if (tipRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [openId, close]);

  if (!text.trim()) {
    return (
      emptyFallback ?? (
        <p className="text-[14px] italic text-[#64748B]">No text saved.</p>
      )
    );
  }

  if (located.length === 0) {
    return (
      <div
        className={cn(
          "whitespace-pre-wrap text-[14px] leading-[1.75] text-[#334155]",
          className,
        )}
      >
        {text}
      </div>
    );
  }

  const openAnn = openId
    ? located.find((a) => a.id === openId) ?? null
    : null;
  const tipId = openAnn ? `${baseId}-${openAnn.id}` : undefined;

  const nodes: ReactNode[] = [];
  let cursor = 0;
  let i = 0;

  for (const ann of located) {
    if (ann.start < cursor) continue;
    if (ann.start > cursor) {
      nodes.push(
        <span key={`t-${i++}`}>{text.slice(cursor, ann.start)}</span>,
      );
    }
    const isOpen = openId === ann.id;
    nodes.push(
      <button
        key={`a-${ann.id}-${ann.start}`}
        type="button"
        className={cn(
          "inline cursor-pointer rounded-sm underline decoration-2 underline-offset-[3px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan",
          annotationMarkClass(ann.kind),
        )}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? tipId : undefined}
        onClick={(e) => {
          if (isOpen) {
            close();
            return;
          }
          openFor(ann.id, e.currentTarget);
        }}
        onMouseEnter={(e) => {
          if (
            typeof window !== "undefined" &&
            window.matchMedia("(hover: hover) and (pointer: fine)").matches
          ) {
            openFor(ann.id, e.currentTarget);
          }
        }}
        onFocus={(e) => openFor(ann.id, e.currentTarget)}
      >
        {ann.text}
      </button>,
    );
    cursor = ann.end;
  }

  if (cursor < text.length) {
    nodes.push(<span key={`t-${i++}`}>{text.slice(cursor)}</span>);
  }

  return (
    <>
      <div
        ref={rootRef}
        className={cn(
          "whitespace-pre-wrap text-[14px] leading-[1.75] text-[#334155]",
          className,
        )}
      >
        {nodes}
      </div>
      {mounted && openAnn && coords
        ? createPortal(
            <AnnotationPopover
              annotation={openAnn}
              id={tipId!}
              tipRef={tipRef}
              className="z-[200]"
              style={{
                position: "fixed",
                top: coords.top,
                left: coords.left,
              }}
            />,
            document.body,
          )
        : null}
    </>
  );
}
