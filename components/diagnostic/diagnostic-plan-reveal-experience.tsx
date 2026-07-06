"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, Target } from "lucide-react";
import { DiagnosticChrome } from "@/components/diagnostic/diagnostic-chrome";
import { DiagnosticBandGapCard } from "@/components/diagnostic/ui/diagnostic-band-gap-card";
import { DiagnosticPlanBundleCard } from "@/components/diagnostic/ui/diagnostic-plan-bundle-card";
import { DiagnosticStudyPlanLocked } from "@/components/diagnostic/ui/diagnostic-study-plan-locked";
import { DiagnosticTrustBadges } from "@/components/diagnostic/ui/diagnostic-trust-badges";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import { readDiagnosticLead } from "@/lib/diagnostic-lead";
import {
  DIAGNOSTIC_PLAN_BUNDLES,
  DIAGNOSTIC_STUDY_PLAN_WEEKS,
  recommendedBundleId,
} from "@/lib/diagnostic-plan-content";
import {
  initialsFromName,
  overallBandGap,
  type SkillBands,
  type SkillKey,
} from "@/lib/diagnostic-performance";
import {
  readDiagnosticResults,
  type DiagnosticResultsSnapshot,
} from "@/lib/diagnostic-session";
import { getSubscription } from "@/lib/payments";
import { aggregateBand } from "@/lib/diagnostic-scoring";

function PlanRevealSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 rounded-2xl bg-navy/8" />
      <div className="h-16 rounded-2xl bg-navy/8" />
      <div className="h-48 rounded-2xl bg-navy/8" />
      <div className="h-40 rounded-2xl bg-navy/8" />
      <div className="space-y-4">
        <div className="h-32 rounded-2xl bg-navy/8" />
        <div className="h-28 rounded-2xl bg-navy/8" />
      </div>
    </div>
  );
}

const SKILL_KEYS: SkillKey[] = ["listening", "reading", "writing", "speaking"];

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Student";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

type SummaryBarProps = {
  studentName: string;
  initials: string;
  targetBand: number;
};

function DiagnosticPlanSummaryBar({
  studentName,
  initials,
  targetBand,
}: SummaryBarProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E8EDF3] bg-white shadow-[0_2px_12px_rgba(13,31,60,0.05)] sm:rounded-2xl">
      {/* Mobile: centered 2-column */}
      <div className="flex sm:hidden">
        <div className="flex flex-1 flex-col items-center px-2.5 py-[11px] text-center">
          <span className="mb-0.5 text-[9.5px] font-medium tracking-[0.05em] text-[#94A3B8] uppercase">
            Student
          </span>
          <span className="text-[13px] font-bold text-[#0D1F3C]">
            {shortName(studentName)}
          </span>
        </div>
        <div className="w-px bg-[#EEF2F7]" aria-hidden />
        <div className="flex flex-1 flex-col items-center px-2.5 py-[11px] text-center">
          <span className="mb-0.5 text-[9.5px] font-medium tracking-[0.05em] text-[#94A3B8] uppercase">
            Target
          </span>
          <span className="text-[13px] font-bold text-[#0D1F3C]">
            Band{" "}
            <span className="font-mono font-medium text-[#0097A7]">
              {targetBand.toFixed(1)}
            </span>
          </span>
        </div>
      </div>

      {/* Desktop: horizontal with avatar */}
      <div className="hidden sm:flex sm:items-stretch">
        <div className="flex flex-1 items-center gap-3.5 px-[22px] py-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0D1F3C] font-display text-[15px] font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="mb-0.5 text-[11.5px] font-medium tracking-[0.06em] text-[#94A3B8] uppercase">
              Student
            </p>
            <p className="text-base font-semibold text-[#0D1F3C]">{studentName}</p>
          </div>
        </div>
        <div className="w-px bg-[#EEF2F7]" aria-hidden />
        <div className="flex flex-1 items-center gap-3.5 px-[22px] py-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-[#E6F7FA]">
            <Target className="size-[18px] text-[#0097A7]" strokeWidth={2} />
          </div>
          <div>
            <p className="mb-0.5 text-[11.5px] font-medium tracking-[0.06em] text-[#94A3B8] uppercase">
              Target band
            </p>
            <p className="text-base font-semibold text-[#0D1F3C]">
              Band{" "}
              <span className="font-mono font-medium text-[#0097A7]">
                {targetBand.toFixed(1)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

type RecommendationChipProps = {
  bundleName: string;
  targetBand: number;
  belowTargetCount: number;
};

function DiagnosticPlanRecommendationChip({
  bundleName,
  targetBand,
  belowTargetCount,
}: RecommendationChipProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#B6E9F0] bg-[#E6F7FA] px-3.5 py-2.5 sm:gap-3 sm:rounded-[14px] sm:px-5 sm:py-3.5">
      <Sparkles
        className="size-4 shrink-0 text-[#0097A7] sm:size-[18px]"
        strokeWidth={2}
      />
      <p className="text-[13px] leading-snug font-medium text-[#0E6E78] sm:text-[15px]">
        {belowTargetCount >= 3 ? (
          <>
            Every skill is below your Band {targetBand.toFixed(1)} target, so we
            recommend the{" "}
            <strong className="font-bold text-[#0D1F3C]">{bundleName}</strong> —
            it closes the gap across all four skills.
          </>
        ) : (
          <>
            <span className="sm:hidden">We recommend: </span>
            <span className="hidden sm:inline">Based on your diagnostic results, we recommend the </span>
            <strong className="font-bold text-[#0D1F3C]">{bundleName}</strong>
            <span className="hidden sm:inline">.</span>
          </>
        )}
      </p>
    </div>
  );
}

export function DiagnosticPlanRevealExperience() {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<DiagnosticResultsSnapshot | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);

  const lead = useMemo(() => readDiagnosticLead(), [snapshot]);
  const targetBand = lead?.targetBand ?? 7.0;

  const pendingHuman = snapshot?.review_status === "pending_human";
  const effectiveWritingBand =
    snapshot?.writingEvaluation?.writing_band ?? snapshot?.writing_band ?? null;

  const skillBands: SkillBands = useMemo(
    () => ({
      listening: snapshot?.listening_band ?? null,
      reading: snapshot?.reading_band ?? null,
      writing: effectiveWritingBand,
      speaking: pendingHuman ? null : (snapshot?.speaking_band ?? null),
    }),
    [snapshot, effectiveWritingBand, pendingHuman],
  );

  const currentBand = useMemo(() => {
    if (!snapshot) return 0;
    if (snapshot.aggregate_band != null && snapshot.aggregate_band > 0) {
      return snapshot.aggregate_band;
    }
    const partial = aggregateBand(
      snapshot.listening_band,
      snapshot.reading_band,
      effectiveWritingBand,
      pendingHuman ? null : snapshot.speaking_band,
    );
    return partial ?? 0;
  }, [snapshot, effectiveWritingBand, pendingHuman]);

  const gap = overallBandGap(currentBand, targetBand);

  const belowTargetCount = useMemo(
    () =>
      SKILL_KEYS.filter((k) => {
        const b = skillBands[k];
        return b != null && b > 0 && b < targetBand;
      }).length,
    [skillBands, targetBand],
  );

  const recommendedId = recommendedBundleId(belowTargetCount);
  const sortedBundles = useMemo(() => {
    const bundles = [...DIAGNOSTIC_PLAN_BUNDLES];
    return bundles.sort((a, b) => {
      if (a.id === recommendedId) return -1;
      if (b.id === recommendedId) return 1;
      return 0;
    });
  }, [recommendedId]);

  const recommendedBundle = DIAGNOSTIC_PLAN_BUNDLES.find(
    (b) => b.id === recommendedId,
  );

  useEffect(() => {
    const cached = readDiagnosticResults();
    if (cached) {
      setSnapshot(cached);
    }
    getSubscription()
      .then((sub) => setHasSubscription(Boolean(sub.is_active)))
      .catch(() => setHasSubscription(false));
    setLoading(false);
  }, []);

  const studentName = lead?.fullName ?? "Student";
  const initials = initialsFromName(studentName);

  return (
    <DiagnosticChrome variant="report">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {loading ? (
          <PlanRevealSkeleton />
        ) : !snapshot ? (
          <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-border-soft bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-[#5A6B82]">
              Complete the free diagnostic first to see your personalised study
              plan.
            </p>
            <Link
              href={diagnosticPaths.landing}
              className="inline-flex min-h-[var(--spacing-touch)] cursor-pointer items-center justify-center rounded-full bg-cyan px-6 text-sm font-semibold text-white hover:bg-brand-sky-hover"
            >
              Start diagnostic
            </Link>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <h1 className="font-display text-[26px] leading-[1.12] font-bold tracking-[-0.025em] text-[#0D1F3C] sm:text-[34px] sm:leading-tight">
              Your personalised study plan is ready.
            </h1>

            <DiagnosticPlanSummaryBar
              studentName={studentName}
              initials={initials}
              targetBand={targetBand}
            />

            <DiagnosticBandGapCard
              bands={skillBands}
              currentBand={currentBand}
              targetBand={targetBand}
              gap={gap}
            />

            <DiagnosticStudyPlanLocked
              weeks={DIAGNOSTIC_STUDY_PLAN_WEEKS}
              unlocked={hasSubscription}
            />

            {recommendedBundle ? (
              <DiagnosticPlanRecommendationChip
                bundleName={recommendedBundle.name}
                targetBand={targetBand}
                belowTargetCount={belowTargetCount}
              />
            ) : null}

            <div className="flex flex-col gap-3.5 sm:gap-3.5">
              {sortedBundles.map((bundle) => (
                <DiagnosticPlanBundleCard key={bundle.id} bundle={bundle} />
              ))}
            </div>

            <DiagnosticTrustBadges variant="plan" />
          </div>
        )}
      </div>
    </DiagnosticChrome>
  );
}
