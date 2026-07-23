"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

type AutoMarqueeProps = {
  "aria-label": string;
  children: ReactNode;
  className?: string;
  /** Pixels per second for desktop auto-scroll */
  speed?: number;
  /** Full loop duration on phone (CSS). e.g. "28s" */
  mobileLoopDuration?: string;
};

/**
 * Auto-scrolling marquee. SSR renders the track once; after mount, clones
 * track children so desktop scrollLeft / mobile CSS `-50%` loops stay seamless
 * without doubling HTML in the initial document.
 */
export function BfAutoMarquee({
  "aria-label": ariaLabel,
  children,
  className = "",
  speed = 28,
  mobileLoopDuration = "32s",
}: AutoMarqueeProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pauseUntilRef = useRef(0);

  const pauseForManualScroll = useCallback((duration = 1200) => {
    pauseUntilRef.current = performance.now() + duration;
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const track = scroller.querySelector<HTMLElement>(".bf-marquee-track");
    if (track && track.dataset.looped !== "1") {
      const originals = Array.from(track.children);
      for (const node of originals) {
        const clone = node.cloneNode(true) as HTMLElement;
        clone.setAttribute("aria-hidden", "true");
        clone.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
        track.appendChild(clone);
      }
      track.dataset.looped = "1";
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const mobileLoop = window.matchMedia("(max-width: 639px)");
    if (mobileLoop.matches) return;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const elapsed = Math.min(now - last, 48);
      last = now;

      const halfWidth = scroller.scrollWidth / 2;
      if (halfWidth > scroller.clientWidth && now > pauseUntilRef.current) {
        scroller.scrollLeft += (speed * elapsed) / 1000;
        if (scroller.scrollLeft >= halfWidth) {
          scroller.scrollLeft -= halfWidth;
        }
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [speed]);

  const style = {
    "--bf-marquee-duration": mobileLoopDuration,
  } as CSSProperties;

  return (
    <div
      ref={scrollerRef}
      className={`bf-marquee bf-marquee--auto-loop ${className}`}
      style={style}
      aria-label={ariaLabel}
      onPointerDown={() => pauseForManualScroll(2400)}
      onPointerUp={() => pauseForManualScroll(900)}
      onPointerCancel={() => pauseForManualScroll(900)}
      onWheel={() => pauseForManualScroll(900)}
      onTouchStart={() => pauseForManualScroll(2400)}
      onTouchEnd={() => pauseForManualScroll(900)}
    >
      {children}
    </div>
  );
}
