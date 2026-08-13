"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Headphones, Loader2, Volume2 } from "lucide-react";
import {
  canSpeakPrompt,
  speakPromptText,
  stopSpeakingPrompt,
} from "@/modules/speaking/lib/speak-question-prompt";
import { TextType } from "@/components/ui/text-type";
import { planTimedTextType } from "@/lib/timed-text-type";
import { cn } from "@/lib/utils";

/** Two equal cards that fill the exam pane (full width + remaining height). */
export const SPEAKING_SQUARE_PAIR_CLASS =
  "flex h-full min-h-0 w-full flex-col gap-2 sm:flex-row sm:gap-3";

export const SPEAKING_SQUARE_CARD_CLASS =
  "relative min-h-0 min-w-0 w-full flex-1 overflow-hidden";

type Props = {
  videoUrl?: string;
  audioUrl?: string;
  prompt: string;
  partLabel: string;
  onEnded: () => void;
  playKey: string;
  variant?: "mock" | "diagnostic";
  examinerStatus?: "ASKING" | "LISTENING" | "PREPARING" | "CAPTURED";
  stage?: "play" | "record";
  /** Keep the same card frame; swap only the question-side content. */
  recordPanel?: ReactNode;
};

/** Natural ask pace (~13 chars/sec) when media duration is not ready yet. */
function estimateAskDurationSec(prompt: string): number {
  return Math.max(2.4, Math.min(14, prompt.length / 13));
}

function ExaminerPanel({
  videoUrl,
  videoRef,
  playKey,
  onEnded,
  active,
  status,
  compact = false,
  onDuration,
}: {
  videoUrl?: string;
  videoRef?: RefObject<HTMLVideoElement | null>;
  playKey?: string;
  onEnded?: () => void;
  active: boolean;
  status: "ASKING" | "LISTENING" | "PREPARING" | "CAPTURED";
  compact?: boolean;
  onDuration?: (seconds: number) => void;
}) {
  if (compact) {
    return (
      <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-cyan/30 bg-[#0B1B32] px-4 py-3 text-white">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-navy font-display text-sm font-bold shadow-lg">
          BF
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">BandForge Examiner</span>
          <span className="mt-0.5 block font-mono text-[10px] tracking-[0.12em] text-slate-400">
            {status}
          </span>
        </span>
        <span className="size-2 shrink-0 rounded-full bg-slate-400" aria-hidden />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[16px] border border-cyan/40 bg-[#0B1B32] shadow-[0_20px_44px_rgba(13,31,60,0.22)] sm:rounded-[20px]">
      <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-slate-400/30 bg-slate-950/50 px-3 py-1.5 backdrop-blur-sm">
        <span
          className={cn(
            "size-2 rounded-full",
            active && status === "ASKING" ? "bg-cyan motion-safe:animate-pulse" : "bg-slate-400",
          )}
          aria-hidden
        />
        <span className="font-mono text-[10px] tracking-[0.12em] text-slate-200 sm:text-[11px]">
          {status}
        </span>
      </div>

      {videoUrl ? (
        <video
          ref={videoRef}
          key={playKey}
          src={videoUrl}
          className="absolute inset-0 size-full object-cover"
          playsInline
          onEnded={onEnded}
          onLoadedMetadata={(e) => {
            const d = e.currentTarget.duration;
            if (Number.isFinite(d) && d > 0) onDuration?.(d);
          }}
          aria-label="BandForge examiner video"
        />
      ) : (
        <div className="m-auto flex flex-col items-center gap-4 px-6 text-center">
          <span
            className={cn(
              "flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan via-teal to-navy font-display text-2xl font-bold text-white shadow-[0_14px_34px_rgba(0,0,0,0.35)] sm:size-24 sm:text-3xl",
              status === "LISTENING" && "opacity-75",
            )}
            aria-hidden
          >
            BF
          </span>
          <div>
            <p className="text-base font-semibold text-slate-100 sm:text-lg">BandForge Examiner</p>
            <p className="mt-1 font-mono text-[10px] tracking-[0.08em] text-slate-400 sm:text-xs">
              DIGITAL SPEAKING PROMPT
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function SpeakingQuestionPlayer({
  videoUrl,
  audioUrl,
  prompt,
  partLabel,
  onEnded,
  playKey,
  variant = "mock",
  examinerStatus = "ASKING",
  stage = "play",
  recordPanel,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const autoEndedRef = useRef(false);
  const cancelSpeakRef = useRef<(() => void) | null>(null);
  const onEndedRef = useRef(onEnded);
  const [isListening, setIsListening] = useState(false);
  const durationLockedRef = useRef(false);
  const [typePlan, setTypePlan] = useState(() =>
    planTimedTextType([{ text: prompt }], estimateAskDurationSec(prompt)),
  );
  const [typeEpoch, setTypeEpoch] = useState(0);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    durationLockedRef.current = false;
    setTypePlan(
      planTimedTextType([{ text: prompt }], estimateAskDurationSec(prompt)),
    );
    setTypeEpoch((n) => n + 1);
    const lockTimer = window.setTimeout(() => {
      durationLockedRef.current = true;
    }, 320);
    return () => window.clearTimeout(lockTimer);
  }, [playKey, prompt]);

  const handleAskDuration = useCallback(
    (seconds: number) => {
      if (durationLockedRef.current) return;
      if (!Number.isFinite(seconds) || seconds <= 0.4) return;
      durationLockedRef.current = true;
      setTypePlan(planTimedTextType([{ text: prompt }], seconds));
      setTypeEpoch((n) => n + 1);
    },
    [prompt],
  );

  const finishAutoPlay = useCallback(() => {
    if (autoEndedRef.current) return;
    autoEndedRef.current = true;
    onEndedRef.current();
  }, []);

  const stopPlayback = useCallback(() => {
    cancelSpeakRef.current?.();
    cancelSpeakRef.current = null;
    stopSpeakingPrompt();
    videoRef.current?.pause();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsListening(false);
  }, []);

  // Auto-play once per playKey only — avoid restarting when parent re-renders.
  useEffect(() => {
    autoEndedRef.current = false;
    cancelSpeakRef.current?.();
    cancelSpeakRef.current = null;
    stopSpeakingPrompt();
    videoRef.current?.pause();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (stage !== "play") {
      return;
    }

    let cancelled = false;
    let fallbackTimer: number | undefined;
    let mediaWatchdog: number | undefined;

    const runSpeechFallback = () => {
      if (prompt.trim() && canSpeakPrompt()) {
        setIsListening(true);
        cancelSpeakRef.current = speakPromptText(prompt, () => {
          if (cancelled) return;
          cancelSpeakRef.current = null;
          setIsListening(false);
          finishAutoPlay();
        });
        return;
      }
      fallbackTimer = window.setTimeout(() => {
        if (!cancelled) finishAutoPlay();
      }, prompt.trim() ? 2200 : 400);
    };

    const runAutoPlay = async () => {
      const video = videoRef.current;
      if (videoUrl && video) {
        setIsListening(true);
        video.currentTime = 0;
        try {
          await video.play();
          const d = Number.isFinite(video.duration) ? video.duration : Number.NaN;
          if (Number.isFinite(d) && d > 0) {
            mediaWatchdog = window.setTimeout(() => {
              if (!cancelled) {
                setIsListening(false);
                finishAutoPlay();
              }
            }, Math.ceil(d * 1000) + 1200);
          }
        } catch {
          if (!cancelled) {
            setIsListening(false);
            runSpeechFallback();
          }
        }
        return;
      }

      const audio = audioRef.current;
      if (audioUrl && audio) {
        setIsListening(true);
        audio.currentTime = 0;
        try {
          await audio.play();
          const d = Number.isFinite(audio.duration) ? audio.duration : Number.NaN;
          if (Number.isFinite(d) && d > 0) {
            mediaWatchdog = window.setTimeout(() => {
              if (!cancelled) {
                setIsListening(false);
                finishAutoPlay();
              }
            }, Math.ceil(d * 1000) + 1200);
          }
        } catch {
          if (!cancelled) {
            setIsListening(false);
            runSpeechFallback();
          }
        }
        return;
      }

      runSpeechFallback();
    };

    void runAutoPlay();

    return () => {
      cancelled = true;
      if (mediaWatchdog) window.clearTimeout(mediaWatchdog);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      stopPlayback();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- play once per question key only
  }, [playKey, videoUrl, audioUrl, prompt, stage]);

  const playManual = useCallback(async () => {
    stopPlayback();
    autoEndedRef.current = true;

    const video = videoRef.current;
    if (videoUrl && video) {
      setIsListening(true);
      video.currentTime = 0;
      try {
        await video.play();
      } catch {
        setIsListening(false);
      }
      return;
    }

    const audio = audioRef.current;
    if (audioUrl && audio) {
      setIsListening(true);
      audio.currentTime = 0;
      try {
        await audio.play();
      } catch {
        setIsListening(false);
      }
      return;
    }

    if (canSpeakPrompt()) {
      setIsListening(true);
      cancelSpeakRef.current = speakPromptText(prompt, () => {
        cancelSpeakRef.current = null;
        setIsListening(false);
      });
    }
  }, [audioUrl, prompt, stopPlayback, videoUrl]);

  const handleListen = useCallback(() => {
    if (isListening) {
      const wasWaitingForFirstPlay = !autoEndedRef.current;
      stopPlayback();
      if (wasWaitingForFirstPlay) {
        finishAutoPlay();
      }
      return;
    }
    void playManual();
  }, [finishAutoPlay, isListening, playManual, stopPlayback]);

  const handleMediaEnded = useCallback(() => {
    setIsListening(false);
    if (!autoEndedRef.current) {
      finishAutoPlay();
    }
  }, [finishAutoPlay]);

  useEffect(() => {
    if (stage === "play") return;
    stopPlayback();
  }, [stage, stopPlayback]);

  const listenLabel = isListening ? "Stop" : "Listen";
  const hasPrompt = Boolean(prompt.trim());
  const canListen = Boolean(
    videoUrl || audioUrl || (hasPrompt && canSpeakPrompt()),
  );

  return (
    <div className={SPEAKING_SQUARE_PAIR_CLASS}>
      <div className={SPEAKING_SQUARE_CARD_CLASS}>
      <ExaminerPanel
        videoUrl={videoUrl}
        videoRef={videoRef}
        playKey={playKey}
        onEnded={handleMediaEnded}
        active={isListening}
        status={examinerStatus}
        onDuration={handleAskDuration}
      />
      </div>

      <div
        className={cn(
          SPEAKING_SQUARE_CARD_CLASS,
          "flex flex-col overflow-hidden rounded-[16px] border border-navy/12 bg-white p-3 sm:rounded-[20px] sm:p-5 lg:p-6",
          variant === "diagnostic" && "shadow-[0_14px_30px_rgba(13,31,60,0.07)]",
        )}
      >
        {stage === "record" && recordPanel ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{recordPanel}</div>
        ) : (
          <>
            <div className="flex min-h-9 flex-wrap items-start justify-between gap-2 sm:min-h-11 sm:gap-3">
              <p className="font-mono text-[9px] tracking-[0.14em] text-teal uppercase sm:text-[11px]">
                {partLabel}
              </p>
              {canListen ? (
                <button
                  type="button"
                  onClick={handleListen}
                  className={cn(
                    "inline-flex min-h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition-colors duration-200 sm:min-h-11 sm:gap-2 sm:px-4 sm:py-2 sm:text-[13px]",
                    isListening
                      ? "border-cyan/45 bg-cyan/12 text-teal"
                      : "border-navy/15 bg-slate-50 text-navy hover:border-cyan/40 hover:bg-cyan/10",
                  )}
                  aria-label={
                    isListening
                      ? "Stop listening to question"
                      : "Listen to examiner question"
                  }
                >
                  {isListening ? (
                    <Loader2 className="size-3.5 shrink-0 motion-safe:animate-spin" />
                  ) : (
                    <Headphones className="size-3.5 shrink-0" />
                  )}
                  {listenLabel}
                </button>
              ) : null}
            </div>

            {audioUrl && !videoUrl ? (
              <audio
                ref={audioRef}
                key={playKey}
                src={audioUrl}
                onEnded={handleMediaEnded}
                onLoadedMetadata={(e) =>
                  handleAskDuration(e.currentTarget.duration)
                }
                className="hidden"
              />
            ) : null}

            <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-1 py-2 text-center sm:items-start sm:px-0 sm:py-3 sm:text-left lg:py-8">
              <div className="mb-2 flex size-8 items-center justify-center rounded-full bg-cyan/10 text-teal sm:mb-4 sm:size-11">
                <Volume2 className="size-4 sm:size-5" aria-hidden />
              </div>
              <p className="font-mono text-[9px] font-medium tracking-[0.14em] text-teal uppercase sm:text-[10px]">
                Question
              </p>
              {hasPrompt ? (
                <div
                  className="mt-2 min-h-[2.4em] w-full sm:mt-3 sm:min-h-[3em]"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <TextType
                    key={`${playKey}-${typeEpoch}`}
                    as="h2"
                    text={prompt}
                    loop={false}
                    typingSpeed={typePlan.typingSpeed}
                    variableSpeed={typePlan.variableSpeed}
                    initialDelay={typePlan.delays[0] ?? 180}
                    showCursor
                    cursorCharacter="|"
                    cursorBlinkDuration={0.55}
                    hideCursorWhileTyping={false}
                    className="block w-full break-words whitespace-pre-wrap font-display text-[15px] font-semibold leading-snug text-navy sm:text-xl lg:text-2xl"
                  />
                </div>
              ) : (
                <p className="mt-2 max-w-[20rem] text-[13px] leading-snug text-[#5A6B82] sm:mt-3 sm:max-w-none sm:text-sm">
                  {videoUrl
                    ? "Watch the examiner, then record your answer."
                    : "Recording starts automatically."}
                </p>
              )}
              <p className="mt-3 hidden text-sm leading-relaxed text-[#5A6B82] sm:mt-5 sm:block">
                {canListen
                  ? "Listen to the full question. Your recording starts automatically when it ends."
                  : "Your recording starts automatically after the question."}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Read-only question card shown while the student is answering. */
export function SpeakingQuestionCard({
  prompt,
  partLabel,
  videoUrl,
  variant = "mock",
  examinerStatus = "LISTENING",
}: {
  prompt: string;
  partLabel: string;
  /** When present, video is primary — do not show examiner text. */
  videoUrl?: string;
  variant?: "mock" | "diagnostic";
  /** Examiner pill — LISTENING while recording, CAPTURED after save. */
  examinerStatus?: "ASKING" | "LISTENING" | "PREPARING" | "CAPTURED";
}) {
  return (
    <div className={cn(SPEAKING_SQUARE_CARD_CLASS, "flex min-h-0 min-w-0")}>
      <ExaminerPanel
        videoUrl={videoUrl}
        active={false}
        status={examinerStatus}
      />
      <span className="sr-only">
        {partLabel}. {prompt}
      </span>
    </div>
  );
}
