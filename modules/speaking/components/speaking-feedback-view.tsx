"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import {
  CheckCircle2,
  Lightbulb,
  Mic,
  Pause,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnnotatedText,
  annotationDotClass,
  type AnnotationSpan,
} from "@/modules/shared/annotations";
import type {
  SpeakingFeedback,
  SpeakingTranscriptHighlight,
} from "@/modules/speaking/types";

type Props = {
  testNumber: number;
  feedback: SpeakingFeedback;
};

function formatBand(score: number): string {
  return score.toFixed(1);
}

function toSpeakingAnnotations(
  highlights: SpeakingTranscriptHighlight[],
): AnnotationSpan[] {
  return highlights.map((h, i) => {
    const kind =
      h.kind ??
      (h.polarity === "strength" ? "evidence_strength" : "evidence_weakness");
    return {
      id: `s-${kind}-${i}`,
      text: h.text,
      kind,
      title: h.title ?? (h.polarity === "strength" ? "Strength" : "Needs work"),
      body: h.body ?? `${h.criterion} · ${h.polarity}`,
      suggestion: h.suggestion,
    };
  });
}

function HighlightedTranscript({
  text,
  highlights,
}: {
  text: string;
  highlights: SpeakingTranscriptHighlight[];
}) {
  const annotations = useMemo(
    () => toSpeakingAnnotations(highlights),
    [highlights],
  );
  return (
    <AnnotatedText
      text={text}
      annotations={annotations}
      emptyFallback={
        <p className="text-[13px] text-[#64748B]">Transcript not available.</p>
      }
    />
  );
}

export function SpeakingFeedbackView({ testNumber, feedback }: Props) {
  const metrics = feedback.fluency_metrics;
  const hasFluency = Boolean(metrics);

  const metricTiles = useMemo(() => {
    if (!metrics) return [];
    const tiles: Array<{ label: string; value: string; icon: ReactNode }> = [];
    if (metrics.words_per_minute != null) {
      tiles.push({
        label: "Words / min",
        value: String(Math.round(metrics.words_per_minute)),
        icon: <Timer className="size-3.5 text-cyan" aria-hidden />,
      });
    }
    if (metrics.total_speaking_seconds != null) {
      tiles.push({
        label: "Speaking time",
        value: `${Math.round(metrics.total_speaking_seconds)}s`,
        icon: <Mic className="size-3.5 text-cyan" aria-hidden />,
      });
    }
    if (metrics.long_pauses != null) {
      tiles.push({
        label: "Long pauses",
        value: String(metrics.long_pauses),
        icon: <Pause className="size-3.5 text-cyan" aria-hidden />,
      });
    }
    if (metrics.response_count != null) {
      tiles.push({
        label: "Responses",
        value: String(metrics.response_count),
        icon: <Mic className="size-3.5 text-cyan" aria-hidden />,
      });
    }
    return tiles;
  }, [metrics]);

  const legendKinds = useMemo(() => {
    const kinds = new Set(
      feedback.highlights.map(
        (h) =>
          h.kind ??
          (h.polarity === "strength" ? "evidence_strength" : "evidence_weakness"),
      ),
    );
    return (
      [
        ["evidence_strength", "Strength"],
        ["evidence_weakness", "Needs work"],
        ["pronunciation", "Pronunciation"],
        ["fluency_pause", "Pause"],
      ] as const
    ).filter(([k]) => kinds.has(k));
  }, [feedback.highlights]);

  return (
    <div className="min-h-dvh bg-surface-alt text-ink">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-start lg:gap-8">
          <div className="space-y-5">
            <section className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-[0.6875rem] tracking-wide text-cyan uppercase">
                  Speaking · Score report
                </p>
                {feedback.human_verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFEFF] px-2 py-0.5 text-[10px] font-semibold text-teal">
                    <ShieldCheck className="size-3" aria-hidden />
                    Human verified
                  </span>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap items-start gap-5 sm:gap-6">
                <div className="shrink-0">
                  <p className="font-display text-5xl leading-none font-bold text-cyan tabular-nums sm:text-6xl">
                    {formatBand(feedback.overall_band)}
                  </p>
                  <p className="mt-2 font-mono text-[0.625rem] tracking-[0.14em] text-muted-light uppercase">
                    Overall band
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="font-display text-lg leading-snug font-bold text-navy">
                    Speaking Feedback — Test {testNumber}
                  </h1>
                  <p className="mt-1 text-[0.8125rem] text-muted">
                    {feedback.student_name
                      ? `Reviewed for ${feedback.student_name} · `
                      : ""}
                    {feedback.evaluated_label}
                  </p>
                  {feedback.pronunciation_confidence_label ? (
                    <p className="mt-1 text-[12px] text-[#64748B]">
                      {feedback.pronunciation_confidence_label}
                    </p>
                  ) : null}
                  {feedback.submitted_at ? (
                    <p className="mt-1 text-[12px] text-[#64748B]">
                      Submitted{" "}
                      {new Date(feedback.submitted_at).toLocaleString()}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-cyan/25 bg-cyan-soft/40 px-3.5 py-2.5">
                <p className="text-[12.5px] font-medium text-[#0D1F3C]">
                  {feedback.criterion_gap_label}
                </p>
              </div>
            </section>

            <section
              className="grid grid-cols-2 gap-3 sm:gap-4"
              aria-label="Criterion scores"
            >
              {feedback.criteria.map((criterion) => (
                <div
                  key={criterion.key}
                  className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-3.5 shadow-sm"
                >
                  <p className="font-mono text-2xl font-medium tabular-nums text-cyan">
                    {formatBand(criterion.band)}
                  </p>
                  <p className="mt-1 text-[11px] font-medium leading-snug text-[#64748B]">
                    {criterion.label}
                  </p>
                </div>
              ))}
            </section>

            {feedback.part_cards.length > 0 ? (
              <section className="space-y-3" aria-label="Part performance">
                <h2 className="font-display text-[16px] font-bold text-[#0D1F3C]">
                  Part performance
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {feedback.part_cards.map((part) => (
                    <div
                      key={part.part}
                      className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-[12px] font-semibold text-[#64748B]">
                          Part {part.part}
                        </p>
                        <p className="font-mono text-lg font-medium tabular-nums text-cyan">
                          {formatBand(part.band_estimate)}
                        </p>
                      </div>
                      <p className="mt-2 text-[13px] leading-relaxed text-[#334155]">
                        {part.note}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {(feedback.transcript || feedback.audio_play_url) && (
              <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-[16px] font-bold text-[#0D1F3C]">
                    Transcript
                  </h2>
                  {legendKinds.length > 0 ? (
                    <div className="flex flex-wrap gap-3 text-[11px] text-[#64748B]">
                      {legendKinds.map(([kind, label]) => (
                        <span
                          key={kind}
                          className="inline-flex items-center gap-1"
                        >
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              annotationDotClass(kind),
                            )}
                            aria-hidden
                          />
                          {label}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                {feedback.audio_play_url ? (
                  <audio
                    className="mt-3 w-full"
                    controls
                    preload="metadata"
                    src={feedback.audio_play_url}
                  >
                    Your browser does not support audio playback.
                  </audio>
                ) : null}
                <div className="mt-4 max-h-[320px] overflow-y-auto rounded-lg bg-surface-alt/60 p-3">
                  {feedback.transcript ? (
                    <HighlightedTranscript
                      text={feedback.transcript}
                      highlights={feedback.highlights}
                    />
                  ) : (
                    <p className="text-[13px] text-[#64748B]">
                      Transcript not available for this attempt.
                    </p>
                  )}
                </div>
                {feedback.highlights.length > 0 ? (
                  <p className="mt-2 text-[11px] text-[#64748B]">
                    Hover or tap highlighted text to see why — criteria,
                    pronunciation, and long pauses.
                  </p>
                ) : null}
              </section>
            )}

            {hasFluency && metricTiles.length > 0 ? (
              <section aria-label="Fluency metrics">
                <h2 className="mb-3 font-display text-[16px] font-bold text-[#0D1F3C]">
                  Fluency snapshot
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {metricTiles.map((tile) => (
                    <div
                      key={tile.label}
                      className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-3 shadow-sm"
                    >
                      <div className="flex items-center gap-1.5">
                        {tile.icon}
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                          {tile.label}
                        </p>
                      </div>
                      <p className="mt-1.5 font-mono text-xl font-medium tabular-nums text-navy">
                        {tile.value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {feedback.patterns.length > 0 ? (
              <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
                <h2 className="font-display text-[16px] font-bold text-[#0D1F3C]">
                  Recurring patterns
                </h2>
                <ul className="mt-3 space-y-3">
                  {feedback.patterns.map((pattern) => (
                    <li
                      key={`${pattern.criterion}-${pattern.pattern}`}
                      className="rounded-lg border border-[#F1F5F9] bg-surface-alt/50 px-3 py-2.5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[13px] font-semibold text-[#0D1F3C]">
                          {pattern.pattern}
                        </p>
                        <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 font-mono text-[10px] text-[#64748B]">
                          {pattern.criterion} · {pattern.frequency}
                        </span>
                      </div>
                      {pattern.examples.length > 0 ? (
                        <p className="mt-1 text-[12px] text-[#64748B]">
                          e.g. {pattern.examples.slice(0, 3).join("; ")}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#BBF7D0] border-l-4 border-l-[#22C55E] bg-[#F0FDF4] p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#16A34A]" aria-hidden />
                  <h3 className="text-[14px] font-bold text-ink">Strengths</h3>
                </div>
                <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-[#334155]">
                  {feedback.strengths.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span
                        className="mt-2 size-1 shrink-0 rounded-full bg-[#22C55E]"
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-[#FDE68A] border-l-4 border-l-[#F59E0B] bg-[#FFFBEB] p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <Lightbulb className="size-4 text-[#D97706]" aria-hidden />
                  <h3 className="text-[14px] font-bold text-ink">To Improve</h3>
                </div>
                <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-[#334155]">
                  {feedback.improvements.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span
                        className="mt-2 size-1 shrink-0 rounded-full bg-[#F59E0B]"
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {feedback.vocabulary_highlights.length > 0 ? (
              <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
                  Vocabulary highlights
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {feedback.vocabulary_highlights.map((word) => (
                    <span
                      key={word}
                      className="rounded-full bg-[#ECFEFF] px-3 py-1 text-[12px] font-semibold text-teal"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-2xl border border-cyan/20 bg-cyan-soft/30 p-5 shadow-sm sm:p-6">
              <h3 className="font-display text-[18px] font-bold text-[#0D1F3C]">
                Next Band Advice
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[#334155]">
                {feedback.next_band_advice}
              </p>
              {feedback.reviewer_notes ? (
                <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-[12px] text-[#475569]">
                  Examiner note: {feedback.reviewer_notes}
                </p>
              ) : null}
            </section>
          </div>

          <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-[4.5rem]">
            <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-teal" aria-hidden />
                <p className="text-[12px] font-semibold text-teal">
                  Verified by trainer
                </p>
              </div>
              <p className="mt-2 text-[13px] text-[#475569]">
                Your overall band is human-verified. Criterion detail and
                transcript insights use AI evaluation where available.
              </p>
            </section>

            <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <Mic className="size-4 text-cyan" aria-hidden />
                <p className="text-[12px] font-semibold text-[#475569]">
                  Next step
                </p>
              </div>
              <div className="flex flex-col gap-2.5">
                <Link
                  href={`/test/${testNumber}/speaking`}
                  className={cn(
                    "inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-xl bg-cyan px-5 text-[14px] font-bold text-white transition-colors hover:bg-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan",
                  )}
                >
                  Retake Speaking Test
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-5 text-[14px] font-semibold text-[#334155] transition-colors hover:border-[#94A3B8] hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan"
                >
                  Back to Dashboard
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
