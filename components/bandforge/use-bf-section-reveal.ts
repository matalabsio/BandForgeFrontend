"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type BfRevealDir = "up" | "down" | "left" | "right" | "fade";

type Options = {
  /** ScrollTrigger start — default matches Method section feel */
  start?: string;
  reduceMotion?: boolean | null;
};

const RESCUE_MS = 900;

function fromVars(dir: BfRevealDir, compact: boolean): gsap.TweenVars {
  const yUp = compact ? 24 : 36;
  const yDown = compact ? -20 : -28;
  const x = compact ? 24 : 40;

  switch (dir) {
    case "up":
      return { autoAlpha: 0, y: yUp, x: 0 };
    case "down":
      return { autoAlpha: 0, y: yDown, x: 0 };
    case "left":
      return { autoAlpha: 0, x: -x, y: 0 };
    case "right":
      return { autoAlpha: 0, x: x, y: 0 };
    case "fade":
    default:
      return { autoAlpha: 0, filter: "brightness(0.88)", x: 0, y: 0 };
  }
}

function forceVisible(els: HTMLElement | HTMLElement[]) {
  gsap.set(els, {
    clearProps: "transform,filter",
    autoAlpha: 1,
    opacity: 1,
    x: 0,
    y: 0,
    filter: "none",
    visibility: "visible",
  });
}

function isNearHidden(el: HTMLElement) {
  const opacity = Number(gsap.getProperty(el, "opacity"));
  return !Number.isFinite(opacity) || opacity < 0.15;
}

function isInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
}

/**
 * Smooth section entrance — mix left / right / up / down / light-up via
 * `data-bf-reveal` + optional `data-bf-reveal-delay` (seconds).
 * Once-per-load; per-element rescue so content never stays stuck hidden.
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

    // Coerce null (useReducedMotion warm-up) to false — only skip motion when true
    if (reduceMotion === true) {
      forceVisible(els);
      return;
    }

    const compact = !window.matchMedia("(min-width: 1024px)").matches;
    const rescueTimers = new Set<number>();

    const scheduleRescue = (el: HTMLElement) => {
      const id = window.setTimeout(() => {
        rescueTimers.delete(id);
        if (isNearHidden(el) && isInViewport(el)) {
          forceVisible(el);
        }
      }, RESCUE_MS);
      rescueTimers.add(id);
    };

    const ctx = gsap.context(() => {
      els.forEach((el) => {
        const raw = (el.dataset.bfReveal || "up") as BfRevealDir;
        const dir: BfRevealDir =
          raw === "up" ||
          raw === "down" ||
          raw === "left" ||
          raw === "right" ||
          raw === "fade"
            ? raw
            : "up";
        const delay = Number(el.dataset.bfRevealDelay ?? 0) || 0;
        const duration = Number(el.dataset.bfRevealDuration ?? 0.8) || 0.8;
        const alreadyInView = isInViewport(el);

        gsap.set(el, fromVars(dir, compact));

        const play = (immediate: boolean) => {
          scheduleRescue(el);
          gsap.to(el, {
            autoAlpha: 1,
            x: 0,
            y: 0,
            filter: "none",
            duration,
            delay: immediate ? Math.min(delay, 0.05) : delay,
            ease: "power3.out",
            overwrite: "auto",
            onComplete: () => {
              gsap.set(el, {
                clearProps: "transform,filter",
                autoAlpha: 1,
                opacity: 1,
                visibility: "visible",
              });
            },
          });
        };

        if (alreadyInView) {
          play(true);
          return;
        }

        ScrollTrigger.create({
          trigger: el,
          start,
          once: true,
          onEnter: () => play(false),
        });
      });
    }, root);

    const raf = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
      rescueTimers.forEach((id) => window.clearTimeout(id));
      rescueTimers.clear();
      ctx.revert();
    };
  }, [rootRef, start, reduceMotion]);
}
