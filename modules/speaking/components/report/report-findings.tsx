import Link from "next/link";
import { CheckCircle2, Lightbulb, Sparkles } from "lucide-react";
import type { SpeakingFeedback } from "@/modules/speaking/types";
import { SPEAKING_COACHING_PATH } from "@/modules/speaking/lib/speaking-report-actions";

function Empty({ children }: { children: string }) {
  return (
    <p className="rounded-xl border border-border-soft bg-surface-alt p-4 text-xs text-muted" aria-live="polite">
      {children}
    </p>
  );
}

function patternFrequencyLabel(pattern: SpeakingFeedback["patterns"][number]): string {
  if (
    pattern.occurrence_count != null &&
    pattern.occurrence_count_semantics === "grounded_example_matches"
  ) {
    return `${pattern.occurrence_count} observed matches`;
  }
  return `Estimated frequency: ${pattern.frequency}`;
}

export function ReportFindings({ feedback }: { feedback: SpeakingFeedback }) {
  const weakestPart = feedback.parts
    .filter((part) => part.band_estimate != null)
    .reduce<SpeakingFeedback["parts"][number] | null>(
      (lowest, part) =>
        lowest == null ||
        (part.band_estimate ?? Number.POSITIVE_INFINITY) <
          (lowest.band_estimate ?? Number.POSITIVE_INFINITY)
          ? part
          : lowest,
      null,
    );
  const reviewerName = feedback.release.reviewer?.display_name;

  return (
    <div className="mt-8 space-y-7">
      <section aria-labelledby="patterns-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="patterns-heading" className="font-display text-lg font-bold text-navy">
            Recurring patterns
          </h2>
          <p className="text-[11px] text-muted">
            Estimated from the released analysis
          </p>
        </div>
        {feedback.patterns.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {feedback.patterns.map((pattern, index) => (
              <article key={`${pattern.criterion}-${pattern.pattern}-${index}`} className="rounded-2xl border border-border-soft bg-white p-4 shadow-soft">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-red-50 px-2.5 py-1 font-mono text-[10px] font-medium text-red-700">
                    {pattern.criterion}
                  </span>
                  <span className="text-[10px] font-semibold tracking-wide text-muted-light uppercase">
                    {patternFrequencyLabel(pattern)}
                  </span>
                </div>
                <h3 className="mt-3 text-[13px] font-semibold leading-snug text-navy">
                  {pattern.pattern}
                </h3>
                {pattern.examples.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-xs text-muted">
                    {pattern.examples.map((example, exampleIndex) => (
                      <li key={`${example}-${exampleIndex}`}>“{example}”</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-3"><Empty>Recurring patterns were not provided in this analysis.</Empty></div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Examiner summary">
        <div className="rounded-2xl border border-emerald-200 border-l-[3px] border-l-emerald-500 bg-emerald-50 p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-success" aria-hidden />
            <h2 className="font-display text-base font-bold text-navy">Strengths</h2>
          </div>
          {feedback.summary.strengths.length > 0 ? (
            <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-slate-700">
              {feedback.summary.strengths.map((item, index) => (
                <li key={`${item}-${index}`} className="flex gap-2">
                  <span className="text-success" aria-hidden>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-muted">No strengths summary was provided.</p>
          )}
        </div>

        <div className="rounded-2xl border border-amber-200 border-l-[3px] border-l-amber-500 bg-amber-50 p-5">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-warning" aria-hidden />
            <h2 className="font-display text-base font-bold text-navy">To improve</h2>
          </div>
          {feedback.summary.improvements.length > 0 ? (
            <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-slate-700">
              {feedback.summary.improvements.map((item, index) => (
                <li key={`${item}-${index}`} className="flex gap-2">
                  <span className="text-warning" aria-hidden>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-muted">No improvement summary was provided.</p>
          )}
        </div>
      </section>

      <section
        className="rounded-2xl border border-border-soft bg-surface-alt p-4 text-xs leading-relaxed text-muted"
        aria-label="Pronunciation score source"
      >
        <strong className="text-navy">Pronunciation score authority: human examiner.</strong>{" "}
        AI pronunciation observations are transcript-inferred and advisory only
        {feedback.pronunciationAdvisory.ai_confidence == null
          ? "."
          : ` (${Math.round(feedback.pronunciationAdvisory.ai_confidence * 100)}% model confidence).`}
      </section>

      {feedback.summary.vocabulary_highlights.length > 0 ? (
        <section className="rounded-2xl border border-border-soft bg-white p-5 shadow-soft" aria-labelledby="vocabulary-heading">
          <h2 id="vocabulary-heading" className="font-mono text-[10px] tracking-[0.14em] text-muted-light uppercase">
            Vocabulary highlights
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {feedback.summary.vocabulary_highlights.map((item, index) => (
              <li key={`${item}-${index}`} className="rounded-full bg-cyan-soft px-3 py-1.5 text-xs font-semibold text-teal">
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {feedback.summary.next_band_advice ? (
        <section className="rounded-2xl border border-cyan/20 border-l-[3px] border-l-teal bg-cyan-soft/50 p-5" aria-labelledby="advice-heading">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-teal" aria-hidden />
            <h2 id="advice-heading" className="font-display text-base font-bold text-navy">
              Your next 0.5 band
            </h2>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-700">
            {feedback.summary.next_band_advice}
          </p>
        </section>
      ) : null}

      {feedback.summary.public_examiner_note ? (
        <section className="rounded-2xl border border-border-soft bg-white p-5 shadow-soft" aria-labelledby="examiner-note-heading">
          <h2 id="examiner-note-heading" className="font-display text-base font-bold text-navy">
            Examiner note
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {feedback.summary.public_examiner_note}
          </p>
        </section>
      ) : null}

      {feedback.analysis.unavailable_sections.length > 0 ? (
        <p className="text-xs text-muted" role="status">
          Some analysis was unavailable: {feedback.analysis.unavailable_sections.join(", ")}.
        </p>
      ) : null}

      <section className="speaking-report-card rounded-2xl border border-cyan/20 bg-navy p-5 text-white sm:flex sm:items-center sm:justify-between sm:gap-6" aria-labelledby="coaching-heading">
        <div>
          <h2 id="coaching-heading" className="font-display text-lg font-bold">
            {weakestPart
              ? `Work on Part ${weakestPart.part}${reviewerName ? ` with ${reviewerName} directly` : ""}`
              : "Turn these findings into a practice plan"}
          </h2>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-[#D8E1EE]">
            Focus your coaching on the evidence and next-band priorities in this
            human-verified report.
          </p>
        </div>
        <Link
          href={SPEAKING_COACHING_PATH}
          className="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-cyan px-5 text-sm font-semibold text-navy transition-colors hover:bg-[#7FE3EF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:mt-0 sm:shrink-0 motion-reduce:transition-none"
        >
          Explore coaching options
        </Link>
      </section>
    </div>
  );
}
