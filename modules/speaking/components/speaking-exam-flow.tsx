"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCountdown } from "@/hooks/use-countdown";
import { Button } from "@/components/ui/button";
import { isShortOrSilentResponse } from "@/modules/speaking/lib/detect-short-response";
import { flattenExamSteps } from "@/modules/speaking/lib/speaking-question-manifest";
import { useSpeakingRecorder } from "@/modules/speaking/hooks/use-speaking-recorder";
import {
  SpeakingQuestionCard,
  SpeakingQuestionPlayer,
} from "@/modules/speaking/components/speaking-question-player";
import { SpeakingRecordingControls } from "@/modules/speaking/components/speaking-recording-controls";
import { SpeakingRetryDialog } from "@/modules/speaking/components/speaking-retry-dialog";
import { SpeakingProgressHeader } from "@/modules/speaking/components/speaking-progress-header";
import { SpeakingExamFooter } from "@/modules/speaking/components/speaking-exam-footer";
import type {
  SpeakingQuestionManifest,
  SpeakingSessionRecording,
} from "@/modules/speaking/types";
import { examTextInputProps } from "@/lib/exam-input-props";
import { cn } from "@/lib/utils";

type SubPhase = "play" | "record" | "part2_prep" | "part2_record" | "ready";

export type SpeakingFlowMeta = {
  stepIndex: number;
  totalSteps: number;
  part: 1 | 2 | 3;
  partLabel: string;
  subPhase: SubPhase;
  prepRemaining: number | null;
  recordRemaining: number | null;
  showFooter: boolean;
  footerLabel: string;
  footerDisabled: boolean;
};

type Props = {
  manifest: SpeakingQuestionManifest[];
  onExamComplete: (recordings: SpeakingSessionRecording[]) => void;
  onStepRecorded?: (recording: SpeakingSessionRecording) => void;
  onFlowMetaChange?: (meta: SpeakingFlowMeta) => void;
  footerBusy?: boolean;
  completeLabel?: string;
  variant?: "mock" | "diagnostic";
};

function parseCueCard(text: string): { title: string; bullets: string[] } {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const title = lines[0] ?? text;
  const bullets = lines.slice(1).filter((l) => !l.toLowerCase().startsWith("you should"));
  return { title, bullets };
}

export function SpeakingExamFlow({
  manifest,
  onExamComplete,
  onStepRecorded,
  onFlowMetaChange,
  footerBusy = false,
  completeLabel = "Submit for human review",
  variant = "mock",
}: Props) {
  const isDiagnostic = variant === "diagnostic";
  const steps = useMemo(() => flattenExamSteps(manifest), [manifest]);
  const [stepIndex, setStepIndex] = useState(0);
  const [subPhase, setSubPhase] = useState<SubPhase>("play");
  const [part2Notes, setPart2Notes] = useState("");
  const [showRetry, setShowRetry] = useState(false);
  const [playKey, setPlayKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [answerBlob, setAnswerBlob] = useState<Blob | null>(null);
  const recordingsRef = useRef<SpeakingSessionRecording[]>([]);
  const autoStartedRef = useRef(false);
  const part2AutoStopRef = useRef(false);

  const current = steps[stepIndex] ?? null;
  const isPart2 = current?.kind === "part2_intro";
  const prepSec = current?.prepSec ?? 60;
  const recordSec = current?.recordSec ?? 120;
  const isLastStep = stepIndex >= steps.length - 1;

  const prepRemaining = useCountdown(prepSec, subPhase === "part2_prep");
  const recordRemaining = useCountdown(recordSec, subPhase === "part2_record");

  const recorder = useSpeakingRecorder({
    maxDurationSec: subPhase === "part2_record" ? recordSec : undefined,
  });

  useEffect(() => {
    if (recorder.lastError) {
      setError(recorder.lastError);
    }
  }, [recorder.lastError]);

  const partLabel =
    current?.part === 2
      ? "Part 2 — Long turn"
      : current
        ? `Part ${current.part} · Question ${current.questionNumber}`
        : "";

  const nextLabel =
    isLastStep && subPhase === "ready"
      ? completeLabel
      : subPhase === "record"
        ? "Next question"
        : isPart2
          ? "Continue"
          : "Next question";

  const showRecordingControls =
    subPhase === "record" || subPhase === "part2_record" || subPhase === "ready";

  const recordingControlPhase =
    subPhase === "ready"
      ? ("captured" as const)
      : recorder.recording
        ? ("recording" as const)
        : ("idle" as const);

  const captured = recordingControlPhase === "captured";

  /** Parts 1/3: Next Question during recording; Submit / Continue on ready. */
  const showFooter = subPhase === "ready" || subPhase === "record";
  const footerDisabled =
    footerBusy || (subPhase === "record" && !recorder.recording);

  const flowMeta = useMemo((): SpeakingFlowMeta | null => {
    if (!current) return null;
    return {
      stepIndex,
      totalSteps: steps.length,
      part: current.part,
      partLabel,
      subPhase,
      prepRemaining: subPhase === "part2_prep" ? prepRemaining : null,
      recordRemaining: subPhase === "part2_record" ? recordRemaining : null,
      showFooter,
      footerLabel: nextLabel,
      footerDisabled,
    };
  }, [
    current,
    footerDisabled,
    nextLabel,
    partLabel,
    prepRemaining,
    recordRemaining,
    showFooter,
    stepIndex,
    steps.length,
    subPhase,
  ]);

  const lastFlowMetaKeyRef = useRef("");

  useEffect(() => {
    if (!onFlowMetaChange || !flowMeta) return;
    const key = JSON.stringify(flowMeta);
    if (key === lastFlowMetaKeyRef.current) return;
    lastFlowMetaKeyRef.current = key;
    onFlowMetaChange(flowMeta);
  }, [flowMeta, onFlowMetaChange]);

  const saveRecording = useCallback(
    (blob: Blob, durationSec: number) => {
      if (!current) return;
      const entry: SpeakingSessionRecording = {
        questionId: current.id,
        part: current.part,
        durationSec,
        blob,
      };
      recordingsRef.current = [
        ...recordingsRef.current.filter((r) => r.questionId !== current.id),
        entry,
      ];
      onStepRecorded?.(entry);
      setAnswerBlob(blob);
      setSubPhase("ready");
    },
    [current, onStepRecorded],
  );

  const advanceStep = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      onExamComplete(recordingsRef.current);
      return;
    }
    setStepIndex((i) => i + 1);
    setSubPhase("play");
    setPlayKey((k) => k + 1);
    setAnswerBlob(null);
    autoStartedRef.current = false;
    part2AutoStopRef.current = false;
  }, [onExamComplete, stepIndex, steps.length]);

  const stopAndValidate = useCallback(async (): Promise<boolean> => {
    const result = await recorder.stopRecording();
    if (!result) return false;
    if (isShortOrSilentResponse(result.durationSec, result.blob)) {
      setShowRetry(true);
      setSubPhase("play");
      autoStartedRef.current = false;
      setPlayKey((k) => k + 1);
      return false;
    }
    saveRecording(result.blob, result.durationSec);
    return true;
  }, [recorder, saveRecording]);

  const handlePart2RecordEnd = useCallback(async () => {
    if (part2AutoStopRef.current) return;
    part2AutoStopRef.current = true;
    const ok = await stopAndValidate();
    if (ok) advanceStep();
  }, [advanceStep, stopAndValidate]);

  useEffect(() => {
    if (subPhase === "part2_prep" && prepRemaining === 0) {
      setSubPhase("part2_record");
      part2AutoStopRef.current = false;
      void recorder.startRecordingWithBeep().then((ok) => {
        if (!ok) {
          setError((prev) => prev ?? "Microphone access is required.");
        }
      });
    }
  }, [subPhase, prepRemaining, recorder]);

  useEffect(() => {
    if (subPhase === "part2_record" && recordRemaining === 0 && recorder.recording) {
      void handlePart2RecordEnd();
    }
  }, [subPhase, recordRemaining, recorder.recording, handlePart2RecordEnd]);

  useEffect(() => {
    setSubPhase("play");
    setShowRetry(false);
    autoStartedRef.current = false;
    part2AutoStopRef.current = false;
    setAnswerBlob(null);
    setPlayKey((k) => k + 1);
  }, [stepIndex]);

  const handleQuestionEnded = useCallback(() => {
    if (autoStartedRef.current || !current) return;
    autoStartedRef.current = true;

    if (current.kind === "part2_intro") {
      setSubPhase("part2_prep");
      return;
    }

    setSubPhase("record");
    void recorder.startRecordingWithBeep().then((ok) => {
      if (!ok) {
        setError((prev) => prev ?? "Microphone access is required for the speaking section.");
      }
    });
  }, [current, recorder]);

  const handleNextQuestion = useCallback(async () => {
    if (subPhase === "record") {
      const ok = await stopAndValidate();
      if (!ok) return;
      if (!isLastStep) advanceStep();
      return;
    }

    if (subPhase === "ready") {
      if (isLastStep) {
        onExamComplete(recordingsRef.current);
      } else {
        advanceStep();
      }
    }
  }, [advanceStep, isLastStep, onExamComplete, stopAndValidate, subPhase]);

  const handleRetry = useCallback(() => {
    setShowRetry(false);
    setSubPhase("play");
    autoStartedRef.current = false;
    setPlayKey((k) => k + 1);
  }, []);

  const handleStop = useCallback(() => {
    void stopAndValidate();
  }, [stopAndValidate]);

  if (!current) {
    return (
      <p className="text-sm text-[#5A6B82]">No speaking questions configured.</p>
    );
  }

  const cueCard = isPart2 ? parseCueCard(current.prompt) : null;

  const content = (
    <div className={cn("flex flex-col gap-4 sm:gap-5", isDiagnostic ? "pb-4" : "")}>
      {subPhase === "play" ? (
        <SpeakingQuestionPlayer
          variant={variant}
          playKey={`${current.id}-${stepIndex}-${playKey}`}
          videoUrl={current.videoUrl}
          audioUrl={current.audioUrl}
          prompt={current.prompt}
          partLabel={partLabel}
          onEnded={handleQuestionEnded}
        />
      ) : null}

      {subPhase === "record" ? (
        <SpeakingQuestionCard
          variant={variant}
          partLabel={partLabel}
          prompt={current.prompt}
          videoUrl={current.videoUrl}
        />
      ) : null}

      {subPhase === "part2_prep" && cueCard ? (
        <div className="rounded-[18px] border border-navy/12 bg-white p-4 shadow-[0_14px_30px_rgba(13,31,60,0.07)] sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[10.5px] tracking-wider text-teal uppercase">
              Part 2 — Preparation
            </p>
            <span className="inline-flex items-center rounded-full border border-cyan/25 bg-cyan/12 px-2.5 py-1 font-mono text-xs font-medium text-teal">
              {prepRemaining}s left
            </span>
          </div>
          <p className="break-words font-display text-lg font-semibold leading-snug text-navy sm:text-xl">
            {cueCard.title}
          </p>
          {cueCard.bullets.length > 0 ? (
            <>
              <p className="mt-4 mb-2 text-[13px] font-medium text-[#475569]">You should say:</p>
              <ul className="flex flex-col gap-2.5">
                {cueCard.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <span className="mt-2 size-[5px] shrink-0 rounded-full bg-cyan" />
                    <span className="min-w-0 flex-1 break-words text-sm leading-snug text-[#1B2B45]">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          <label className="mt-4 block">
            <span className="sr-only">Preparation notes</span>
            <textarea
              value={part2Notes}
              onChange={(e) => setPart2Notes(e.target.value)}
              {...examTextInputProps}
              placeholder="Notes (not submitted)…"
              className="min-h-[100px] w-full max-w-full resize-y rounded-xl border border-navy/15 bg-slate-50 p-3 text-sm leading-relaxed text-navy outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/25 sm:min-h-[120px]"
            />
          </label>
        </div>
      ) : null}

      {(subPhase === "record" || subPhase === "part2_record") && !recorder.recording ? (
        <p className="text-center text-sm text-[#5A6B82]">
          {subPhase === "part2_record"
            ? `Part 2 recording starts automatically · up to ${recordSec}s`
            : "Recording will start automatically after the question."}
        </p>
      ) : null}

      {showRecordingControls ? (
        <SpeakingRecordingControls
          phase={recordingControlPhase}
          seconds={recorder.seconds}
          countdownSec={subPhase === "part2_record" ? recordSec : null}
          answerBlob={captured ? answerBlob : null}
          onStop={handleStop}
          onRerecord={() => undefined}
          showRerecord={false}
          showStop={subPhase === "part2_record"}
          hideElapsed={subPhase === "record" || subPhase === "ready"}
          className={isDiagnostic ? "mt-0" : undefined}
        />
      ) : null}

      {subPhase === "ready" ? (
        <div className="rounded-[14px] border border-cyan/25 bg-cyan/10 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-[#075985]">
            {isLastStep
              ? "Answer saved. Tap Hear to review, or Submit when ready."
              : "Answer saved. Tap Hear to review, then continue."}
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {!isDiagnostic && showFooter ? (
        <Button
          variant="primary"
          className="w-full"
          disabled={footerDisabled}
          onClick={() => void handleNextQuestion()}
        >
          {footerBusy ? "Submitting…" : nextLabel}
        </Button>
      ) : null}

      <SpeakingRetryDialog open={showRetry} onRetry={handleRetry} />
    </div>
  );

  if (isDiagnostic) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SpeakingProgressHeader
          stepIndex={stepIndex}
          totalSteps={steps.length}
          part={current.part}
          partLabel={partLabel}
        />
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
          <div className="mx-auto w-full max-w-[760px] px-4 py-4 sm:px-6 sm:py-6">
            {content}
          </div>
        </div>
        {showFooter ? (
          <SpeakingExamFooter
            label={nextLabel}
            busy={footerBusy}
            busyLabel="Submitting…"
            disabled={footerDisabled}
            onClick={() => void handleNextQuestion()}
          />
        ) : null}
      </div>
    );
  }

  return content;
}
