"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CheckCircle2, Lightbulb, Mic, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  testNumber: number;
  studentName: string | null;
  humanBand: number;
  submittedAt: string | null;
  reviewerMessage: string | null;
};

type Criterion = {
  label: string;
  band: number;
};

function formatBand(score: number): string {
  return score.toFixed(1);
}

function criterionBands(overall: number): Criterion[] {
  const clamp = (value: number) => Math.max(0, Math.min(9, Math.round(value * 2) / 2));
  return [
    { label: "Fluency & Coherence", band: clamp(overall) },
    { label: "Lexical Resource", band: clamp(overall - 0.5) },
    { label: "Grammar Range & Accuracy", band: clamp(overall - 0.5) },
    { label: "Pronunciation", band: clamp(overall) },
  ];
}

function strengthsForBand(band: number): string[] {
  const list = [
    "Maintains understandable pace and sequence of ideas.",
    "Uses topic vocabulary that supports clarity.",
    "Keeps responses relevant to the cue and follow-up prompts.",
  ];
  if (band >= 7) {
    list[0] = "Speaks with consistent flow and clear progression of ideas.";
    list[1] = "Uses a wider range of topic-specific vocabulary naturally.";
  }
  return list;
}

function improvementsForBand(band: number): string[] {
  const list = [
    "Add one concrete example to each major point.",
    "Vary sentence openings to avoid repetitive rhythm.",
    "Use clearer signposting between ideas and conclusions.",
  ];
  if (band < 6) {
    list[0] = "Increase response length and development before concluding.";
    list[1] = "Reduce pauses by planning 2-3 key points before speaking.";
  }
  return list;
}

function nextBandAdvice(band: number): string {
  if (band >= 7) {
    return "You are close to the next band. Focus on lexical precision and deeper idea development in Part 2 to push higher.";
  }
  if (band >= 6) {
    return "Your base is solid. To move up, extend answers with specific examples and keep transitions smoother between ideas.";
  }
  return "Prioritise fluency first: practice timed answers with a simple point-example-conclusion structure for each response.";
}

export function SpeakingFeedbackView({
  testNumber,
  studentName,
  humanBand,
  submittedAt,
  reviewerMessage,
}: Props) {
  const criteria = useMemo(() => criterionBands(humanBand), [humanBand]);
  const strengths = useMemo(() => strengthsForBand(humanBand), [humanBand]);
  const improvements = useMemo(() => improvementsForBand(humanBand), [humanBand]);
  const advice = useMemo(() => nextBandAdvice(humanBand), [humanBand]);

  return (
    <div className="min-h-dvh bg-surface-alt text-ink">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-start lg:gap-8">
          <div className="space-y-5">
            <section className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm sm:p-6">
              <p className="font-mono text-[0.6875rem] tracking-wide text-cyan uppercase">
                Speaking · Human reviewed
              </p>
              <div className="mt-4 flex flex-wrap items-start gap-5 sm:gap-6">
                <div className="shrink-0">
                  <p className="font-display text-5xl leading-none font-bold text-cyan tabular-nums sm:text-6xl">
                    {formatBand(humanBand)}
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
                    {studentName ? `Reviewed for ${studentName} · ` : ""}
                    Verified by trainer
                  </p>
                  {submittedAt ? (
                    <p className="mt-1 text-[12px] text-[#64748B]">
                      Submitted {new Date(submittedAt).toLocaleString()}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3 sm:gap-4" aria-label="Criterion scores">
              {criteria.map((criterion) => (
                <div
                  key={criterion.label}
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

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#BBF7D0] border-l-4 border-l-[#22C55E] bg-[#F0FDF4] p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#16A34A]" aria-hidden />
                  <h3 className="text-[14px] font-bold text-ink">Strengths</h3>
                </div>
                <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-[#334155]">
                  {strengths.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-[#22C55E]" aria-hidden />
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
                  {improvements.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-[#F59E0B]" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-cyan/20 bg-cyan-soft/30 p-5 shadow-sm sm:p-6">
              <h3 className="font-display text-[18px] font-bold text-[#0D1F3C]">
                Next Band Advice
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[#334155]">{advice}</p>
              {reviewerMessage ? (
                <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-[12px] text-[#475569]">
                  Examiner note: {reviewerMessage}
                </p>
              ) : null}
            </section>
          </div>

          <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-[4.5rem]">
            <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-teal" aria-hidden />
                <p className="text-[12px] font-semibold text-teal">Verified by trainer</p>
              </div>
              <p className="mt-2 text-[13px] text-[#475569]">
                This speaking band is based on human review against IELTS descriptors.
              </p>
            </section>

            <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <Mic className="size-4 text-cyan" aria-hidden />
                <p className="text-[12px] font-semibold text-[#475569]">Next step</p>
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
                  className="inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-5 text-[14px] font-semibold text-[#334155] transition-colors hover:border-[#94A3B8] hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
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
