"use client";

import MagicBento from "@/components/bandforge/dashboard/magic-bento";
import type { MagicBentoCardData } from "@/components/bandforge/dashboard/magic-bento-types";

type Props = {
  cards: MagicBentoCardData[];
};

/** Client island for GSAP MagicBento on the personalized dashboard. */
export function DashboardMagicBentoClient({ cards }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MagicBento
        cards={cards}
        textAutoHide
        enableStars
        enableSpotlight={false}
        enableBorderGlow
        enableTilt={false}
        enableMagnetism={false}
        clickEffect={false}
        spotlightRadius={280}
        particleCount={8}
        glowColor="0, 188, 212"
      />
    </div>
  );
}
