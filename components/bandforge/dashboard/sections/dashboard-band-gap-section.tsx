"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { LazyMount } from "@/components/bandforge/dashboard/lazy-mount";
import { BandGapTable } from "@/components/bandforge/dashboard/band-gap-table";
import type { SkillBands } from "@/lib/diagnostic-performance";

type Props = {
  bands: SkillBands;
  targetBand: number;
  isPartial?: boolean;
  scoredCount?: number;
};

export function DashboardBandGapSection({
  bands,
  targetBand,
  isPartial = false,
  scoredCount = 0,
}: Props) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);

  return (
    <motion.section
      ref={rootRef}
      className="relative"
      aria-labelledby="band-performance-heading"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-3">
        <h2
          id="band-performance-heading"
          className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl"
        >
          By skill
        </h2>
        <p className="mt-0.5 text-[13px] text-muted">
          {isPartial
            ? `${scoredCount} of 4 scored — pending skills stay compact`
            : "Now → grow → close → target for each skill"}
        </p>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-ink/8 bg-white p-4 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] sm:p-5 lg:p-6">
        <LazyMount className="min-h-[120px]">
          <BandGapTable bands={bands} targetBand={targetBand} animate />
        </LazyMount>
      </div>
    </motion.section>
  );
}
