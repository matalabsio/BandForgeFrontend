"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type BfRevealDir = "up" | "down" | "left" | "right" | "fade";

const FROM: Record<BfRevealDir, gsap.TweenVars> = {
  up: { opacity: 0, y: 36 },
  down: { opacity: 0, y: -28 },
  left: { opacity: 0, x: -40 },
  right: { opacity: 0, x: 40 },
  fade: { opacity: 0, filter: "brightness(0.88)" },
};

type Options = {
  /** ScrollTrigger start — default matches Method section feel */
  start?: string;
  reduceMotion?: boolean | null;
};

function forceVisible(els: HTMLElement[]) {
  gsap.set(els, {
    clearProps: "transform,filter",
    opacity: 1,
    x: 0,
    y: 0,
    filter: "none",
  });
}

/**
 * Smooth section entrance — mix left / right / up / down / light-up via
 * `data-bf-reveal` + optional `data-bf-reveal-delay` (seconds).
 * Once-per-load; safety timeout so content never stays hidden.
 */
export function useBfSectionReveal(
  rootRef: RefObject<HTMLElement | null>,
  options: Options = {},
) {
  const { start = "top 86%", reduceMotion = false } = options;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const els = Array.from(
      root.querySelectorAll<HTMLElement>("[data-bf-reveal]"),
    );
    if (!els.length) return;

    if (reduceMotion) {
      forceVisible(els);
      return;
    }

    const safety = window.setTimeout(() => forceVisible(els), 1600);

    const ctx = gsap.context(() => {
      els.forEach((el) => {
        const raw = (el.dataset.bfReveal || "up") as BfRevealDir;
        const dir: BfRevealDir = FROM[raw] ? raw : "up";
        const delay = Number(el.dataset.bfRevealDelay ?? 0) || 0;
        const duration = Number(el.dataset.bfRevealDuration ?? 0.8) || 0.8;

        const rect = el.getBoundingClientRect();
        const alreadyInView =
          rect.top < window.innerHeight * 0.92 && rect.bottom > 0;

        gsap.set(el, FROM[dir]);

        gsap.to(el, {
          opacity: 1,
          x: 0,
          y: 0,
          filter: "none",
          duration,
          delay: alreadyInView ? Math.min(delay, 0.05) : delay,
          ease: "power3.out",
          overwrite: "auto",
          scrollTrigger: alreadyInView
            ? undefined
            : {
                trigger: el,
                start,
                once: true,
                toggleActions: "play none none none",
              },
        });
      });
    }, root);

    return () => {
      window.clearTimeout(safety);
      ctx.revert();
    };
  }, [rootRef, start, reduceMotion]);
}
