"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";

type AutoMarqueeProps = {
  "aria-label": string;
  children: ReactNode;
  className?: string;
  speed?: number;
};

export function BfAutoMarquee({
  "aria-label": ariaLabel,
  children,
  className = "",
  speed = 28,
}: AutoMarqueeProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pauseUntilRef = useRef(0);

  const pauseForManualScroll = useCallback((duration = 1200) => {
    pauseUntilRef.current = performance.now() + duration;
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

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

  return (
    <div
      ref={scrollerRef}
      className={`bf-marquee ${className}`}
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
