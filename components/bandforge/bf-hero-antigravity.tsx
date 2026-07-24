"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Antigravity = dynamic(() => import("@/components/bandforge/antigravity"), {
  ssr: false,
});

const HERO_COLORS = ["#0097a7", "#00bcd4", "#0d1f3c"] as const;

const DESKTOP_CAPSULES = 200;
const DESKTOP_SPHERES = 70;

/** 20% fewer particles on small screens than desktop. */
const SMALL_CAPSULES = Math.round(DESKTOP_CAPSULES * 0.8);
const SMALL_SPHERES = Math.round(DESKTOP_SPHERES * 0.8);

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
    <div className="pointer-events-none absolute inset-0 z-0 motion-reduce:hidden" aria-hidden>
      <Antigravity
        capsuleCount={capsuleCount}
        sphereCount={sphereCount}
        magnetRadius={11}
        ringRadius={7}
        waveSpeed={0.18}
        waveAmplitude={0.85}
        particleSize={0.8}
        lerpSpeed={0.022}
        colors={[...HERO_COLORS]}
        autoAnimate
        particleVariance={0.35}
        pulseSpeed={1.2}
        fieldStrength={5}
        rotationSpeed={0.05}
      />
    </div>
  );
}
