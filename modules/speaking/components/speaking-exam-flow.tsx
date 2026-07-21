"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
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
import { parseSpeakingCueCard } from "@/modules/speaking/lib/parse-speaking-cue-card";
import type {
  SpeakingQuestionManifest,
  SpeakingSessionRecording,
} from "@/modules/speaking/types";
import { examTextInputProps } from "@/lib/exam-input-props";
import { cn } from "@/lib/utils";
import {
  secondsUntilDeadline,
  speakingFlowReducer,
  type SpeakingSubPhase,
} from "@/modules/speaking/lib/speaking-flow-state";

type SubPhase = SpeakingSubPhase;

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
  onStepRecordingStarted?: (response: {
    questionId: string;
    part: 1 | 2 | 3;
    sequence: number;
  }) => void | Promise<void>;
  onPart2PreparationStarted?: (
    response: { questionId: string; part: 2; sequence: number },
    startedAt: string,
  ) => void | Promise<void>;
  completedQuestionIds?: readonly string[];
  part2NoPrepQuestionIds?: readonly string[];
  onFlowMetaChange?: (meta: SpeakingFlowMeta) => void;
  footerBusy?: boolean;
  completeLabel?: string;
  variant?: "mock" | "diagnostic";
  part2Timing?: {
    prepSeconds?: number;
    maxResponseSeconds?: number;
    prepStartedAt?: string | null;
    serverTime?: string | null;
  };
};

export function SpeakingExamFlow({
  manifest,
  onExamComplete,
  onStepRecorded,
  onStepRecordingStarted,
  onPart2PreparationStarted,
  completedQuestionIds = [],
  part2NoPrepQuestionIds = [],
  onFlowMetaChange,
  footerBusy = false,
  completeLabel = "Submit for human review",
  variant = "mock",
  part2Timing,
}: Props) {
  const isDiagnostic = variant === "diagnostic";
  const steps = useMemo(() => flattenExamSteps(manifest), [manifest]);
  const completedQuestionIdSet = useMemo(
    () => new Set(completedQuestionIds),
    [completedQuestionIds],
  );
  const firstIncompleteIndex = useMemo(
    () => steps.findIndex((step) => !completedQuestionIdSet.has(step.id)),
    [completedQuestionIdSet, steps],
  );
  const [flow, dispatchFlow] = useReducer(speakingFlowReducer, {
    stepIndex: Math.max(0, firstIncompleteIndex),
    subPhase: "play",
    prepDeadlineMs: null,
  });
  const { stepIndex, subPhase } = flow;
  const [part2Notes, setPart2Notes] = useState("");
  const [showRetry, setShowRetry] = useState(false);
  const [playKey, setPlayKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [answerBlob, setAnswerBlob] = useState<Blob | null>(null);
  const [pageHiddenDuringPrep, setPageHiddenDuringPrep] = useState(false);
  const recordingsRef = useRef<SpeakingSessionRecording[]>([]);
  const autoStartedRef = useRef(false);
  const part2AutoStopRef = useRef(false);
  const part2StartRef = useRef(false);
  const recoveredCompleteRef = useRef(false);
  const serverClockRef = useRef<{ serverMs: number; clientMs: number } | null>(null);

  const current = steps[stepIndex] ?? null;
  const isPart2 = current?.kind === "part2_intro";
  const currentPartSteps = current ? steps.filter((step) => step.part === current.part) : [];
  const partStepIndex = current
    ? Math.max(0, currentPartSteps.findIndex((step) => step.id === current.id))
    : 0;
  const prepSec = part2Timing?.prepSeconds ?? current?.prepSec ?? 60;
  const recordSec = part2Timing?.maxResponseSeconds ?? current?.recordSec ?? 120;
  const currentRecordLimit = isPart2 ? recordSec : current?.maxRecordSec;
  const isLastStep = stepIndex >= steps.length - 1;

  const [clockNow, setClockNow] = useState(0);
  const prepRemaining = secondsUntilDeadline(flow.prepDeadlineMs, clockNow);

  const recorder = useSpeakingRecorder();
  const recordRemaining = Math.max(0, recordSec - recorder.seconds);

  useEffect(() => {
    const serverMs = part2Timing?.serverTime ? Date.parse(part2Timing.serverTime) : Number.NaN;
    serverClockRef.current = Number.isFinite(serverMs)
      ? { serverMs, clientMs: Date.now() }
      : null;
  }, [part2Timing?.serverTime]);

  useEffect(() => {
    if (subPhase !== "part2_prep") return;
    const timer = window.setInterval(() => setClockNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [subPhase]);

  useEffect(() => {
    if (subPhase !== "part2_prep") return;
    const handleVisibility = () => {
      if (document.hidden) setPageHiddenDuringPrep(true);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [subPhase]);

  useEffect(() => {
    if (
      firstIncompleteIndex === -1 &&
      steps.length > 0 &&
      !recoveredCompleteRef.current
    ) {
      recoveredCompleteRef.current = true;
      onExamComplete(recordingsRef.current);
    }
  }, [firstIncompleteIndex, onExamComplete, steps.length]);

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

  /** Complete the answer in the recording card, then advance from the footer. */
  const showFooter = subPhase === "ready";
  const footerDisabled = footerBusy;

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
      dispatchFlow({ type: "recording_captured" });
    },
    [current, onStepRecorded],
  );

  const advanceStep = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      onExamComplete(recordingsRef.current);
      return;
    }
    dispatchFlow({ type: "advance" });
    setPlayKey((k) => k + 1);
    setAnswerBlob(null);
    autoStartedRef.current = false;
    part2AutoStopRef.current = false;
    part2StartRef.current = false;
    setShowRetry(false);
  }, [onExamComplete, stepIndex, steps.length]);

  const stopAndValidate = useCallback(async (): Promise<boolean> => {
    const result = await recorder.stopRecording();
    if (!result) return false;
    if (isShortOrSilentResponse(result.durationSec, result.blob)) {
      setShowRetry(true);
      dispatchFlow({ type: "retry", isPart2 });
      autoStartedRef.current = false;
      setPlayKey((k) => k + 1);
      return false;
    }
    saveRecording(result.blob, result.durationSec);
    return true;
  }, [isPart2, recorder, saveRecording]);

  const persistRecordingStart = useCallback(async () => {
    if (!current || !onStepRecordingStarted) return;
    try {
      await onStepRecordingStarted({
        questionId: current.id,
        part: current.part,
        sequence: current.sequence ?? stepIndex + 1,
      });
    } catch {
      setError(
        "Recovery metadata could not be saved. Keep this page open until the answer uploads.",
      );
    }
  }, [current, onStepRecordingStarted, stepIndex]);

  const beginPart2Recording = useCallback(() => {
    if (part2StartRef.current) return;
    part2StartRef.current = true;
    void persistRecordingStart().then(async () => {
      dispatchFlow({ type: "begin_part2" });
      part2AutoStopRef.current = false;
      const ok = await recorder.startRecordingWithBeep();
      if (!ok) {
        part2StartRef.current = false;
        setError((prev) => prev ?? "Microphone access is required.");
      }
    });
  }, [persistRecordingStart, recorder]);

  const handleTimedRecordEnd = useCallback(async () => {
    if (part2AutoStopRef.current) return;
    part2AutoStopRef.current = true;
    const ok = await stopAndValidate();
    if (ok && isPart2) advanceStep();
  }, [advanceStep, isPart2, stopAndValidate]);

  useEffect(() => {
    if (subPhase === "part2_prep" && prepRemaining === 0) {
      beginPart2Recording();
    }
  }, [beginPart2Recording, prepRemaining, subPhase]);

  useEffect(() => {
    if (
      (subPhase === "record" || subPhase === "part2_record") &&
      currentRecordLimit != null &&
      recorder.seconds >= currentRecordLimit &&
      recorder.recording
    ) {
      const timer = window.setTimeout(() => void handleTimedRecordEnd(), 0);
      return () => window.clearTimeout(timer);
    }
  }, [
    currentRecordLimit,
    handleTimedRecordEnd,
    recorder.recording,
    recorder.seconds,
    subPhase,
  ]);

  useEffect(() => {
    autoStartedRef.current = false;
    part2AutoStopRef.current = false;
    part2StartRef.current = false;
  }, [stepIndex]);

  const handleQuestionEnded = useCallback(() => {
    if (autoStartedRef.current || !current) return;
    autoStartedRef.current = true;

    if (current.kind === "part2_intro") {
      const serverStartedAt = part2Timing?.prepStartedAt
        ? Date.parse(part2Timing.prepStartedAt)
        : Number.NaN;
      const serverNow = part2Timing?.serverTime
        ? (serverClockRef.current?.serverMs ?? Date.parse(part2Timing.serverTime)) +
          (serverClockRef.current ? Date.now() - serverClockRef.current.clientMs : 0)
        : Number.NaN;
      const skipPreparation = part2NoPrepQuestionIds.includes(current.id);
      const remainingMs = skipPreparation
        ? 0
        : Number.isFinite(serverStartedAt) && Number.isFinite(serverNow)
          ? Math.max(0, serverStartedAt + prepSec * 1000 - serverNow)
          : prepSec * 1000;
      const now = Date.now();
      setClockNow(now);
      if (!Number.isFinite(serverStartedAt) && !skipPreparation) {
        void Promise.resolve(
          onPart2PreparationStarted?.(
            {
              questionId: current.id,
              part: 2,
              sequence: current.sequence ?? stepIndex + 1,
            },
            new Date(now).toISOString(),
          ),
        ).catch(() => {
          setError(
            "Preparation recovery metadata could not be saved. Keep this page open.",
          );
        });
      }
      dispatchFlow({
        type: "question_ended",
        isPart2: true,
        prepDeadlineMs: now + remainingMs,
      });
      return;
    }

    void persistRecordingStart().then(async () => {
      dispatchFlow({ type: "question_ended", isPart2: false });
      const ok = await recorder.startRecordingWithBeep();
      if (!ok) {
        autoStartedRef.current = false;
        setError((prev) => prev ?? "Microphone access is required for the speaking section.");
      }
    });
  }, [
    current,
    onPart2PreparationStarted,
    part2NoPrepQuestionIds,
    part2Timing,
    prepSec,
    persistRecordingStart,
    recorder,
    stepIndex,
  ]);

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
    autoStartedRef.current = false;
    if (isPart2) {
      part2StartRef.current = false;
      beginPart2Recording();
    } else {
      dispatchFlow({ type: "retry", isPart2: false });
      setPlayKey((k) => k + 1);
    }
  }, [beginPart2Recording, isPart2]);

  const handleStop = useCallback(() => {
    void stopAndValidate();
  }, [stopAndValidate]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || event.key.toLowerCase() !== "n" || footerDisabled) return;
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, [contenteditable='true']")) return;
      event.preventDefault();
      void handleNextQuestion();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [footerDisabled, handleNextQuestion]);

  if (!current) {
    return (
      <p className="text-sm text-[#5A6B82]">No speaking questions configured.</p>
    );
  }

  const cueCard = isPart2 ? parseSpeakingCueCard(current.prompt) : null;

  const content = (
    <div className="flex flex-col gap-5">
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

      {(subPhase === "record" || subPhase === "part2_record" || subPhase === "ready") ? (
        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:gap-8">
          <SpeakingQuestionCard
            variant={variant}
            partLabel={partLabel}
            prompt={current.prompt}
            videoUrl={current.videoUrl}
            passiveListening
          />
          <div className="flex min-w-0 flex-col">
            <p className="font-mono text-[10px] font-medium tracking-[0.14em] text-teal uppercase">
              {isPart2 ? "Cue card" : "Question"}
            </p>
            <h2 className="mt-2 break-words font-display text-xl font-semibold leading-snug text-navy sm:text-2xl">
              {cueCard?.title ?? current.prompt}
            </h2>

            {(subPhase === "record" || subPhase === "part2_record") &&
            !recorder.recording ? (
              <p className="mt-3 text-sm text-[#5A6B82]" role="status">
                {subPhase === "part2_record"
                  ? `Recording is starting automatically · up to ${recordSec} seconds`
                  : "Recording is starting automatically after the question."}
              </p>
            ) : null}

            {showRecordingControls ? (
              <SpeakingRecordingControls
                phase={recordingControlPhase}
                seconds={recorder.seconds}
                waveform={recorder.waveform}
                countdownSec={subPhase === "part2_record" ? recordSec : null}
                answerBlob={captured ? answerBlob : null}
                onStop={handleStop}
                onRerecord={() => undefined}
                showRerecord={false}
                showStop={subPhase === "record" || subPhase === "part2_record"}
                stopLabel={isPart2 ? "Finish long turn" : "Complete answer"}
                hideElapsed={false}
                className="mt-5 flex-1 lg:mt-auto"
              />
            ) : null}

            {subPhase === "ready" ? (
              <div className="mt-4 rounded-[14px] border border-cyan/25 bg-cyan/10 px-4 py-3 text-center">
                <p className="text-sm font-semibold text-[#075985]">
                  {isLastStep
                    ? "Answer saved. Hear it back or submit when ready."
                    : "Answer saved. Hear it back, then continue."}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {subPhase === "part2_prep" && cueCard ? (
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-11">
          <div className="min-w-0">
            <div className="mb-4 lg:hidden">
              <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-cyan/30 bg-[#0B1B32] px-4 py-3 text-white">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-navy font-display text-sm font-bold">
                  BF
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">BandForge Examiner</span>
                  <span className="font-mono text-[10px] tracking-[0.12em] text-slate-400">
                    PREPARING
                  </span>
                </span>
                <span className="size-2 rounded-full bg-slate-400" aria-hidden />
              </div>
            </div>

            <section className="rounded-r-[18px] rounded-l bg-[#EEF3F8] p-5 shadow-[0_14px_32px_rgba(13,31,60,0.08)] border-l-4 border-cyan sm:p-7">
              <p className="font-mono text-[10px] tracking-[0.14em] text-teal uppercase sm:text-[11px]">
                Cue card
              </p>
              <h2 className="mt-3 break-words font-display text-lg font-semibold leading-snug text-navy sm:text-[22px]">
                {cueCard.title}
              </h2>
              {cueCard.bullets.length > 0 ? (
                <>
                  <p className="mt-4 mb-2 text-sm text-[#5A6B82]">You should say:</p>
                  <ul className="flex flex-col gap-2.5">
                    {cueCard.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5">
                        <span className="mt-2 size-[5px] shrink-0 rounded-full bg-cyan" aria-hidden />
                        <span className="min-w-0 flex-1 break-words text-sm leading-relaxed text-[#1B2B45] sm:text-[15px]">
                          {bullet}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              {cueCard.finalInstruction ? (
                <p className="mt-3 text-sm leading-relaxed text-[#1B2B45] sm:text-[15px]">
                  {cueCard.finalInstruction}
                </p>
              ) : null}
            </section>

            <label className="mt-5 block">
              <span className="mb-2 block font-mono text-[10px] tracking-[0.1em] text-[#64748B] uppercase">
                Your notes (optional)
              </span>
              <textarea
                value={part2Notes}
                onChange={(event) => setPart2Notes(event.target.value)}
                {...examTextInputProps}
                placeholder="Jot down your key points…"
                className="min-h-24 w-full resize-y rounded-2xl border border-navy/15 bg-navy p-4 text-sm leading-relaxed text-slate-100 outline-none placeholder:text-slate-400 focus:border-cyan focus:ring-2 focus:ring-cyan/25 lg:min-h-32"
              />
            </label>
          </div>

          <div className="flex flex-col items-center justify-center">
            <p className="mb-4 font-mono text-[10px] tracking-[0.14em] text-[#64748B] uppercase sm:text-[11px]">
              Preparation time
            </p>
            <div
              className="relative size-36 sm:size-44 lg:size-48"
              role="timer"
              aria-label={`${prepRemaining} seconds preparation time remaining`}
            >
              <svg className="size-full -rotate-90" viewBox="0 0 196 196" aria-hidden>
                <circle cx="98" cy="98" r="88" fill="none" stroke="rgba(13,31,60,.08)" strokeWidth="8" />
                <circle
                  cx="98"
                  cy="98"
                  r="88"
                  fill="none"
                  stroke={prepRemaining < 10 ? "#D97706" : "#00BCD4"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={552.92}
                  strokeDashoffset={552.92 * (1 - prepRemaining / Math.max(1, prepSec))}
                  className="transition-[stroke-dashoffset] duration-200"
                />
              </svg>
              <span
                className={cn(
                  "absolute inset-0 flex items-center justify-center font-display text-4xl font-extrabold sm:text-5xl",
                  prepRemaining < 10 ? "text-amber-700" : "text-cyan",
                )}
              >
                0:{String(prepRemaining).padStart(2, "0")}
              </span>
            </div>
            <span className="sr-only" aria-live="assertive">
              {prepRemaining <= 10 ? `${prepRemaining} seconds preparation time remaining` : ""}
            </span>
            <Button
              variant="secondary"
              className="mt-7 min-h-11 w-full rounded-full border-cyan/40 bg-cyan/10 text-teal focus-visible:ring-4 focus-visible:ring-cyan/30"
              onClick={beginPart2Recording}
            >
              Begin Speaking
            </Button>
            <p className="mt-3 text-center font-mono text-[10px] tracking-[0.06em] text-[#64748B] uppercase">
              Tap to start early, or wait for the timer
            </p>
            {pageHiddenDuringPrep ? (
              <p className="mt-3 text-center text-sm text-amber-700" role="status">
                Preparation continues while this tab is hidden.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {error ?? recorder.lastError ? (
        <p className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
          {error ?? recorder.lastError}
        </p>
      ) : null}

      <SpeakingRetryDialog open={showRetry} onRetry={handleRetry} />
    </div>
  );

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden bg-white",
        !isDiagnostic && "min-h-[620px] rounded-[20px] border border-navy/10 shadow-[0_20px_50px_rgba(13,31,60,0.10)]",
      )}
    >
      <SpeakingProgressHeader
        stepIndex={stepIndex}
        totalSteps={steps.length}
        partStepIndex={partStepIndex}
        partTotalSteps={currentPartSteps.length}
        part={current.part}
        partLabel={partLabel}
      />
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-8">
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
