"use client";

import { useEffect, useMemo, useState } from "react";
import MagicBento from "@/components/bandforge/dashboard/magic-bento";
import type { MagicBentoCardData } from "@/components/bandforge/dashboard/magic-bento-types";
import {
  recomputeFocusBentoCard,
  type DashboardFocusRecomputeInput,
} from "@/lib/build-dashboard-bento-cards";
import {
  PLAN_DAY_TASKS_UPDATED_EVENT,
  readPlanDayTasks,
} from "@/lib/plan-day-tasks";

type Props = {
  cards: MagicBentoCardData[];
  focusInput?: DashboardFocusRecomputeInput | null;
};

/** Client island for GSAP MagicBento on the personalized dashboard. */
export function DashboardMagicBentoClient({ cards, focusInput }: Props) {
  const [cacheVersion, setCacheVersion] = useState(0);

  useEffect(() => {
    const bump = () => setCacheVersion((v) => v + 1);
    window.addEventListener(PLAN_DAY_TASKS_UPDATED_EVENT, bump);
    return () => window.removeEventListener(PLAN_DAY_TASKS_UPDATED_EVENT, bump);
  }, []);

  const mergedCards = useMemo(() => {
    if (!focusInput) return cards;
    void cacheVersion;
    void readPlanDayTasks();
    return cards.map((card) => recomputeFocusBentoCard(card, focusInput));
  }, [cards, focusInput, cacheVersion]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MagicBento
        cards={mergedCards}
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
