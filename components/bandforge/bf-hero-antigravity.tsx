"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Antigravity = dynamic(() => import("@/components/bandforge/antigravity"), {
  ssr: false,
});

const HERO_COLORS = [
  "#0097a7",
  "#ffffff",
  "#0097a7",
  "#DC143C",
  "#252525",
] as const;

const DESKTOP_CAPSULES = 250;
const DESKTOP_SPHERES = 100;
/** ~30% fewer particles on small screens for performance. */
const SMALL_CAPSULES = Math.round(DESKTOP_CAPSULES * 0.7);
const SMALL_SPHERES = Math.round(DESKTOP_SPHERES * 0.7);

const SMALL_SCREEN_MQ = "(max-width: 767px)";

function useSmallScreenParticleScale() {
  const [isSmall, setIsSmall] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(SMALL_SCREEN_MQ).matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(SMALL_SCREEN_MQ);
    const update = () => setIsSmall(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isSmall;
}

/** Full-bleed Antigravity canvas for the marketing hero only. */
export function BfHeroAntigravity() {
  const isSmall = useSmallScreenParticleScale();
  const capsuleCount = isSmall ? SMALL_CAPSULES : DESKTOP_CAPSULES;
  const sphereCount = isSmall ? SMALL_SPHERES : DESKTOP_SPHERES;

  return (
    <div className="absolute inset-0 z-0 motion-reduce:hidden" aria-hidden>
      <Antigravity
        capsuleCount={capsuleCount}
        sphereCount={sphereCount}
        magnetRadius={11}
        ringRadius={7}
        waveSpeed={0.28}
        waveAmplitude={1.2}
        particleSize={0.8}
        lerpSpeed={0.035}
        colors={[...HERO_COLORS]}
        autoAnimate
        particleVariance={0.5}
        pulseSpeed={1.8}
        fieldStrength={5}
        rotationSpeed={0.08}
      />
    </div>
  );
}
