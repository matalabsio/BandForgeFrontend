"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import type {
  SpeakingFluencyMetrics,
  SpeakingPendingPayload,
} from "@/modules/speaking/types";
import {
  groupSpeakingTranscripts,
  speakingTranscriptStatus,
} from "@/modules/speaking/lib/speaking-transcript-groups";
import {
  displayTranscript,
  isInsufficientSpeechPayload,
} from "@/modules/speaking/lib/meaningful-speech";
import { ieltsDescriptor } from "@/modules/speaking/lib/build-speaking-feedback";
import { SpeakingMockFooterCta } from "@/modules/speaking/components/report/speaking-mock-footer-cta";
import { CriteriaVsTargetBars } from "@/modules/speaking/components/report/criteria-vs-target-bars";
import { SpeakingReportHero } from "@/modules/speaking/components/report/speaking-report-hero";
import { SpeakingReportShell } from "@/modules/speaking/components/report/speaking-report-shell";

type Props = {
  testNumber: number;
  payload: SpeakingPendingPayload;
  targetBand?: number | null;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  backHref?: string | null;
  backLabel?: string;
  fallbackHref?: string | null;
  examinerStatusHref?: string;
};

const CRITERIA = [
  ["FC", "Fluency & Coherence", "fluency"],
  ["LR", "Lexical Resource", "lexical"],
  ["GRA", "Grammar Range & Accuracy", "grammar"],
  ["Pron", "Pronunciation", "pronunciation"],
] as const;

const PART_LABELS: Record<number, string> = {
  1: "Introduction",
  2: "Long Turn",
  3: "Discussion",
};

function metric(
  metrics: SpeakingFluencyMetrics | undefined,
  key: string,
  suffix = "",
): string {
  const value = metrics?.[key];
  if (typeof value !== "number") return "—";
  return `${Number.isInteger(value) ? value : value.toFixed(1)}${suffix}`;
}

function durationLabel(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function biggestGapLabel(
  target: number,
  criteria: SpeakingPendingPayload["ai_criteria"],
): string | null {
  let worst: { label: string; gap: number } | null = null;
  for (const [, label, field] of CRITERIA) {
    const value = criteria[field];
    if (value == null) continue;
    const gap = target - value;
    if (gap > 0 && (!worst || gap > worst.gap)) {
      worst = { label, gap };
    }
  }
  if (!worst) return null;
  return `${worst.label} is your biggest gap — closing it moves your overall toward Band ${target.toFixed(1)}.`;
}

export function SpeakingAiEstimateView({
  testNumber,
  payload,
  targetBand = 7,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  backHref,
  backLabel,
  fallbackHref,
  examinerStatusHref,
}: Props) {
  if (isInsufficientSpeechPayload(payload)) {
    return null;
  }

  const target = targetBand && targetBand > 0 ? targetBand : 7;
  const band = payload.ai_band ?? 0;
  const signature =
    payload.ai_evidence.find((item) => item.polarity === "weakness") ??
    payload.ai_evidence[0];
  const transcriptGroups = groupSpeakingTranscripts(payload.responses);
  const gapMessage = biggestGapLabel(target, payload.ai_criteria);
  const fluencyStats = [
    ["WPM", metric(payload.ai_fluency, "words_per_minute")],
    ["Speaking time", metric(payload.ai_fluency, "total_speaking_seconds", "s")],
    ["Long pauses", metric(payload.ai_fluency, "long_pauses")],
    [
      "Attempted",
      payload.ai_fluency.response_count != null &&
      payload.ai_fluency.questions_asked != null
        ? `${payload.ai_fluency.response_count}/${payload.ai_fluency.questions_asked}`
        : "—",
    ],
  ];

  return (
    <SpeakingReportShell
      metaLabel={`Mock Test ${testNumber} · Speaking · AI estimate`}
      backHref={backHref}
      backLabel={backLabel}
      fallbackHref={fallbackHref}
      footer={
        primaryActionLabel && onPrimaryAction ? (
          <SpeakingMockFooterCta
            label={primaryActionLabel}
            onClick={onPrimaryAction}
            secondaryLabel={secondaryActionLabel}
            onSecondary={onSecondaryAction}
          />
        ) : null
      }
    >
      <SpeakingReportHero
        band={band}
        descriptor={ieltsDescriptor(band)}
        mode="ai_estimate"
      />

      <div className="mx-auto grid w-full max-w-[1240px] gap-8 px-4 py-8 sm:px-6 md:px-8 lg:grid-cols-[minmax(280px,380px)_minmax(0,1fr)] lg:items-start lg:px-10 lg:py-10">
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start" aria-label="Score summary">
          <section aria-labelledby="ai-criteria-heading">
            <h2
              id="ai-criteria-heading"
              className="font-mono text-[11px] tracking-[0.12em] text-muted-light uppercase"
            >
              Criteria vs target
            </h2>
            <CriteriaVsTargetBars
              className="mt-3"
              targetBand={target}
              criteria={CRITERIA.map(([key, label, field]) => {
                const value = payload.ai_criteria[field];
                return {
                  key,
                  shortLabel: key,
                  label,
                  band: value ?? null,
                  targetGap: value == null ? null : Math.max(0, target - value),
                };
              })}
            />
          </section>

          {gapMessage ? (
            <section className="flex gap-3 rounded-2xl border border-amber-200 border-l-[3px] border-l-amber-500 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden />
              <p className="text-[13px] leading-relaxed text-navy">{gapMessage}</p>
            </section>
          ) : null}

          <section aria-labelledby="ai-fluency-heading">
            <h2
              id="ai-fluency-heading"
              className="font-mono text-[11px] tracking-[0.12em] text-muted-light uppercase"
            >
              Fluency stats
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-2.5">
              {fluencyStats.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-border-soft bg-white p-3 text-center shadow-soft"
                >
                  <dt className="text-[10px] font-semibold tracking-wide text-muted-light uppercase">
                    {label}
                  </dt>
                  <dd className="mt-1 font-mono text-lg font-medium tabular-nums text-navy">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {payload.ai_parts.length > 0 ? (
            <section aria-labelledby="ai-parts-heading">
              <h2
                id="ai-parts-heading"
                className="font-mono text-[11px] tracking-[0.12em] text-muted-light uppercase"
              >
                By part
              </h2>
              <div className="mt-3 space-y-2.5">
                {payload.ai_parts.map((part) => (
                  <article
                    key={part.part}
                    className="rounded-2xl border border-border-soft bg-white p-4 shadow-soft"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-[15px] font-bold text-navy">
                        Part {part.part} · {PART_LABELS[part.part] ?? "Speaking"}
                      </h3>
                      <span className="font-mono text-sm font-medium text-cyan">
                        ≈{part.band_estimate.toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted">{part.note}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-2xl border border-border-soft bg-white p-5">
            <div className="flex items-center gap-2 text-teal">
              <ShieldCheck className="size-4" aria-hidden />
              <h2 className="text-sm font-bold">Examiner review in progress</h2>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Final verification, PDF export, and the official report unlock after
              approval.
            </p>
            <Link
              href={
                examinerStatusHref ??
                `/test/${testNumber}/speaking/pending?attempt=${encodeURIComponent(payload.attempt_id)}`
              }
              className="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-border-soft bg-surface-alt px-4 text-sm font-semibold text-navy transition-colors hover:bg-white"
            >
              Examiner review status
            </Link>
          </section>
        </aside>

        <div className="min-w-0 space-y-8">
          {signature ? (
            <section className="rounded-[22px] bg-navy p-5 shadow-[0_20px_48px_rgba(13,31,60,0.28)] sm:p-7">
              <div>
                <p className="font-mono text-[11px] tracking-[0.14em] text-[#7FE3EF] uppercase">
                  Signature analysis
                </p>
                <h2 className="mt-1 font-display text-xl font-bold text-white sm:text-[23px]">
                  Your words, annotated
                </h2>
              </div>
              <blockquote className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5 text-[15px] leading-[2] font-light text-[#D8E1EE] [overflow-wrap:anywhere]">
                “{signature.quote}”
              </blockquote>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                <div
                  className={`min-w-0 flex-1 rounded-xl border border-l-[3px] p-4 ${
                    signature.polarity === "strength"
                      ? "border-emerald-200 border-l-emerald-500 bg-[#F4FBF7]"
                      : "border-[#F6D2C5] border-l-[#E8583A] bg-[#FDEEEA]"
                  }`}
                >
                  <p
                    className={`font-mono text-[10.5px] tracking-[0.08em] uppercase ${
                      signature.polarity === "strength" ? "text-emerald-700" : "text-[#C1441F]"
                    }`}
                  >
                    {signature.criterion} ·{" "}
                    {signature.title || signature.issue || signature.polarity}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#0D1F3C]">
                    {signature.explanation || signature.suggestion}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2.5 pt-1 sm:pt-2">
                  <span className="flex items-center gap-2 whitespace-nowrap text-[11.5px] text-[#9FB0C8]">
                    <span className="size-2.5 rounded-full bg-cyan" aria-hidden />
                    Strong
                  </span>
                  <span className="flex items-center gap-2 whitespace-nowrap text-[11.5px] text-[#9FB0C8]">
                    <span className="size-2.5 rounded-full bg-[#E8583A]" aria-hidden />
                    Needs work
                  </span>
                </div>
              </div>
            </section>
          ) : null}

          {payload.ai_patterns.length > 0 ? (
            <section aria-labelledby="ai-patterns-heading">
              <h2
                id="ai-patterns-heading"
                className="font-mono text-[11px] tracking-[0.12em] text-muted-light uppercase"
              >
                Recurring patterns
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {payload.ai_patterns.map((pattern) => (
                  <article
                    key={`${pattern.criterion}-${pattern.pattern}`}
                    className="rounded-2xl border border-border-soft bg-white p-4 shadow-soft"
                  >
                    <span className="rounded-full bg-rose-50 px-2.5 py-1 font-mono text-[10px] font-medium text-rose-700">
                      {pattern.frequency}
                    </span>
                    <p className="mt-3 text-sm font-semibold text-navy">{pattern.pattern}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2" aria-label="Examiner summary">
            <div className="rounded-2xl border border-emerald-200 border-l-[3px] border-l-emerald-500 bg-emerald-50 p-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-700" aria-hidden />
                <h2 className="font-display text-base font-bold text-navy">Strengths</h2>
              </div>
              <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-slate-700">
                {payload.ai_strengths.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-emerald-700" aria-hidden>
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-200 border-l-[3px] border-l-amber-500 bg-amber-50 p-5">
              <div className="flex items-center gap-2">
                <Clock3 className="size-4 text-amber-800" aria-hidden />
                <h2 className="font-display text-base font-bold text-navy">To improve</h2>
              </div>
              <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-slate-700">
                {payload.ai_improvements.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-amber-700" aria-hidden>
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {payload.next_band_advice ? (
            <section className="rounded-2xl border border-cyan/20 border-l-[3px] border-l-teal bg-cyan-soft/50 p-5">
              <h2 className="font-display text-base font-bold text-navy">
                Your next 0.5 band
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-700">
                {payload.next_band_advice}
              </p>
            </section>
          ) : null}

          {transcriptGroups.length > 0 ? (
            <section aria-labelledby="full-transcript-heading">
              <h2
                id="full-transcript-heading"
                className="font-display text-lg font-bold text-navy"
              >
                Full transcript
              </h2>
              <div className="mt-4 space-y-4">
                {transcriptGroups.map((group) => (
                  <section key={group.part}>
                    <h3 className="font-display font-bold text-navy">
                      Part {group.part} · {group.label}
                    </h3>
                    <div className="mt-3 space-y-3">
                      {group.responses.map((response) => {
                        const transcriptState = speakingTranscriptStatus(
                          response.transcription_status,
                        );
                        const transcript = displayTranscript(
                          response.transcript.trim(),
                        );
                        return (
                          <article
                            key={response.id}
                            className="rounded-2xl border border-border-soft bg-white p-4 shadow-soft"
                          >
                            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-cyan">
                              Answer {response.sequence}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-navy">
                              {response.prompt || "Speaking question"}
                            </p>
                            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#334155] [overflow-wrap:anywhere]">
                              {transcriptState === "complete"
                                ? transcript || "No speech was detected in this answer."
                                : "This transcript is still being prepared."}
                            </p>
                            <p className="mt-2 font-mono text-[10px] text-muted">
                              {durationLabel(response.duration_sec)}
                            </p>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </SpeakingReportShell>
  );
}
