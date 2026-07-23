"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import Lenis from "lenis";

import "./scroll-stack.css";

export function ScrollStackItem({
  children,
  itemClassName = "",
}: {
  children: ReactNode;
  itemClassName?: string;
}) {
  return (
    <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
  );
}

type ScrollStackProps = {
  children: ReactNode;
  className?: string;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
};

type CardTransform = {
  translateY: number;
  scale: number;
  rotation: number;
};

export default function ScrollStack({
  children,
  className = "",
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete,
}: ScrollStackProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const cardTopsRef = useRef<number[]>([]);
  const endTopRef = useRef(0);
  const scrollTopRef = useRef(0);
  const lastTransformsRef = useRef(new Map<number, CardTransform>());
  const rafScheduledRef = useRef(false);

  const parsePercentage = useCallback(
    (value: string | number, containerHeight: number) => {
      if (typeof value === "string" && value.includes("%")) {
        return (parseFloat(value) / 100) * containerHeight;
      }
      return parseFloat(String(value));
    },
    [],
  );

  const calculateProgress = useCallback(
    (scrollTop: number, start: number, end: number) => {
      if (scrollTop < start) return 0;
      if (scrollTop > end) return 1;
      return (scrollTop - start) / (end - start);
    },
    [],
  );

  /** Measure layout tops with transforms cleared — avoids scroll flicker feedback. */
  const cacheLayoutPositions = useCallback(() => {
    const cards = cardsRef.current;
    cards.forEach((card) => {
      card.style.transform = "none";
      card.style.filter = "none";
    });

    // Force layout so measurements are untransformed.
    void scrollerRef.current?.offsetHeight;

    cardTopsRef.current = cards.map((card) => {
      if (useWindowScroll) {
        const rect = card.getBoundingClientRect();
        return rect.top + window.scrollY;
      }
      return card.offsetTop;
    });

    const endElement = scrollerRef.current?.querySelector(
      ".scroll-stack-end",
    ) as HTMLElement | null;
    if (endElement) {
      if (useWindowScroll) {
        const rect = endElement.getBoundingClientRect();
        endTopRef.current = rect.top + window.scrollY;
      } else {
        endTopRef.current = endElement.offsetTop;
      }
    }

    lastTransformsRef.current.clear();
  }, [useWindowScroll]);

  const updateCardTransforms = useCallback(() => {
    const cards = cardsRef.current;
    if (!cards.length || !cardTopsRef.current.length) return;

    const scrollTop = scrollTopRef.current;
    const containerHeight = useWindowScroll
      ? window.innerHeight
      : (scrollerRef.current?.clientHeight ?? window.innerHeight);

    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(
      scaleEndPosition,
      containerHeight,
    );
    const endElementTop = endTopRef.current;
    const pinEnd = endElementTop - containerHeight / 2;

    cards.forEach((card, i) => {
      const cardTop = cardTopsRef.current[i] ?? 0;
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = cardTop - stackPositionPx - itemStackDistance * i;

      const scaleProgress = calculateProgress(
        scrollTop,
        triggerStart,
        triggerEnd,
      );
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount
        ? i * rotationAmount * scaleProgress
        : 0;

      let translateY = 0;
      if (scrollTop >= pinStart && scrollTop <= pinEnd) {
        translateY =
          scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY =
          pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      // Optional depth dim via opacity instead of blur (blur causes flicker).
      let opacity = 1;
      if (blurAmount > 0) {
        let topCardIndex = 0;
        for (let j = 0; j < cards.length; j++) {
          const jTop = cardTopsRef.current[j] ?? 0;
          const jTriggerStart =
            jTop - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) topCardIndex = j;
        }
        if (i < topCardIndex) {
          opacity = Math.max(0.55, 1 - (topCardIndex - i) * 0.12);
        }
      }

      const next: CardTransform = {
        translateY,
        scale,
        rotation,
      };

      const prev = lastTransformsRef.current.get(i);
      const changed =
        !prev ||
        Math.abs(prev.translateY - next.translateY) > 0.05 ||
        Math.abs(prev.scale - next.scale) > 0.0005 ||
        Math.abs(prev.rotation - next.rotation) > 0.05;

      if (changed) {
        card.style.transform = `translate3d(0, ${next.translateY}px, 0) scale(${next.scale}) rotate(${next.rotation}deg)`;
        card.style.opacity = String(opacity);
        lastTransformsRef.current.set(i, next);
      }

      if (i === cards.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    calculateProgress,
    parsePercentage,
  ]);

  const scheduleUpdate = useCallback(() => {
    if (rafScheduledRef.current) return;
    rafScheduledRef.current = true;
    animationFrameRef.current = requestAnimationFrame(() => {
      rafScheduledRef.current = false;
      updateCardTransforms();
    });
  }, [updateCardTransforms]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const cards = Array.from(
      scroller.querySelectorAll(".scroll-stack-card"),
    ) as HTMLElement[];
    cardsRef.current = cards;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.willChange = "transform, opacity";
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
    });

    cacheLayoutPositions();

    const setScrollTop = (value: number) => {
      scrollTopRef.current = value;
      scheduleUpdate();
    };

    const onResize = () => {
      cacheLayoutPositions();
      setScrollTop(
        useWindowScroll
          ? window.scrollY
          : (scrollerRef.current?.scrollTop ?? 0),
      );
      updateCardTransforms();
    };

    let lenis: Lenis | null = null;
    let removeScroll: (() => void) | undefined;

    if (useWindowScroll) {
      // Native window scroll is smoother on mobile touch than Lenis syncTouch.
      const isCoarse =
        typeof window !== "undefined" &&
        window.matchMedia("(pointer: coarse)").matches;

      if (isCoarse) {
        const onScroll = () => setScrollTop(window.scrollY);
        window.addEventListener("scroll", onScroll, { passive: true });
        removeScroll = () => window.removeEventListener("scroll", onScroll);
        setScrollTop(window.scrollY);
      } else {
        lenis = new Lenis({
          duration: 1.1,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          touchMultiplier: 1.5,
          infinite: false,
          wheelMultiplier: 1,
          lerp: 0.085,
          syncTouch: false,
        });
        lenis.on("scroll", ({ scroll }) => setScrollTop(scroll));
        const raf = (time: number) => {
          lenis?.raf(time);
          animationFrameRef.current = requestAnimationFrame(raf);
        };
        animationFrameRef.current = requestAnimationFrame(raf);
        lenisRef.current = lenis;
        setScrollTop(window.scrollY);
      }
    } else {
      lenis = new Lenis({
        wrapper: scroller,
        content: scroller.querySelector(".scroll-stack-inner") as HTMLElement,
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
        infinite: false,
        wheelMultiplier: 1,
        lerp: 0.085,
        syncTouch: false,
      });
      lenis.on("scroll", ({ scroll }) => setScrollTop(scroll));
      const raf = (time: number) => {
        lenis?.raf(time);
        animationFrameRef.current = requestAnimationFrame(raf);
      };
      animationFrameRef.current = requestAnimationFrame(raf);
      lenisRef.current = lenis;
      setScrollTop(scroller.scrollTop);
    }

    window.addEventListener("resize", onResize, { passive: true });
    updateCardTransforms();

    return () => {
      window.removeEventListener("resize", onResize);
      removeScroll?.();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lenisRef.current?.destroy();
      lenisRef.current = null;
      stackCompletedRef.current = false;
      cardsRef.current = [];
      lastTransformsRef.current.clear();
      rafScheduledRef.current = false;
    };
  }, [
    itemDistance,
    useWindowScroll,
    cacheLayoutPositions,
    scheduleUpdate,
    updateCardTransforms,
  ]);

  return (
    <div
      className={`scroll-stack-scroller${useWindowScroll ? " scroll-stack-scroller--window" : ""} ${className}`.trim()}
      ref={scrollerRef}
    >
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
}
