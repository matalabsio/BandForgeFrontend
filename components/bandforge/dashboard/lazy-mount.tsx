"use client";

import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type Props = {
  children: ReactNode;
  /** Min height placeholder before mount to reduce layout shift */
  className?: string;
  /** Root margin for IntersectionObserver */
  rootMargin?: string;
};

/**
 * Mount children after idle or when near viewport — cuts first-paint GSAP/Motion work.
 */
export function LazyMount({
  children,
  className,
  rootMargin = "120px 0px",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    const el = ref.current;
    if (!el) return;

    let idleId: number | undefined;
    let cancelled = false;

    const activate = () => {
      if (cancelled) return;
      setReady(true);
    };

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              if (entries.some((e) => e.isIntersecting)) {
                activate();
                io?.disconnect();
              }
            },
            { rootMargin, threshold: 0.01 },
          )
        : null;

    if (io) io.observe(el);

    if (typeof requestIdleCallback !== "undefined") {
      idleId = requestIdleCallback(() => activate(), { timeout: 1800 });
    } else {
      idleId = window.setTimeout(activate, 400) as unknown as number;
    }

    return () => {
      cancelled = true;
      io?.disconnect();
      if (typeof cancelIdleCallback !== "undefined" && idleId != null) {
        cancelIdleCallback(idleId);
      } else if (idleId != null) {
        clearTimeout(idleId);
      }
    };
  }, [ready, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {ready ? children : null}
    </div>
  );
}
