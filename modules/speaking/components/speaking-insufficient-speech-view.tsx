"use client";

import Link from "next/link";
import { MicOff } from "lucide-react";
import { SpeakingReportShell } from "@/modules/speaking/components/report/speaking-report-shell";
import {
  groupSpeakingTranscripts,
  speakingTranscriptStatus,
} from "@/modules/speaking/lib/speaking-transcript-groups";
import { displayTranscript } from "@/modules/speaking/lib/meaningful-speech";
import type { SpeakingPendingPayload } from "@/modules/speaking/types";
import { SpeakingMockFooterCta } from "@/modules/speaking/components/report/speaking-mock-footer-cta";

type Props = {
  testNumber: number;
  payload: SpeakingPendingPayload;
  reRecordHref: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  backHref?: string | null;
  backLabel?: string;
  fallbackHref?: string | null;
};

function durationLabel(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export function SpeakingInsufficientSpeechView({
  testNumber,
  payload,
  reRecordHref,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  backHref,
  backLabel,
  fallbackHref,
}: Props) {
  const transcriptGroups = groupSpeakingTranscripts(payload.responses);
  const message =
    payload.message?.trim() ||
    "We couldn't detect enough speech to score this attempt.";

  return (
    <SpeakingReportShell
      metaLabel={`Mock Test ${testNumber} · Speaking · No speech detected`}
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
      <div className="mx-auto w-full max-w-[720px] px-4 py-10 sm:px-6 lg:px-10">
        <div className="rounded-[22px] border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
              <MicOff className="size-6" aria-hidden />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-navy">
                No speech detected
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[#334155]">
                {message} Re-record your answers so we can transcribe and score
                them.
              </p>
              <Link
                href={reRecordHref}
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-teal px-5 text-sm font-semibold text-white transition-colors hover:bg-teal/90"
              >
                Re-record this set
              </Link>
            </div>
          </div>
        </div>

        {transcriptGroups.length > 0 ? (
          <section className="mt-8" aria-labelledby="insufficient-transcript-heading">
            <h2
              id="insufficient-transcript-heading"
              className="font-mono text-[11px] tracking-[0.12em] text-muted-light uppercase"
            >
              What we captured
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
                              ? transcript ||
                                "No speech was detected in this answer."
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
    </SpeakingReportShell>
  );
}
