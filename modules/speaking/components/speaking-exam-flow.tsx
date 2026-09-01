"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { isUnusableRecording } from "@/modules/speaking/lib/detect-short-response";
import { flattenExamSteps } from "@/modules/speaking/lib/speaking-question-manifest";
import { useSpeakingRecorder } from "@/modules/speaking/hooks/use-speaking-recorder";
import { SpeakingQuestionPlayer } from "@/modules/speaking/components/speaking-question-player";
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
import { TextType } from "@/components/ui/text-type";
import { planTimedTextType } from "@/lib/timed-text-type";
import {
  secondsUntilDeadline,
  speakingFlowReducer,
  type SpeakingSubPhase,
} from "@/modules/speaking/lib/speaking-flow-state";
import { SPEAKING_PART1_MAX_RECORD_SEC } from "@/modules/speaking/lib/speaking-timing";

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
  const part1RecordSec = Math.max(
    current?.maxRecordSec ?? 0,
    SPEAKING_PART1_MAX_RECORD_SEC,
  );
  const currentRecordLimit = isPart2
    ? recordSec
    : current?.part === 1
      ? part1RecordSec
      : (current?.maxRecordSec ?? SPEAKING_PART1_MAX_RECORD_SEC);
  const isLastStep = stepIndex >= steps.length - 1;

  const [clockNow, setClockNow] = useState(0);
  const prepRemaining = secondsUntilDeadline(flow.prepDeadlineMs, clockNow);

  const recorder = useSpeakingRecorder();
  const recordRemaining = Math.max(
    0,
    (isPart2 ? recordSec : (currentRecordLimit ?? recordSec)) - recorder.seconds,
  );

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

  const showRecordingControls =
    subPhase === "record" || subPhase === "part2_record" || subPhase === "ready";

  const recordingControlPhase =
    subPhase === "ready"
      ? ("captured" as const)
      : recorder.recording
        ? ("recording" as const)
        : ("idle" as const);

  const captured = recordingControlPhase === "captured";

  const showFooter = subPhase !== "part2_prep";
  const footerDisabled = footerBusy;
  const footerLabel =
    subPhase === "play"
      ? "Start recording"
      : isLastStep
        ? completeLabel
        : "Next question";

  const flowMeta = useMemo((): SpeakingFlowMeta | null => {
    if (!current) return null;
    return {
      stepIndex,
      totalSteps: steps.length,
      part: current.part,
      partLabel,
      subPhase,
      prepRemaining: subPhase === "part2_prep" ? prepRemaining : null,
      recordRemaining:
        subPhase === "part2_record" || subPhase === "record"
          ? recordRemaining
          : null,
      showFooter,
      footerLabel,
      footerDisabled,
    };
  }, [
    current,
    footerDisabled,
    footerLabel,
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
    if (await isUnusableRecording(result.durationSec, result.blob)) {
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

    const result = await recorder.stopRecording();
    if (!result || (await isUnusableRecording(result.durationSec, result.blob))) {
      if (isPart2) {
        setShowRetry(true);
        dispatchFlow({ type: "retry", isPart2: true });
        autoStartedRef.current = false;
        part2StartRef.current = false;
        part2AutoStopRef.current = false;
        return;
      }
      // Part 1: no usable answer within the time window → next question.
      advanceStep();
      return;
    }

    saveRecording(result.blob, result.durationSec);
    if (isPart2) advanceStep();
  }, [advanceStep, isPart2, recorder, saveRecording]);

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

  // Part 1 wall-clock: even if mic never starts, advance after the limit.
  useEffect(() => {
    if (subPhase !== "record" || isPart2 || currentRecordLimit == null) return;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      if (elapsed < currentRecordLimit) return;
      window.clearInterval(timer);
      void handleTimedRecordEnd();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [currentRecordLimit, handleTimedRecordEnd, isPart2, stepIndex, subPhase]);

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

  const handleSubmitExam = useCallback(async () => {
    if (subPhase === "play") {
      handleQuestionEnded();
      return;
    }
    if (subPhase === "record" || subPhase === "part2_record") {
      const ok = await stopAndValidate();
      if (!ok) return;
    }
    if (isLastStep) {
      onExamComplete(recordingsRef.current);
      return;
    }
    advanceStep();
  }, [
    advanceStep,
    handleQuestionEnded,
    isLastStep,
    onExamComplete,
    stopAndValidate,
    subPhase,
  ]);

  const handleNextQuestion = handleSubmitExam;

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

  const cueCard = current && isPart2 ? parseSpeakingCueCard(current.prompt) : null;
  const hidePromptText = Boolean(current?.videoUrl);
  const recordPromptText =
    current && !hidePromptText
      ? (cueCard?.title ?? current.prompt)
      : "";
  const recordPromptPlan = useMemo(
    () =>
      planTimedTextType(
        [{ text: recordPromptText }],
        Math.max(1.6, Math.min(4.5, recordPromptText.length / 16)),
      ),
    [recordPromptText],
  );

  if (!current) {
    return (
      <p className="text-sm text-[#5A6B82]">No speaking questions configured.</p>
    );
  }

  const recordPanel =
    subPhase === "record" ||
    subPhase === "part2_record" ||
    subPhase === "ready" ? (
      <>
        {hidePromptText ? null : (
          <p className="text-center font-mono text-[10px] font-medium tracking-[0.14em] text-teal uppercase sm:text-left">
            {isPart2 ? "Cue card" : "Question"}
          </p>
        )}
        {hidePromptText ? null : recordPromptText.trim() ? (
          <div className="mt-2 min-h-[1.6em] text-center sm:text-left">
            <TextType
              key={`${current.id}-${subPhase}-prompt`}
              as="h2"
              text={recordPromptText}
              loop={false}
              typingSpeed={recordPromptPlan.typingSpeed}
              variableSpeed={recordPromptPlan.variableSpeed}
              initialDelay={80}
              showCursor={subPhase === "record" || subPhase === "part2_record"}
              cursorCharacter="|"
              cursorBlinkDuration={0.5}
              className="block w-full break-words font-display text-[15px] font-semibold leading-snug text-navy sm:text-lg lg:text-xl"
            />
          </div>
        ) : (
          <p className="mt-2 text-center text-[13px] leading-snug text-[#5A6B82] sm:text-left sm:text-sm">
            Record your answer to the examiner.
          </p>
        )}

        {(subPhase === "record" || subPhase === "part2_record") &&
        !recorder.recording ? (
          <p className="mt-3 text-sm text-[#5A6B82]" role="status">
            {subPhase === "part2_record"
              ? `Recording is starting automatically · up to ${recordSec} seconds`
              : `Recording is starting automatically · up to ${Math.round((currentRecordLimit ?? SPEAKING_PART1_MAX_RECORD_SEC) / 60)} min`}
          </p>
        ) : null}

        {showRecordingControls ? (
          <SpeakingRecordingControls
            phase={recordingControlPhase}
            seconds={recorder.seconds}
            waveform={recorder.waveform}
            countdownSec={
              subPhase === "part2_record" || subPhase === "record"
                ? (currentRecordLimit ?? recordSec)
                : null
            }
            answerBlob={captured ? answerBlob : null}
            onStop={handleStop}
            onRerecord={() => undefined}
            showRerecord={false}
            showStop={false}
            stopLabel={isPart2 ? "Finish long turn" : "Complete answer"}
            hideElapsed={false}
            className="mt-2 min-h-0 flex-1 overflow-hidden !py-2 sm:mt-3 sm:!py-5"
          />
        ) : null}

        {subPhase === "ready" ? (
          <div className="mt-3 rounded-[14px] border border-cyan/25 bg-cyan/10 px-3 py-2.5 text-center sm:mt-4 sm:px-4 sm:py-3">
            <p className="text-[13px] font-semibold text-[#075985] sm:text-sm">
              {isLastStep
                ? "Answer saved. Hear it back or submit when ready."
                : "Answer saved. Hear it back, then continue."}
            </p>
          </div>
        ) : null}
      </>
    ) : null;

  const content = (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {subPhase !== "part2_prep" ? (
        <SpeakingQuestionPlayer
          variant={variant}
          playKey={`${current.id}-${stepIndex}-${playKey}`}
          videoUrl={current.videoUrl}
          audioUrl={current.audioUrl}
          prompt={current.prompt}
          partLabel={partLabel}
          onEnded={handleQuestionEnded}
          stage={subPhase === "play" ? "play" : "record"}
          examinerStatus={
            subPhase === "ready"
              ? "CAPTURED"
              : subPhase === "play"
                ? "ASKING"
                : "LISTENING"
          }
          recordPanel={recordPanel}
        />
      ) : null}

      {subPhase === "part2_prep" && cueCard ? (
        <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
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
        !isDiagnostic &&
          "rounded-[20px] border border-navy/10 shadow-[0_20px_50px_rgba(13,31,60,0.10)]",
      )}
    >
      <SpeakingProgressHeader
        stepIndex={stepIndex}
        totalSteps={steps.length}
        partStepIndex={partStepIndex}
        partTotalSteps={currentPartSteps.length}
        part={current.part}
        partLabel={partLabel}
        showLogo={!isDiagnostic}
      />
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        data-speaking-scroll-region
      >
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-1.5 sm:p-4 lg:p-6">
          {content}
        </div>
      </div>
      {showFooter ? (
        <SpeakingExamFooter
          label={footerLabel}
          busy={footerBusy}
          busyLabel={isLastStep && subPhase !== "play" ? "Submitting…" : "Saving…"}
          disabled={footerDisabled}
          onClick={() => void handleSubmitExam()}
        />
      ) : null}
    </div>
  );
}
