"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnnotatedText } from "@/modules/shared/annotations";
import type {
  SpeakingFluencyMetrics,
  SpeakingPartReport,
  SpeakingResponseReport,
} from "@/modules/speaking/types";
import {
  formatMetricValue,
  nextReportTab,
  responseAnnotations,
} from "@/modules/speaking/components/report/report-helpers";

const FLUENCY_STATS = [
  { key: "words_per_minute", label: "Words per minute" },
  { key: "total_speaking_seconds", label: "Speaking time" },
  { key: "long_pauses", label: "Long pauses" },
  { key: "word_count", label: "Word count" },
  { key: "response_count", label: "Responses" },
  { key: "questions_asked", label: "Questions asked" },
] as const;

function metricDisplay(
  key: (typeof FLUENCY_STATS)[number]["key"],
  value: number | string | boolean | null | undefined,
): string {
  if (value == null) return "Not available";
  if (key === "total_speaking_seconds" && typeof value === "number") {
    const minutes = Math.floor(value / 60);
    const seconds = Math.round(value % 60);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }
  return formatMetricValue(value);
}

function Metrics({ metrics }: { metrics?: SpeakingFluencyMetrics | null }) {
  const availableCount = FLUENCY_STATS.filter(
    ({ key }) => metrics?.[key] !== null && metrics?.[key] !== undefined,
  );

  return (
    <div>
      {availableCount.length === 0 ? (
        <p className="mb-3 rounded-xl border border-border-soft bg-surface-alt p-3 text-xs text-muted" role="status">
          Measured fluency data is unavailable for this selection.
        </p>
      ) : null}
      <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {FLUENCY_STATS.map(({ key, label }) => (
          <div key={key} className="rounded-xl border border-border-soft bg-white p-3 text-center shadow-soft">
            <dt className="text-[10px] font-semibold tracking-wide text-muted-light uppercase">
              {label}
            </dt>
            <dd
              className={`mt-1 font-mono text-lg font-medium tabular-nums ${
                metrics?.[key] == null ? "text-muted-light" : "text-navy"
              }`}
            >
              {metricDisplay(key, metrics?.[key])}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ResponseAnalysis({ response }: { response: SpeakingResponseReport }) {
  const annotations = useMemo(() => responseAnnotations(response), [response]);
  return (
    <article className="speaking-report-card rounded-2xl border border-white/10 bg-white/[0.055] p-4 sm:p-5">
      <header>
        <p className="font-mono text-[10px] tracking-[0.12em] text-[#7FE3EF] uppercase">
          Response {response.sequence_number}
        </p>
        <h3 className="mt-1 font-display text-base leading-snug font-bold text-white">
          {response.prompt}
        </h3>
      </header>

      {response.audioUrl ? (
        <div className="speaking-report-audio mt-4">
          <p id={`audio-${response.id}`} className="mb-2 text-xs font-medium text-[#D8E1EE]">
            Your recording for response {response.sequence_number}
          </p>
          <audio
            className="min-h-11 w-full rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
            controls
            preload="metadata"
            src={response.audioUrl}
            aria-labelledby={`audio-${response.id}`}
          >
            Your browser does not support audio playback.
          </audio>
        </div>
      ) : (
        <p className="speaking-report-audio mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-[#9FB0C8]" aria-live="polite">
          Audio is unavailable for this response.
        </p>
      )}

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
        {response.transcript?.trim() ? (
          <AnnotatedText
            text={response.transcript}
            annotations={annotations}
            theme="dark"
            className="text-[15px] leading-[2] font-light"
          />
        ) : (
          <p className="text-xs text-[#9FB0C8]" aria-live="polite">
            Transcript is unavailable for this response.
          </p>
        )}
      </div>

      {annotations.length > 0 ? (
        <p className="speaking-report-interactive-hint mt-2 text-[11px] text-[#9FB0C8]">
          Select an underlined passage for examiner evidence. Keyboard: Tab to a passage,
          Enter to open, Escape to close.
        </p>
      ) : (
        <p className="mt-2 text-[11px] text-[#9FB0C8]" aria-live="polite">
          No transcript evidence was provided for this response.
        </p>
      )}

      {response.pauseMarkers.length > 0 ? (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-white">Recorded pause markers</h4>
          <ul className="mt-2 flex flex-wrap gap-2">
            {response.pauseMarkers.map((marker, index) => (
              <li key={`${marker.start_ms ?? marker.after_word ?? "pause"}-${index}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] text-[#D8E1EE]">
                {marker.after_word ? `After “${marker.after_word}”` : "Pause"}
                {marker.gap_sec != null ? ` · ${marker.gap_sec.toFixed(1)}s` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {response.metrics ? (
        <div className="mt-4 border-t border-white/10 pt-4">
          <h4 className="mb-2 text-xs font-semibold text-white">Response metrics</h4>
          <Metrics metrics={response.metrics} />
        </div>
      ) : null}
    </article>
  );
}

function PrintableAnalysis({ parts }: { parts: SpeakingPartReport[] }) {
  return (
    <section
      className="speaking-report-print-only rounded-[22px] bg-navy p-7 text-[#D8E1EE]"
      aria-label="Complete Speaking transcript"
    >
      <p className="font-mono text-[10px] tracking-[0.14em] text-[#7FE3EF] uppercase">
        Signature analysis
      </p>
      <h2 className="mt-1 font-display text-2xl font-bold text-white">
        Complete Speaking transcript
      </h2>
      <div className="mt-5 space-y-5">
        {parts.map((part) => (
          <section key={part.part} className="speaking-report-card">
            <h3 className="border-b border-white/20 pb-2 font-display text-lg font-bold text-white">
              Part {part.part} · {part.label}
            </h3>
            <div className="mt-3 space-y-3">
              {part.responses.length > 0 ? (
                part.responses.map((response) => (
                  <article
                    key={response.id}
                    className="speaking-report-card rounded-xl border border-white/15 bg-white/[0.055] p-4"
                  >
                    <p className="font-mono text-[10px] tracking-[0.12em] text-[#7FE3EF] uppercase">
                      Response {response.sequence_number}
                    </p>
                    <h4 className="mt-1 text-sm font-bold text-white">{response.prompt}</h4>
                    <p className="speaking-report-transcript mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-[#D8E1EE]">
                      {response.transcript?.trim() || "Transcript unavailable."}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-[#B8C6D9]">No response data was released.</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

export function ReportAnalysis({
  parts,
}: {
  parts: SpeakingPartReport[];
}) {
  const partNumbers = parts.map((part) => part.part);
  const [activePart, setActivePart] = useState(partNumbers[0] ?? 1);
  const tabRefs = useRef(new Map<number, HTMLButtonElement>());
  const selected = parts.find((part) => part.part === activePart) ?? parts[0];

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const next = nextReportTab(partNumbers, activePart, event.key);
    if (next === activePart || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }
    event.preventDefault();
    setActivePart(next);
    tabRefs.current.get(next)?.focus();
  };

  if (!selected) {
    return (
      <section className="rounded-2xl bg-navy p-5 text-[#D8E1EE]" aria-live="polite">
        Response analysis is unavailable because this report contains no parts.
      </section>
    );
  }

  return (
    <>
      <section className="speaking-report-screen-analysis rounded-[22px] bg-navy p-5 shadow-[0_20px_48px_rgba(13,31,60,0.28)] sm:p-7" aria-labelledby="analysis-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.14em] text-[#7FE3EF] uppercase">
              Signature analysis
            </p>
            <h2 id="analysis-heading" className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">
              Your words, annotated
            </h2>
          </div>
          <div
            role="tablist"
            aria-label="Speaking test parts"
            className="grid grid-cols-3 rounded-xl border border-white/10 bg-white/5 p-1"
          >
            {parts.map((part) => {
              const active = part.part === selected.part;
              return (
                <button
                  key={part.part}
                  ref={(node) => {
                    if (node) tabRefs.current.set(part.part, node);
                  }}
                  type="button"
                  role="tab"
                  id={`speaking-part-tab-${part.part}`}
                  aria-selected={active}
                  aria-controls={`speaking-part-panel-${part.part}`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => setActivePart(part.part)}
                  onKeyDown={onTabKeyDown}
                  className={`min-h-11 cursor-pointer rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan ${
                    active ? "bg-cyan text-navy" : "text-[#B8C6D9] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  Part {part.part}
                </button>
              );
            })}
          </div>
        </div>

        <div
          key={selected.part}
          id={`speaking-part-panel-${selected.part}`}
          role="tabpanel"
          aria-labelledby={`speaking-part-tab-${selected.part}`}
          tabIndex={0}
          className="mt-5 space-y-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
        >
          {selected.responses.length > 0 ? (
            selected.responses.map((response) => (
              <ResponseAnalysis key={response.id} response={response} />
            ))
          ) : (
            <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-[#B8C6D9]" aria-live="polite">
              No response data was released for Part {selected.part}.
            </p>
          )}
        </div>
      </section>

      <PrintableAnalysis parts={parts} />
    </>
  );
}
