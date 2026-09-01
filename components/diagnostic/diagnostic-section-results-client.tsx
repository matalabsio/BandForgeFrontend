"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import { loadDiagnosticPack, type DiagnosticPack } from "@/lib/diagnostic-pack";
import {
  diagnosticPackToModuleReview,
  scoreListeningModule,
  scoreReadingModule,
} from "@/lib/diagnostic-scoring";
import { readDiagnosticResults } from "@/lib/diagnostic-session";
import { readDiagnosticProgress } from "@/lib/diagnostic-storage";
import { PracticeSectionResultsClient } from "@/modules/results/components/practice-section-results-client";
import { SectionResultsShell } from "@/modules/shared/components/section-results";

type Module = "listening" | "reading";

type Props = {
  module: Module;
  /** When true, load review from completed snapshot (post-diagnostic revisit). */
  fromCompleted?: boolean;
};

const COPY: Record<
  Module,
  {
    title: string;
    subtitle: (total: number) => string;
    continueLabel: string;
    continueHref: string;
    backHref: string;
    examHref: string;
  }
> = {
  listening: {
    title: "Diagnostic · Listening",
    subtitle: (total) => `${total} questions · Listening`,
    continueLabel: "Continue to Reading",
    continueHref: diagnosticPaths.reading,
    backHref: diagnosticPaths.listening,
    examHref: diagnosticPaths.listening,
  },
  reading: {
    title: "Diagnostic · Reading",
    subtitle: (total) => `${total} questions · Reading`,
    continueLabel: "Continue to Writing",
    continueHref: diagnosticPaths.writing,
    backHref: diagnosticPaths.reading,
    examHref: diagnosticPaths.reading,
  },
};

function resolveReviewPayload(
  pack: DiagnosticPack,
  module: Module,
  fromCompleted: boolean,
) {
  const questions =
    module === "listening" ? pack.listening.questions : pack.reading.questions;

  if (fromCompleted) {
    const snapshot = readDiagnosticResults();
    const stored = snapshot?.review?.[module]?.questions;
    if (stored?.length) {
      return {
        rawScore: stored.filter((q) => q.is_correct).length,
        total: stored.length,
        questions: stored,
      };
    }
    return null;
  }

  const progress = readDiagnosticProgress();
  if (!progress) return null;

  const answers =
    module === "listening" ? progress.answers.listening : progress.answers.reading;

  const storedQuestions = progress.review?.[module]?.questions;
  if (storedQuestions?.length) {
    return {
      rawScore: storedQuestions.filter((q) => q.is_correct).length,
      total: storedQuestions.length,
      questions: storedQuestions,
    };
  }

  if (Object.keys(answers).length === 0) return null;

  const scores =
    module === "listening"
      ? scoreListeningModule(questions, answers)
      : scoreReadingModule(questions, answers);

  return {
    rawScore: scores.raw,
    total: scores.total,
    questions: diagnosticPackToModuleReview(questions, answers),
  };
}

export function DiagnosticSectionResultsClient({
  module,
  fromCompleted = false,
}: Props) {
  const [pack, setPack] = useState<DiagnosticPack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void loadDiagnosticPack()
      .then((data) => {
        if (!cancelled) setPack(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load diagnostic.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const payload = useMemo(() => {
    if (!pack) return null;
    return resolveReviewPayload(pack, module, fromCompleted);
  }, [pack, module, fromCompleted]);

  const meta = COPY[module];

  if (loading) {
    return (
      <SectionResultsShell centered>
        <p className="font-display text-base font-bold text-navy">Loading your results…</p>
      </SectionResultsShell>
    );
  }

  if (error || !pack || !payload || payload.questions.length === 0) {
    return (
      <SectionResultsShell centered>
        <p className="max-w-sm text-center text-sm text-muted">
          {error ?? "Open this page right after submitting your diagnostic section."}
        </p>
        <Link href={meta.examHref} className="mt-4 text-sm font-semibold text-cyan">
          Back to {module === "listening" ? "Listening" : "Reading"}
        </Link>
      </SectionResultsShell>
    );
  }

  return (
    <PracticeSectionResultsClient
      module={module}
      title={meta.title}
      subtitle={meta.subtitle(payload.total)}
      rawScore={payload.rawScore}
      total={payload.total}
      questions={payload.questions}
      backHref={fromCompleted ? diagnosticPaths.results : meta.backHref}
      primaryHref={fromCompleted ? diagnosticPaths.results : meta.continueHref}
      primaryLabel={fromCompleted ? "Back to diagnostic results" : meta.continueLabel}
    />
  );
}
