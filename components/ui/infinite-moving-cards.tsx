"use client";

import { cn } from "@/lib/utils";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

export type InfiniteMovingCardItem = {
  quote: string;
  name: string;
  title: string;
};

type InfiniteMovingCardsProps = {
  items: InfiniteMovingCardItem[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  /** Drag / swipe to scrub left–right (cursor + touch) */
  interactive?: boolean;
  className?: string;
  itemClassName?: string;
  variant?: "light" | "glass";
};

const SPEED_PX: Record<"fast" | "normal" | "slow", number> = {
  fast: 0.55,
  normal: 0.35,
  slow: 0.22,
};

const AXIS_LOCK_PX = 10;

type AxisLock = "none" | "horizontal" | "vertical";

export function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  interactive = true,
  className,
  itemClassName,
  variant = "light",
}: InfiniteMovingCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const offsetRef = useRef(0);
  const halfWidthRef = useRef(0);
  const rafRef = useRef(0);
  const draggingRef = useRef(false);
  const axisLockRef = useRef<AxisLock>("none");
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const lastXRef = useRef(0);
  const pausedRef = useRef(false);
  const offscreenRef = useRef(false);
  const activePointerRef = useRef<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  const glass = variant === "glass";
  const loopItems = [...items, ...items];

  const measure = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    halfWidthRef.current = scroller.scrollWidth / 2;
  }, []);

  const wrapOffset = useCallback(() => {
    const half = halfWidthRef.current;
    if (half <= 0) return;
    let o = offsetRef.current;
    while (o <= -half) o += half;
    while (o > 0) o -= half;
    offsetRef.current = o;
  }, []);

  const applyTransform = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.style.transform = `translate3d(${offsetRef.current}px,0,0)`;
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (scrollerRef.current) ro.observe(scrollerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, items]);

  /* Pause autoplay when offscreen */
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        offscreenRef.current = !(entry?.isIntersecting ?? false);
      },
      { rootMargin: "10% 0px", threshold: 0 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      offsetRef.current = 0;
      applyTransform();
      return;
    }

    const dir = direction === "left" ? -1 : 1;
    const px = SPEED_PX[speed];

    const tick = () => {
      const scrubbing =
        draggingRef.current || axisLockRef.current === "horizontal";
      if (!scrubbing && !pausedRef.current && !offscreenRef.current) {
        offsetRef.current += dir * px;
        wrapOffset();
        applyTransform();
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [direction, speed, reduceMotion, applyTransform, wrapOffset]);

  const resetPointer = (pointerId?: number) => {
    draggingRef.current = false;
    axisLockRef.current = "none";
    activePointerRef.current = null;
    if (pointerId != null && containerRef.current) {
      try {
        containerRef.current.releasePointerCapture(pointerId);
      } catch {
        /* already released */
      }
    }
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || reduceMotion) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    activePointerRef.current = e.pointerId;
    axisLockRef.current = "none";
    draggingRef.current = false;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    lastXRef.current = e.clientX;
    /* Do not capture yet — wait for axis lock */
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerRef.current !== e.pointerId) return;

    const dxTotal = e.clientX - startXRef.current;
    const dyTotal = e.clientY - startYRef.current;

    if (axisLockRef.current === "none") {
      const adx = Math.abs(dxTotal);
      const ady = Math.abs(dyTotal);
      if (adx < AXIS_LOCK_PX && ady < AXIS_LOCK_PX) return;

      if (adx > ady) {
        axisLockRef.current = "horizontal";
        draggingRef.current = true;
        lastXRef.current = e.clientX;
        containerRef.current?.setPointerCapture(e.pointerId);
      } else {
        axisLockRef.current = "vertical";
        /* Let the browser scroll the page — never capture */
        activePointerRef.current = null;
        return;
      }
    }

    if (axisLockRef.current === "vertical") return;
    if (axisLockRef.current !== "horizontal" || !draggingRef.current) return;

    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    offsetRef.current += dx;
    wrapOffset();
    applyTransform();
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerRef.current !== e.pointerId && !draggingRef.current) {
      return;
    }
    resetPointer(e.pointerId);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 w-full overflow-hidden select-none [touch-action:pan-y] [mask-image:linear-gradient(to_right,transparent,white_8%,white_92%,transparent)]",
        interactive && !reduceMotion && "cursor-grab active:cursor-grabbing",
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={(e) => {
        if (draggingRef.current && axisLockRef.current === "horizontal") {
          endDrag(e);
        }
      }}
      onMouseEnter={() => {
        if (pauseOnHover) pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      role="region"
      aria-label="Testimonials carousel — swipe horizontally to scrub, scroll vertically to continue"
    >
      <ul
        ref={scrollerRef}
        className="flex w-max min-w-full shrink-0 flex-nowrap gap-3 py-2 will-change-transform sm:gap-4 sm:py-3"
        style={{ transform: "translate3d(0,0,0)" }}
      >
        {loopItems.map((item, idx) => (
          <li
            className={cn(
              "relative w-[min(82vw,300px)] shrink-0 select-none rounded-2xl px-5 py-5 sm:w-[340px] sm:px-7 sm:py-6 md:w-[400px] lg:w-[420px]",
              glass
                ? "border border-white/15 bg-[linear-gradient(165deg,rgb(255_255_255/0.14)_0%,rgb(255_255_255/0.05)_100%)] shadow-[0_18px_44px_-16px_rgb(0_0_0/0.5),0_6px_16px_-8px_rgb(0_0_0/0.3),inset_0_1px_0_rgb(255_255_255/0.28)] backdrop-blur-[20px]"
                : "border border-zinc-200 bg-[linear-gradient(180deg,#fafafa,#f5f5f5)]",
              itemClassName,
            )}
            key={`${item.name}-${item.title}-${idx}`}
          >
            <blockquote>
              <span
                className={cn(
                  "relative z-20 text-[0.8125rem] leading-[1.65] font-normal sm:text-sm",
                  glass ? "text-white/90" : "text-neutral-800",
                )}
              >
                {item.quote}
              </span>
              <div className="relative z-20 mt-5 flex flex-row items-center sm:mt-6">
                <span className="flex flex-col gap-0.5">
                  <span
                    className={cn(
                      "text-sm leading-[1.6] font-medium",
                      glass ? "text-white" : "text-neutral-700",
                    )}
                  >
                    {item.name}
                  </span>
                  <span
                    className={cn(
                      "text-[0.8125rem] leading-[1.6] font-normal sm:text-sm",
                      glass ? "text-[#94A3B8]" : "text-neutral-500",
                    )}
                  >
                    {item.title}
                  </span>
                </span>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
}
