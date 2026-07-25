"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/** Soft floating light blobs — replaces playful particle field. */
export function BfHeroAmbient({ reduceMotion }: { reduceMotion: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduceMotion) return;

    const blobs = root.querySelectorAll<HTMLElement>("[data-hero-blob]");
    const ctx = gsap.context(() => {
      blobs.forEach((blob, i) => {
        gsap.to(blob, {
          y: i % 2 === 0 ? -8 : 8,
          x: i % 2 === 0 ? 6 : -5,
          duration: 20 + i * 3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });
    }, root);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden motion-reduce:hidden"
      aria-hidden
    >
      <div
        data-hero-blob
        className="absolute top-[12%] left-[8%] size-[min(42vw,380px)] rounded-full bg-[rgb(14_165_233/0.05)] blur-[120px]"
      />
      <div
        data-hero-blob
        className="absolute top-[40%] right-[6%] size-[min(36vw,320px)] rounded-full bg-[rgb(34_211_238/0.05)] blur-[120px]"
      />
      <div
        data-hero-blob
        className="absolute bottom-[8%] left-[30%] size-[min(40vw,360px)] rounded-full bg-[rgb(0_151_167/0.05)] blur-[120px]"
      />
    </div>
  );
}
