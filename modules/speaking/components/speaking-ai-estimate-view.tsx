"use client";

import Link from "next/link";
import {
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Quote,
  ShieldCheck,
} from "lucide-react";
import type {
  SpeakingFluencyMetrics,
  SpeakingPendingPayload,
} from "@/modules/speaking/types";
import {
  groupSpeakingTranscripts,
  speakingTranscriptStatus,
} from "@/modules/speaking/lib/speaking-transcript-groups";

type Props = {
  testNumber: number;
  payload: SpeakingPendingPayload;
  targetBand?: number | null;
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

export function SpeakingAiEstimateView({
  testNumber,
  payload,
  targetBand = 7,
}: Props) {
  const target = targetBand && targetBand > 0 ? targetBand : 7;
  const signature =
    payload.ai_evidence.find((item) => item.polarity === "weakness") ??
    payload.ai_evidence[0];
  const transcriptGroups = groupSpeakingTranscripts(payload.responses);
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
    <div className="min-h-dvh min-w-0 overflow-x-hidden bg-[#F4F7FB] text-ink">
      <header className="sticky top-0 z-30 border-b border-border-soft bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <div className="mx-auto flex min-h-14 max-w-6xl items-center gap-3 px-3 py-2 sm:h-16 sm:px-6 sm:py-0">
          <Link
            href={`/test/${testNumber}`}
            aria-label={`Back to Mock Test ${testNumber}`}
            className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-soft bg-surface-alt text-navy transition-colors hover:bg-cyan-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </Link>
          <p className="min-w-0 flex-1 truncate font-display text-base font-extrabold tracking-tight text-navy">
            Band<span className="text-cyan">Forge</span>
          </p>
          <p className="shrink-0 text-right font-mono text-[9px] uppercase leading-4 tracking-[0.08em] text-muted sm:text-xs sm:tracking-[0.12em]">
            Mock Test {testNumber}
            <span className="hidden sm:inline"> · Speaking</span>
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-8 lg:py-10">
        <section
          id="overview"
          className="scroll-mt-32 rounded-2xl border border-border-soft bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-7 sm:text-left">
            <div className="shrink-0">
              <p className="font-mono text-6xl font-medium leading-none tabular-nums text-cyan min-[360px]:text-7xl sm:text-8xl">
                {payload.ai_band?.toFixed(1)}
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                AI estimated band
              </p>
            </div>
            <div className="min-w-0 flex-1 border-border-soft sm:border-l sm:pl-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                <BrainCircuit className="size-3.5" aria-hidden />
                Under examiner review
              </div>
              <h1 className="mt-3 font-display text-2xl font-bold text-navy sm:text-3xl">
                Your Speaking evaluation
              </h1>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:mx-0">
                AI analysis is ready. This estimate and its evidence remain
                provisional until a certified examiner confirms the final report.
              </p>
            </div>
          </div>
        </section>

        <nav
          aria-label="Speaking report sections"
          className="-mx-3 overflow-x-auto border-y border-border-soft bg-white px-3 py-2 sm:mx-0 sm:rounded-xl sm:border"
        >
          <div className="flex min-w-max gap-1">
            {[
              ["overview", "Overview"],
              ["criteria", "Criteria"],
              ["parts", "By part"],
              ["transcript", "Transcript"],
              ["evidence", "Evidence"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={`#${href}`}
                className="inline-flex min-h-10 cursor-pointer items-center rounded-lg px-3 text-xs font-semibold text-muted transition-colors hover:bg-cyan-soft hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan"
              >
                {label}
              </a>
            ))}
          </div>
        </nav>

        <div className="grid min-w-0 gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)] lg:items-start">
          <div className="min-w-0 space-y-5 sm:space-y-6">
            <section
              id="criteria"
              className="scroll-mt-32 rounded-2xl border border-border-soft bg-white p-4 shadow-sm sm:p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-lg font-bold text-navy">
                  Criteria vs target
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
                  target {target.toFixed(1)}
                </span>
              </div>
              <div className="mt-5 space-y-5">
                {CRITERIA.map(([key, label, field]) => {
                  const value = payload.ai_criteria[field];
                  const gap = value == null ? null : value - target;
                  return (
                    <div key={key}>
                      <div className="mb-2 flex flex-col gap-1 min-[380px]:flex-row min-[380px]:items-baseline min-[380px]:justify-between min-[380px]:gap-3">
                        <p className="min-w-0 text-sm font-semibold text-navy">
                          {key}{" "}
                          <span className="font-normal text-muted">{label}</span>
                        </p>
                        <p className="shrink-0 font-mono text-sm text-navy">
                          {value == null ? "—" : value.toFixed(1)}
                          {gap != null ? (
                            <span
                              className={
                                gap >= 0
                                  ? "ml-2 text-emerald-700"
                                  : "ml-2 text-amber-700"
                              }
                            >
                              {gap >= 0 ? "on target" : `(${gap.toFixed(1)})`}
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <div className="relative h-2 rounded-full bg-slate-200">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-cyan"
                          style={{ width: `${((value ?? 0) / 9) * 100}%` }}
                        />
                        <div
                          className="absolute -inset-y-1 w-0.5 rounded bg-amber-500"
                          style={{ left: `${(target / 9) * 100}%` }}
                          aria-hidden
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {payload.ai_parts.length > 0 ? (
              <section id="parts" className="scroll-mt-32">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                  By part
                </h2>
                <div className="mt-3 space-y-3">
                  {payload.ai_parts.map((part) => (
                    <article
                      key={part.part}
                      className="min-w-0 rounded-2xl border border-border-soft bg-white p-4 shadow-sm sm:p-5"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="min-w-0 font-display font-bold text-navy">
                          Part {part.part} · {PART_LABELS[part.part] ?? "Speaking"}
                        </h3>
                        <span className="font-mono font-medium text-cyan">
                          ≈{part.band_estimate.toFixed(1)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {part.note}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <section
              id="transcript"
              aria-labelledby="full-transcript-heading"
              className="scroll-mt-32"
            >
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cyan">
                    Every recorded response
                  </p>
                  <h2
                    id="full-transcript-heading"
                    className="mt-1 font-display text-xl font-bold text-navy"
                  >
                    Full transcript
                  </h2>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-wide text-muted">
                  {payload.responses.length} answers
                </p>
              </div>

              {transcriptGroups.length > 0 ? (
                <div className="mt-4 space-y-6">
                  {transcriptGroups.map((group) => (
                    <section
                      key={group.part}
                      aria-labelledby={`transcript-part-${group.part}`}
                    >
                      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                        <h3
                          id={`transcript-part-${group.part}`}
                          className="font-display font-bold text-navy"
                        >
                          Part {group.part} · {group.label}
                        </h3>
                        <span className="text-xs text-muted">
                          {group.responses.length}{" "}
                          {group.responses.length === 1 ? "answer" : "answers"}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {group.responses.map((response) => {
                          const transcriptState = speakingTranscriptStatus(
                            response.transcription_status,
                          );
                          const transcript = response.transcript.trim();
                          return (
                            <article
                              key={response.id}
                              className="min-w-0 overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-soft bg-surface-alt px-4 py-3 sm:px-5">
                                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-cyan">
                                  Answer {response.sequence}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] text-muted">
                                    {durationLabel(response.duration_sec)}
                                  </span>
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                      transcriptState === "complete"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : transcriptState === "failed"
                                          ? "bg-rose-50 text-rose-700"
                                          : "bg-amber-50 text-amber-800"
                                    }`}
                                  >
                                    {transcriptState === "complete"
                                      ? "Transcribed"
                                      : transcriptState === "failed"
                                        ? "Unavailable"
                                        : "Processing"}
                                  </span>
                                </div>
                              </div>
                              <div className="min-w-0 px-4 py-4 sm:px-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">
                                  Question
                                </p>
                                <p className="mt-1 break-words text-sm font-semibold leading-relaxed text-navy [overflow-wrap:anywhere]">
                                  {response.prompt || "Speaking question"}
                                </p>
                                <div className="mt-4 min-w-0 rounded-xl border border-border-soft bg-[#FBFCFE] p-3 sm:p-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">
                                    Student answer
                                  </p>
                                  {transcriptState === "complete" ? (
                                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-[#334155] [overflow-wrap:anywhere]">
                                      {transcript ||
                                        "No speech was detected in this answer."}
                                    </p>
                                  ) : (
                                    <p
                                      className={`mt-2 text-sm leading-relaxed ${
                                        transcriptState === "failed"
                                          ? "text-rose-700"
                                          : "text-amber-800"
                                      }`}
                                    >
                                      {transcriptState === "failed"
                                        ? response.transcription_error ||
                                          "This answer could not be transcribed."
                                        : "This transcript is still being prepared."}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-border bg-white p-6 text-center">
                  <p className="text-sm text-muted">
                    Response transcripts are still being prepared.
                  </p>
                </div>
              )}
            </section>

            {signature ? (
              <section
                id="evidence"
                className="scroll-mt-32 rounded-2xl bg-navy p-4 text-white shadow-xl sm:p-6"
              >
                <div className="flex items-center gap-2 text-cyan-light">
                  <Quote className="size-4" aria-hidden />
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em]">
                    Signature analysis · Part {signature.part}
                  </p>
                </div>
                <h2 className="mt-2 font-display text-xl font-bold">
                  Your words, annotated
                </h2>
                <blockquote className="mt-4 break-words rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200 [overflow-wrap:anywhere]">
                  “{signature.quote}”
                </blockquote>
                <div
                  className={`mt-3 rounded-xl border-l-4 p-4 text-sm leading-relaxed ${
                    signature.polarity === "strength"
                      ? "border-emerald-400 bg-emerald-400/10 text-emerald-50"
                      : "border-[#F0708A] bg-[#F0708A]/10 text-rose-50"
                  }`}
                >
                  <p className="font-mono text-[10px] uppercase tracking-wide opacity-80">
                    {signature.criterion} ·{" "}
                    {signature.title || signature.issue || signature.polarity}
                  </p>
                  <p className="mt-2">
                    {signature.explanation || signature.suggestion}
                  </p>
                </div>
              </section>
            ) : null}

            {payload.ai_patterns.length > 0 ? (
              <section>
                <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                  Recurring patterns
                </h2>
                <div className="mt-3 space-y-2">
                  {payload.ai_patterns.map((pattern) => (
                    <article
                      key={`${pattern.criterion}-${pattern.pattern}`}
                      className="flex min-w-0 flex-col items-start gap-3 rounded-xl border border-border-soft bg-white p-4 min-[420px]:flex-row min-[420px]:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="break-words text-sm font-semibold text-navy [overflow-wrap:anywhere]">
                          {pattern.pattern}
                        </p>
                        {pattern.examples[0] ? (
                          <p className="mt-1 text-xs italic text-muted">
                            “{pattern.examples[0]}”
                          </p>
                        ) : null}
                      </div>
                      <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 font-mono text-[10px] text-rose-700">
                        {pattern.frequency}
                      </span>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="min-w-0 space-y-5 lg:sticky lg:top-20">
            <section className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm">
              <h2 className="font-display font-bold text-navy">Fluency stats</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {fluencyStats.map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border-soft bg-surface-alt p-3 text-center"
                  >
                    <p className="break-words font-mono text-lg font-medium text-navy sm:text-xl">
                      {value}
                    </p>
                    <p className="mt-1 text-[9px] uppercase tracking-wide text-muted">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="size-4" aria-hidden />
                <h2 className="font-display font-bold">Strengths</h2>
              </div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#334155] marker:text-emerald-600">
                {payload.ai_strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
              <div className="flex items-center gap-2 text-amber-900">
                <Clock3 className="size-4" aria-hidden />
                <h2 className="font-display font-bold">To improve</h2>
              </div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#334155] marker:text-amber-600">
                {payload.ai_improvements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            {payload.next_band_advice ? (
              <section className="rounded-2xl border border-cyan/25 bg-cyan-soft/50 p-5">
                <h2 className="font-display font-bold text-navy">
                  Your next 0.5 band
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                  {payload.next_band_advice}
                </p>
              </section>
            ) : null}

            <section className="rounded-2xl border border-border-soft bg-white p-5">
              <div className="flex items-center gap-2 text-teal">
                <ShieldCheck className="size-4" aria-hidden />
                <h2 className="text-sm font-bold">Examiner review in progress</h2>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Examiner identity, verified badge, final PDF and official report
                unlock only after approval.
              </p>
            </section>

            <div className="flex flex-col gap-2.5">
              <Link
                href={`/test/${testNumber}/speaking/pending?attempt=${encodeURIComponent(payload.attempt_id)}`}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-border bg-white px-5 text-center text-sm font-semibold text-navy transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
              >
                Examiner review status
              </Link>
              <Link
                href={`/test/${testNumber}`}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-cyan px-5 text-center text-sm font-bold text-white transition-colors hover:bg-brand-sky-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
              >
                Back to test
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
