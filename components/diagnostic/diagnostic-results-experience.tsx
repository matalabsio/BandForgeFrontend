"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Headphones,
  Mic,
  Pencil,
} from "lucide-react";
import { marketingSignInHref } from "@/components/bandforge/bf-marketing-auth-links";
import { DiagnosticChrome } from "@/components/diagnostic/diagnostic-chrome";
import { DiagnosticGapAnalysisCard } from "@/components/diagnostic/ui/diagnostic-gap-analysis-card";
import { DiagnosticPlanCompare } from "@/components/diagnostic/ui/diagnostic-plan-compare";
import { DiagnosticReportModuleCard } from "@/components/diagnostic/ui/diagnostic-report-module-card";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import { readDiagnosticLead } from "@/lib/diagnostic-lead";
import {
  readDiagnosticResults,
  type DiagnosticResultsSnapshot,
} from "@/lib/diagnostic-session";
import {
  highestImpactModule,
  listeningWeaknessCopy,
  readingWeaknessCopy,
  speakingWeaknessCopy,
  writingWeaknessCopy,
} from "@/lib/diagnostic-weakness-copy";
import { getMe } from "@/lib/auth";
import type { AuthUser } from "@/lib/session";
import { isAuthEnabled } from "@/lib/flags";

function bandLabel(band: number | null | undefined): string {
  if (band == null || band <= 0) return "—";
  return band.toFixed(1);
}

function isGuestUser(user: AuthUser | null): boolean {
  if (!isAuthEnabled) return true;
  return !user || user.role === "guest";
}

function authGatedHref(path: string, guest: boolean): string {
  return guest ? marketingSignInHref(path) : path;
}

function formatCompleted(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

function ResultsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-24 rounded-2xl bg-navy/8" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-28 rounded-2xl bg-navy/8" />
        <div className="h-28 rounded-2xl bg-navy/8" />
        <div className="h-28 rounded-2xl bg-navy/8" />
        <div className="h-28 rounded-2xl bg-navy/8" />
      </div>
    </div>
  );
}

export function DiagnosticResultsExperience() {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<DiagnosticResultsSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const guest = isGuestUser(user);
  const lead = useMemo(() => readDiagnosticLead(), [snapshot]);
  const completedLabel = snapshot ? formatCompleted(snapshot.completed_at) : null;

  const modules = useMemo(() => {
    if (!snapshot) return [];
    const review = snapshot.review;
    return [
      {
        key: "listening",
        label: "Listening",
        band: bandLabel(snapshot.listening_band),
        weakness: listeningWeaknessCopy(review?.listening),
        Icon: Headphones,
      },
      {
        key: "reading",
        label: "Reading",
        band: bandLabel(snapshot.reading_band),
        weakness: readingWeaknessCopy(review?.reading),
        Icon: BookOpen,
      },
      {
        key: "writing",
        label: "Writing",
        band: bandLabel(snapshot.writing_band),
        weakness: writingWeaknessCopy(snapshot.writing_band),
        Icon: Pencil,
      },
      {
        key: "speaking",
        label: "Speaking",
        band: bandLabel(snapshot.speaking_band),
        weakness: speakingWeaknessCopy(
          snapshot.speaking_band,
          snapshot.speaking_band != null,
        ),
        Icon: Mic,
      },
    ];
  }, [snapshot]);

  const impact = snapshot
    ? highestImpactModule({
        listening: snapshot.listening_band,
        reading: snapshot.reading_band,
        writing: snapshot.writing_band,
        speaking: snapshot.speaking_band,
      })
    : null;

  useEffect(() => {
    const cached = readDiagnosticResults();
    if (cached) {
      setSnapshot(cached);
      setLoading(false);
    } else {
      setError(
        "No diagnostic results yet. Complete the free diagnostic first.",
      );
      setLoading(false);
    }

    void getMe()
      .then((me) => setUser(me))
      .catch(() => null);
  }, []);

  const currentBand = snapshot?.aggregate_band ?? 0;
  const targetBand = lead?.targetBand ?? 7.0;
  const goalLabel = lead?.goalLabel ?? "your goal";

  return (
    <DiagnosticChrome variant="report">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        {loading ? (
          <ResultsSkeleton />
        ) : error ? (
          <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-border-soft bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
            <Link
              href={diagnosticPaths.landing}
              className="inline-flex min-h-[var(--spacing-touch)] cursor-pointer items-center justify-center rounded-full bg-cyan px-6 text-sm font-semibold text-white hover:bg-brand-sky-hover"
            >
              Start diagnostic
            </Link>
          </div>
        ) : snapshot ? (
          <div className="space-y-6 sm:space-y-8">
            {/* Mobile: stacked hero */}
            <div className="text-center sm:hidden">
              <p className="font-mono text-[10.5px] tracking-[0.16em] text-teal uppercase">
                Diagnostic complete
              </p>
              <h1 className="mt-2 font-display text-[26px] font-bold tracking-tight text-navy">
                Your Diagnostic Report
              </h1>
              <div className="mt-6 py-6">
                <p className="font-mono text-[92px] leading-[0.9] font-medium text-teal">
                  {bandLabel(snapshot.aggregate_band)}
                </p>
                <p className="mt-3.5 font-mono text-[11.5px] tracking-[0.14em] text-[#5A6B82] uppercase">
                  Estimated Band Score
                </p>
              </div>
            </div>

            {/* Desktop: side-by-side hero */}
            <div className="hidden border-b border-navy/8 pb-10 sm:flex sm:items-center sm:justify-between sm:gap-10">
              <div>
                <p className="font-mono text-[11px] tracking-[0.16em] text-teal uppercase">
                  Your results{completedLabel ? ` · ${completedLabel}` : ""}
                </p>
                <h1 className="mt-3 font-display text-[40px] leading-[1.05] font-bold tracking-tight text-navy">
                  Your Diagnostic
                  <br />
                  Report
                </h1>
              </div>
              <div className="flex shrink-0 flex-col items-center">
                <p className="font-mono text-[104px] leading-[0.85] font-medium text-teal">
                  {bandLabel(snapshot.aggregate_band)}
                </p>
                <p className="mt-3.5 font-mono text-[11.5px] tracking-[0.14em] text-[#5A6B82] uppercase">
                  Estimated Band Score
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              {modules.map((m) => (
                <DiagnosticReportModuleCard
                  key={m.key}
                  label={m.label}
                  band={m.band}
                  weakness={m.weakness}
                  Icon={m.Icon}
                />
              ))}
            </div>

            {currentBand > 0 ? (
              <DiagnosticGapAnalysisCard
                currentBand={currentBand}
                targetBand={targetBand}
                goalLabel={goalLabel}
                impactArea={impact?.label ?? "Writing Task Response"}
              />
            ) : null}

            <p className="text-center text-[12.5px] font-light text-[#6E83A0]">
              Based on your exact diagnostic results.
            </p>

            <DiagnosticPlanCompare planHref={authGatedHref("/plan", guest)} />
          </div>
        ) : null}
      </div>
    </DiagnosticChrome>
  );
}
