"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Pause, Play, RotateCcw } from "lucide-react";
import {
  bfPrimaryCtaDiagClass,
  bfPrimaryCtaDiagInnerClass,
} from "@/components/bandforge/bf-primary-cta-styles";
import { TextType } from "@/components/ui/text-type";
import {
  formatAudioDuration,
  getAudioRecordingCapability,
  getSupportedAudioMimeType,
} from "@/modules/speaking/lib/media-recorder-support";
import { SpeakingMicHero } from "@/modules/speaking/components/speaking-mic-hero";
import { cn } from "@/lib/utils";

type Phase = "idle" | "recording" | "playback" | "confirmed";
type Variant = "standalone" | "diagnostic";

type Props = {
  onBegin: () => void;
  beginLabel?: string;
  beginBusy?: boolean;
  totalMinutes?: number;
  variant?: Variant;
};

const MIC_TEST_SEC = 5;
const RECORDER_TIMESLICE_MS = 250;
const WAVE_BARS = 28;

function idleWaveLevels(count = WAVE_BARS): number[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / Math.max(1, count - 1);
    const envelope = 0.28 + 0.72 * Math.sin(Math.PI * t);
    const ripple = 0.55 + 0.25 * Math.sin(i * 0.9) + 0.12 * Math.cos(i * 1.6);
    return Math.min(1, envelope * ripple * 0.55);
  });
}

export function SpeakingMicCheck({
  onBegin,
  beginLabel = "Begin Speaking Test",
  beginBusy = false,
  totalMinutes = 14,
  variant = "standalone",
}: Props) {
  const isDiagnostic = variant === "diagnostic";
  const [phase, setPhase] = useState<Phase>("idle");
  const [recordSec, setRecordSec] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const tickRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mountedRef = useRef(true);
  const playbackUrlRef = useRef<string | null>(null);
  const waveCtxRef = useRef<AudioContext | null>(null);
  const waveAnalyserRef = useRef<AnalyserNode | null>(null);
  const waveSourceBoundRef = useRef(false);

  const stopStream = useCallback((discardRecorder = false) => {
    const recorder = recorderRef.current;
    if (discardRecorder && recorder && recorder.state !== "inactive") {
      recorder.ondataavailable = null;
      recorder.onerror = null;
      recorder.onstop = null;
      try {
        recorder.stop();
      } catch {
        /* recorder already stopped */
      }
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
    }
    tickRef.current = null;
  }, []);

  const resetPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setIsPlaying(false);
    setPlaybackDuration(0);
    setPlaybackUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      playbackUrlRef.current = null;
      return null;
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      mountedRef.current = false;
      clearTick();
      stopStream(true);
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
      }
      if (playbackUrlRef.current) URL.revokeObjectURL(playbackUrlRef.current);
      const ctx = waveCtxRef.current;
      waveCtxRef.current = null;
      waveAnalyserRef.current = null;
      waveSourceBoundRef.current = false;
      if (ctx && ctx.state !== "closed") void ctx.close();
    };
  }, [clearTick, stopStream]);

  const ensureWaveAnalyser = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return null;
    if (waveAnalyserRef.current) return waveAnalyserRef.current;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;

    try {
      const ctx =
        waveCtxRef.current && waveCtxRef.current.state !== "closed"
          ? waveCtxRef.current
          : new AudioCtx();
      waveCtxRef.current = ctx;
      if (!waveSourceBoundRef.current) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.72;
        const source = ctx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        waveAnalyserRef.current = analyser;
        waveSourceBoundRef.current = true;
      }
      return waveAnalyserRef.current;
    } catch {
      return waveAnalyserRef.current;
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playbackUrl) return;

    audio.src = playbackUrl;
    audio.load();

    const onLoaded = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setPlaybackDuration(audio.duration);
      }
    };
    const onEnded = () => setIsPlaying(false);
    const onPause = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
    };
  }, [playbackUrl]);

  const startTest = useCallback(async () => {
    setError(null);
    setConfirmed(false);
    resetPlayback();
    clearTick();
    stopStream(true);
    chunksRef.current = [];

    try {
      const capability = getAudioRecordingCapability();
      if (!capability.supported) throw new Error(capability.message);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioTracks = stream.getAudioTracks();
      if (
        audioTracks.length === 0 ||
        audioTracks.some((track) => track.readyState !== "live")
      ) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error(
          "The selected microphone is not ready. Reconnect it and try again.",
        );
      }
      streamRef.current = stream;

      const mimeType = getSupportedAudioMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      recorderRef.current = recorder;
      audioTracks.forEach((track) => {
        track.onended = () => {
          if (!mountedRef.current || recorderRef.current !== recorder) return;
          clearTick();
          stopStream(true);
          setError("The microphone disconnected. Reconnect it, then test again.");
          setPhase("idle");
        };
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        clearTick();
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || "audio/webm",
        });
        stopStream();

        if (blob.size < 500) {
          setError(
            "We didn't capture any audio. Tap Test my microphone and try again.",
          );
          setPhase("idle");
          chunksRef.current = [];
          return;
        }

        const url = URL.createObjectURL(blob);
        playbackUrlRef.current = url;
        setPlaybackUrl(url);
        setPlaybackDuration(MIC_TEST_SEC);
        setPhase("playback");
        chunksRef.current = [];
      };

      recorder.onerror = () => {
        clearTick();
        stopStream();
        setError("Recording failed. Please try again.");
        setPhase("idle");
      };

      setPhase("recording");
      setRecordSec(0);
      recorder.start(RECORDER_TIMESLICE_MS);

      const start = Date.now();
      tickRef.current = window.setInterval(() => {
        const elapsed = Math.round((Date.now() - start) / 1000);
        setRecordSec(elapsed);
        if (elapsed >= MIC_TEST_SEC && recorder.state === "recording") {
          clearTick();
          try {
            recorder.requestData();
          } catch {
            /* optional */
          }
          recorder.stop();
        }
      }, 200);
    } catch (e) {
      clearTick();
      stopStream(true);
      const name = e instanceof DOMException ? e.name : "";
      const message =
        name === "NotAllowedError" || name === "PermissionDeniedError"
          ? "Microphone permission was denied. Enable it in browser settings, then try again."
          : name === "NotFoundError" || name === "DevicesNotFoundError"
            ? "No microphone was found. Connect one, then try again."
            : e instanceof Error
              ? e.message
              : "Could not access the microphone. Check the device and try again.";
      setError(message);
      setPhase("idle");
    }
  }, [clearTick, resetPlayback, stopStream]);

  const playPlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !playbackUrl) return;

    setError(null);
    try {
      if (isPlaying) {
        audio.pause();
        return;
      }
      ensureWaveAnalyser();
      const ctx = waveCtxRef.current;
      if (ctx?.state === "suspended") await ctx.resume();
      if (audio.ended || audio.currentTime > 0) {
        audio.currentTime = 0;
      }
      await audio.play();
    } catch {
      setError(
        "Could not play your recording. Check speaker volume and try again.",
      );
      setIsPlaying(false);
    }
  }, [ensureWaveAnalyser, isPlaying, playbackUrl]);

  const handleConfirm = useCallback(() => {
    setConfirmed(true);
    setPhase("confirmed");
  }, []);

  const handleRecordAgain = useCallback(() => {
    setConfirmed(false);
    void startTest();
  }, [startTest]);

  const statusLabel =
    phase === "recording"
      ? `Recording… ${recordSec}s / ${MIC_TEST_SEC}s`
      : phase === "playback" || phase === "confirmed"
        ? isPlaying
          ? "Playing your recording…"
          : "Recording captured"
        : "Tap below to test your microphone";

  const statusSub =
    phase === "recording"
      ? "Speak normally — we'll play it back in a moment."
      : phase === "playback" || phase === "confirmed"
        ? "Listen back, then confirm you can hear yourself clearly."
        : "Your answers are recorded for examiner review.";

  const durationLabel = formatAudioDuration(
    playbackDuration > 0 ? playbackDuration : MIC_TEST_SEC,
  );

  const subtitle = isDiagnostic
    ? "A quick mic check, then Part 1, Part 2, and Part 3 run continuously — like the real IELTS Speaking test."
    : "A quick mic check, then your Speaking section starts. Answers are recorded for examiner review.";

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top,_#F0FBFC_0%,_#FFFFFF_55%)]">
      <audio ref={audioRef} className="hidden" playsInline preload="auto" />

      <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-1 flex-col px-4 py-3 sm:px-6 sm:py-4 lg:max-w-4xl lg:px-8 lg:py-5">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px] border border-[#E8EEF4] bg-white lg:rounded-[24px]">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-6 sm:py-5 lg:px-7 lg:py-5">
            <header className="mx-auto max-w-2xl shrink-0 text-center">
              <p className="font-mono text-[10px] tracking-[0.14em] text-teal uppercase">
                Before you begin
              </p>
              <TextType
                as="h1"
                text="Check your microphone"
                loop={false}
                typingSpeed={42}
                showCursor
                cursorCharacter="|"
                cursorBlinkDuration={0.55}
                className="mt-1.5 block w-full text-center font-display text-[22px] leading-[1.15] font-bold tracking-[-0.03em] text-navy sm:text-[26px] lg:text-[28px]"
              />
              <TextType
                as="p"
                text={subtitle}
                loop={false}
                typingSpeed={28}
                initialDelay={900}
                showCursor={false}
                className="mx-auto mt-1.5 block w-full max-w-[48ch] text-center text-[13px] leading-snug text-[#64748B] sm:text-[14px]"
              />
            </header>

            <div className="mx-auto mt-4 max-w-xl rounded-[16px] border border-[#E8EEF4] bg-[#F8FBFC] px-3 py-4 text-center sm:mt-5 sm:px-5 sm:py-5 lg:mt-4 lg:py-4">
              <SpeakingMicHero
                phase={phase}
                variant="diagnostic"
                className="size-[100px] sm:size-[112px] lg:size-[108px]"
              />

              <p
                className="mt-3 text-[14px] font-semibold text-navy sm:mt-3.5 sm:text-[15px]"
                role="status"
                aria-live="polite"
              >
                {statusLabel}
              </p>
              <p className="mt-0.5 text-[12px] text-[#64748B] sm:text-[13px]">
                {statusSub}
              </p>

              {phase === "idle" ? (
                <button
                  type="button"
                  onClick={() => void startTest()}
                  className={cn(bfPrimaryCtaDiagClass, "mt-4")}
                >
                  <span className="relative z-[1]">Test my microphone</span>
                </button>
              ) : null}

              {phase === "recording" ? (
                <div className="mx-auto mt-4 w-full max-w-sm rounded-[14px] border border-[#E8EEF4] bg-white px-3 py-2.5">
                  <MicWaveform active />
                  <div
                    className="mx-auto mt-2.5 h-1 w-full max-w-[200px] overflow-hidden rounded-full bg-[#E2E8F0]"
                    aria-hidden
                  >
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#0097a7_0%,#00bcd4_50%,#0097a7_100%)] transition-[width] duration-200 ease-linear"
                      style={{
                        width: `${Math.min(100, (recordSec / MIC_TEST_SEC) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ) : null}

              {(phase === "playback" || phase === "confirmed") && playbackUrl ? (
                <button
                  type="button"
                  onClick={() => void playPlayback()}
                  className={cn(
                    "mt-4 flex w-full cursor-pointer items-center gap-2.5 rounded-[14px] border border-[#E8EEF4] bg-white px-3 py-2.5 text-left transition-colors duration-200 hover:border-cyan/40 hover:bg-cyan/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2",
                    isPlaying && "border-cyan/40 ring-2 ring-cyan/15",
                  )}
                  aria-label={
                    isPlaying
                      ? "Pause your test recording"
                      : "Play your test recording"
                  }
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#00BCD4_0%,#0097A7_100%)] text-white">
                    {isPlaying ? (
                      <Pause className="size-4 fill-current" aria-hidden />
                    ) : (
                      <Play className="size-4 fill-current" aria-hidden />
                    )}
                  </span>
                  <MicWaveform
                    active={isPlaying}
                    analyserRef={waveAnalyserRef}
                    audioContextRef={waveCtxRef}
                  />
                  <span className="shrink-0 font-mono text-[10px] text-[#64748B]">
                    {durationLabel}
                  </span>
                </button>
              ) : null}

              {phase === "playback" || phase === "confirmed" ? (
                <div className="mt-3 grid grid-cols-2 items-stretch gap-2 sm:gap-2.5">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className={cn(
                      "flex h-full min-h-[44px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border px-2 py-2 text-center text-[12px] font-semibold leading-snug transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2 sm:min-h-[48px] sm:px-3 sm:text-sm",
                      confirmed
                        ? "border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]"
                        : "border-[#E8EEF4] bg-white text-navy hover:border-cyan/40 hover:bg-cyan/5",
                    )}
                  >
                    <Check
                      className="size-3.5 shrink-0"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    I hear myself clearly
                  </button>
                  <button
                    type="button"
                    onClick={handleRecordAgain}
                    className="flex h-full min-h-[44px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#E8EEF4] bg-white px-2 py-2 text-center text-[12px] font-semibold leading-snug text-[#475569] transition-colors duration-200 hover:border-navy/20 hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2 sm:min-h-[48px] sm:px-3 sm:text-sm"
                  >
                    <RotateCcw className="size-3.5 shrink-0" aria-hidden />
                    Record again
                  </button>
                </div>
              ) : null}
            </div>

            <ul className="mx-auto mt-4 grid max-w-3xl grid-cols-2 items-stretch gap-2 sm:mt-5 sm:grid-cols-3 sm:gap-2.5 lg:mt-4">
              <TipCard
                title="Find a quiet room"
                body="Background noise affects your transcript and examiner review."
                delayMs={1600}
              />
              <TipCard
                title={`Keep ${totalMinutes} minutes free`}
                body="Parts 1–3 run in one sitting — no breaks."
                delayMs={2400}
              />
              <TipCard
                title="Keep your screen on"
                body="Locking or switching apps can stop recording."
                delayMs={3200}
              />
            </ul>
          </div>
        </div>

        {error ? (
          <p
            className="mt-2 shrink-0 rounded-[12px] border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="sticky bottom-0 z-10 shrink-0 border-t border-[#E8EEF4] bg-white pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pt-4">
          <button
            type="button"
            disabled={!confirmed || beginBusy}
            onClick={onBegin}
            className={bfPrimaryCtaDiagClass}
          >
            <span className={bfPrimaryCtaDiagInnerClass}>
              {beginBusy ? "Starting…" : beginLabel}
              {!beginBusy ? (
                <ArrowRight className="size-4 shrink-0" aria-hidden />
              ) : null}
            </span>
          </button>
          <p className="mt-2 text-center font-mono text-[10px] tracking-[0.14em] text-[#94A3B8] uppercase">
            Part 1 starts immediately · {totalMinutes} min total
          </p>
        </div>
      </div>
    </div>
  );
}

function MicWaveform({
  active,
  analyserRef,
  audioContextRef,
}: {
  active: boolean;
  analyserRef?: React.RefObject<AnalyserNode | null>;
  audioContextRef?: React.RefObject<AudioContext | null>;
}) {
  const [levels, setLevels] = useState(idleWaveLevels);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (!active) {
      setLevels(idleWaveLevels());
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setLevels(idleWaveLevels().map((v) => Math.min(1, v + 0.25)));
      return;
    }

    const ctx = audioContextRef?.current;
    if (ctx?.state === "suspended") void ctx.resume();

    const analyser = analyserRef?.current ?? null;
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    let t0 = performance.now();

    const tick = (now: number) => {
      if (analyser && data) {
        analyser.getByteFrequencyData(data);
        const next: number[] = [];
        const usable = Math.max(8, Math.floor(data.length * 0.55));
        for (let i = 0; i < WAVE_BARS; i++) {
          const start = Math.floor((i / WAVE_BARS) * usable);
          const end = Math.max(
            start + 1,
            Math.floor(((i + 1) / WAVE_BARS) * usable),
          );
          let sum = 0;
          for (let j = start; j < end; j++) sum += data[j] ?? 0;
          const avg = sum / (end - start) / 255;
          next.push(Math.min(1, Math.pow(avg, 0.65) * 1.4));
        }
        setLevels(next);
      } else {
        const t = (now - t0) / 1000;
        setLevels(
          Array.from({ length: WAVE_BARS }, (_, i) => {
            const envelope =
              0.35 + 0.65 * Math.sin(Math.PI * (i / (WAVE_BARS - 1)));
            const voice =
              0.45 +
              0.35 * Math.sin(t * 7.2 + i * 0.55) +
              0.2 * Math.sin(t * 11.5 + i * 1.1);
            return Math.min(1, envelope * voice);
          }),
        );
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [active, analyserRef, audioContextRef]);

  return (
    <div
      className="flex h-9 min-w-[7rem] flex-1 items-center justify-between gap-[2px] overflow-hidden px-0.5"
      aria-hidden
    >
      {levels.map((level, i) => (
        <span
          key={i}
          className="w-[3px] shrink-0 rounded-full bg-[#00BCD4] sm:w-[3.5px]"
          style={{
            height: `${Math.max(5, Math.round(5 + level * 26))}px`,
            opacity: 0.45 + level * 0.55,
            transition: active
              ? "height 50ms linear, opacity 50ms linear"
              : "height 200ms ease",
          }}
        />
      ))}
    </div>
  );
}

function TipCard({
  title,
  body,
  delayMs = 0,
}: {
  title: string;
  body: string;
  delayMs?: number;
}) {
  return (
    <li className="flex h-full flex-col rounded-[12px] border border-[#E8EEF4] bg-[#F8FBFC] px-3 py-2.5 sm:px-3.5 sm:py-3 last:max-sm:col-span-2">
      <TextType
        as="p"
        text={title}
        loop={false}
        typingSpeed={36}
        initialDelay={delayMs}
        showCursor={false}
        className="block w-full text-[13px] font-semibold leading-snug text-navy sm:text-[13.5px]"
      />
      <TextType
        as="p"
        text={body}
        loop={false}
        typingSpeed={22}
        initialDelay={delayMs + Math.min(900, title.length * 36 + 120)}
        showCursor={false}
        className="mt-0.5 block w-full text-[12px] leading-snug text-[#64748B] sm:text-[12.5px]"
      />
    </li>
  );
}
