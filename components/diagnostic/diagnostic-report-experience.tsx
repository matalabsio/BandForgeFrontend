"use client";

import Link from "next/link";
import { DiagnosticBandGapCard } from "@/components/diagnostic/ui/diagnostic-band-gap-card";
import { DiagnosticPerformanceSkillCard } from "@/components/diagnostic/ui/diagnostic-performance-skill-card";
import { BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import type { DiagnosticLatest } from "@/lib/diagnostic-latest-types";
import {
  coachingCopy,
  bandBarPercent,
  bandRange,
  skillLabel,
  skillStatuses,
  type SkillBands,
  type SkillKey,
} from "@/lib/diagnostic-performance";

const SKILL_ORDER: SkillKey[] = [
  "listening",
  "reading",
  "writing",
  "speaking",
];

type Props = {
  diagnostic: DiagnosticLatest;
  targetBand: number;
};

function toSkillBands(diagnostic: DiagnosticLatest): SkillBands {
  return {
    listening: diagnostic.listening_band,
    reading: diagnostic.reading_band,
    writing: diagnostic.writing_band,
    speaking: diagnostic.speaking_band,
  };
}

export function DiagnosticReportExperience({ diagnostic, targetBand }: Props) {
  const bands = toSkillBands(diagnostic);
  const statuses = skillStatuses(bands, targetBand);

  return (
    <div className="space-y-8">
      <header>
        <BfSectionEyebrow>Your baseline</BfSectionEyebrow>
        <BfSectionHeading className="mt-2">Diagnostic report</BfSectionHeading>
        <p className="mt-2 text-sm text-muted">
          Scores from your most recent diagnostic
          {diagnostic.completed_at
            ? ` · ${new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }).format(new Date(diagnostic.completed_at))}`
            : null}
        </p>
      </header>

      <DiagnosticBandGapCard bands={bands} targetBand={targetBand} />

      <section>
        <p className="mb-3 font-mono text-xs tracking-[0.1em] text-muted-light uppercase">
          Skill breakdown
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {SKILL_ORDER.map((key) => (
            <DiagnosticPerformanceSkillCard
              key={key}
              label={skillLabel(key)}
              bandRange={bandRange(bands[key])}
              status={statuses[key]}
              coaching={coachingCopy(statuses[key])}
              barPercent={bandBarPercent(bands[key])}
            />
          ))}
        </div>
      </section>

      <p className="text-sm text-muted">
        Want to refresh your plan?{" "}
        <Link href="/diagnostic" className="font-semibold text-cyan hover:underline">
          Retake diagnostic
        </Link>
      </p>
    </div>
  );
}
