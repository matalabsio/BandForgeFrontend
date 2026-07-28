"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Check,
  Clock,
  Pause,
  Play,
  RotateCcw,
  Smartphone,
  VolumeX,
} from "lucide-react";
import { bfPrimaryCtaDiagClass } from "@/components/bandforge/bf-primary-cta-styles";
import { Button } from "@/components/ui/button";
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
      const ctx = waveCtxRef.current && waveCtxRef.current.state !== "closed"
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
      if (audioTracks.length === 0 || audioTracks.some((track) => track.readyState !== "live")) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error("The selected microphone is not ready. Reconnect it and try again.");
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
          setError("We didn't capture any audio. Tap Test my microphone and try again.");
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
      setError("Could not play your recording. Check speaker volume and try again.");
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

  if (isDiagnostic) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top,_#F0FBFC_0%,_#FFFFFF_55%)]">
        <audio ref={audioRef} className="hidden" playsInline preload="auto" />

        <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-1 flex-col px-4 py-3 sm:px-6 sm:py-4 lg:max-w-4xl lg:px-8 lg:py-5">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px] border border-[#E8EEF4] bg-white lg:rounded-[24px]">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-6 sm:py-5 lg:overflow-hidden lg:px-7 lg:py-5">
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
                  text="A quick mic check, then Part 1, Part 2, and Part 3 run continuously — like the real IELTS Speaking test."
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
                  className="size-[72px] sm:size-[84px] lg:size-[80px]"
                />

                <p
                  className="mt-3 text-[14px] font-semibold text-navy sm:mt-3.5 sm:text-[15px]"
                  role="status"
                  aria-live="polite"
                >
                  {statusLabel}
                </p>
                <p className="mt-0.5 text-[12px] text-[#64748B] sm:text-[13px]">{statusSub}</p>

                {phase === "idle" ? (
                  <button
                    type="button"
                    onClick={() => void startTest()}
                    className={cn(
                      bfPrimaryCtaDiagClass,
                      "mt-4 h-[46px] sm:mx-auto sm:mt-4 sm:h-[48px] sm:max-w-sm",
                    )}
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
                      isPlaying ? "Pause your test recording" : "Play your test recording"
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
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
                    <button
                      type="button"
                      onClick={handleConfirm}
                      className={cn(
                        "flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2 sm:min-h-[48px] sm:text-sm",
                        confirmed
                          ? "border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]"
                          : "border-[#E8EEF4] bg-white text-navy hover:border-cyan/40 hover:bg-cyan/5",
                      )}
                    >
                      <Check className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                      I hear myself clearly
                    </button>
                    <button
                      type="button"
                      onClick={handleRecordAgain}
                      className="flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#E8EEF4] bg-white px-3 py-2 text-[13px] font-semibold text-[#475569] transition-colors duration-200 hover:border-navy/20 hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2 sm:min-h-[48px] sm:text-sm"
                    >
                      <RotateCcw className="size-3.5 shrink-0" aria-hidden />
                      Record again
                    </button>
                  </div>
                ) : null}
              </div>

              <ul className="mx-auto mt-4 grid max-w-3xl gap-2 sm:mt-5 sm:grid-cols-3 sm:gap-2.5 lg:mt-4">
                <DiagTip
                  title="Find a quiet room"
                  body="Background noise affects your transcript and examiner review."
                  delayMs={1600}
                />
                <DiagTip
                  title={`Keep ${totalMinutes} minutes free`}
                  body="Parts 1–3 run in one sitting — no breaks."
                  delayMs={2400}
                />
                <DiagTip
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

          <div className="shrink-0 pt-3 pb-[max(0.25rem,env(safe-area-inset-bottom))] sm:pt-4">
            <button
              type="button"
              disabled={!confirmed || beginBusy}
              onClick={onBegin}
              className={cn(bfPrimaryCtaDiagClass, "h-[48px] text-[15px] sm:h-[52px] sm:text-[16px]")}
            >
              <span className="relative z-[1]">
                {beginBusy ? "Starting…" : beginLabel}
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

  return (
    <div className="mx-auto w-full max-w-md rounded-[28px] border border-cyan/20 bg-gradient-to-b from-[#081426] to-[#0D1F3C] p-5 text-[#EAF1F8] shadow-2xl md:max-w-3xl md:p-7 lg:max-w-4xl">
      <audio ref={audioRef} className="hidden" playsInline preload="auto" />

      <div>
        <div className="flex items-center justify-between">
          <span className="font-display text-[17px] font-extrabold tracking-tight">
            <span className="text-[#EAF1F8]">Band</span>
            <span className="text-cyan">Forge</span>
          </span>
          <span className="font-mono text-[10px] tracking-widest text-[#5F7492] uppercase">
            Setup · 1 of 1
          </span>
        </div>
        <div className="mt-5 flex gap-1.5">
          <span className="h-1 flex-1 rounded-sm bg-[#3ECF8E]" />
          <span className="h-1 flex-1 rounded-sm bg-[#3ECF8E]" />
          <span className="h-1 flex-1 rounded-sm bg-cyan" />
        </div>

        <div className="mt-6">
          <p className="font-mono text-[10px] tracking-[0.14em] text-teal uppercase">
            Before you begin
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-bold leading-tight">
            Let&apos;s check your microphone
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-[#9FB2C8] sm:text-sm">
            Your Speaking test is recorded and evaluated by an examiner. Thirty seconds here
            makes sure every word is captured.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[18px] border border-cyan/15 bg-[#122747] p-5 text-center sm:p-6 md:mx-auto md:max-w-2xl">
        <SpeakingMicHero phase={phase} variant="standalone" />

        <p className="mt-4 text-sm font-semibold" role="status" aria-live="polite">
          {statusLabel}
        </p>
        <p className="mt-1 text-xs text-[#5F7492]">{statusSub}</p>

        {phase === "idle" ? (
          <Button
            variant="primary"
            className="mt-5 min-h-[var(--spacing-touch,48px)] w-full sm:max-w-sm"
            onClick={() => void startTest()}
          >
            Test my microphone
          </Button>
        ) : null}

        {phase === "recording" ? (
          <div className="mx-auto mt-5 w-full max-w-sm rounded-xl border border-cyan/15 bg-teal/10 px-3 py-3">
            <MicWaveform active />
          </div>
        ) : null}

        {(phase === "playback" || phase === "confirmed") && playbackUrl ? (
          <button
            type="button"
            onClick={() => void playPlayback()}
            className={cn(
              "mt-5 flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-cyan/15 bg-teal/10 px-3 py-2.5 text-left transition-colors duration-200 hover:bg-teal/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan",
              isPlaying && "border-cyan/40 ring-2 ring-cyan/20",
            )}
            aria-label={isPlaying ? "Pause your test recording" : "Play your test recording"}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cyan">
              {isPlaying ? (
                <Pause className="size-4 fill-[#06222B] text-[#06222B]" />
              ) : (
                <Play className="size-4 fill-[#06222B] text-[#06222B]" />
              )}
            </span>
            <MicWaveform
              active={isPlaying}
              analyserRef={waveAnalyserRef}
              audioContextRef={waveCtxRef}
            />
            <span className="shrink-0 font-mono text-[10px] text-[#6E83A0]">{durationLabel}</span>
          </button>
        ) : null}

        {phase === "playback" || phase === "confirmed" ? (
          <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              className={cn(
                "flex min-h-[var(--spacing-touch,48px)] cursor-pointer items-center justify-center gap-1.5 rounded-[11px] border px-3 py-2.5 text-xs font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:text-sm",
                confirmed
                  ? "border-[#3ECF8E]/40 bg-[#3ECF8E]/12 text-[#3ECF8E]"
                  : "border-cyan/15 text-[#9FB2C8] hover:border-[#3ECF8E]/30",
              )}
            >
              <Check className="size-3.5 shrink-0" strokeWidth={2.5} />
              I hear myself clearly
            </button>
            <button
              type="button"
              onClick={handleRecordAgain}
              className="flex min-h-[var(--spacing-touch,48px)] cursor-pointer items-center justify-center gap-1.5 rounded-[11px] border border-cyan/15 px-3 py-2.5 text-xs font-semibold text-[#9FB2C8] transition-colors duration-200 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:text-sm"
            >
              <RotateCcw className="size-3.5 shrink-0" />
              Record again
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-6 md:mx-auto md:w-full md:max-w-3xl">
        <h2 className="font-display text-[15px] font-bold">Set up like the real test</h2>
        <div className="mt-3 space-y-2">
          <ChecklistItem
            variant={variant}
            icon={<VolumeX className="size-3.5 text-cyan" strokeWidth={1.8} />}
            title="Find a quiet room"
            body="Background noise affects your transcript and your examiner's review."
          />
          <ChecklistItem
            variant={variant}
            icon={<Clock className="size-3.5 text-cyan" strokeWidth={1.8} />}
            title="Keep 15 minutes free"
            body="The test runs in one sitting — Parts 1, 2 and 3 without breaks, like the real exam."
          />
        </div>
        <div className="mt-2 flex gap-3 rounded-xl border border-[#F5C46B]/30 bg-[#F5C46B]/10 p-3.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#F5C46B]/16">
            <Smartphone className="size-3.5 text-[#F5C46B]" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#F5C46B]">Keep your screen on</p>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-[#9FB2C8]">
              We&apos;ll try to keep your screen awake during the test. Locking your phone or
              switching apps can still stop the recording.
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <p
          className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-6 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:mx-auto md:w-full md:max-w-3xl">
        <Button
          variant="primary"
          className="min-h-[var(--spacing-touch,48px)] w-full bg-cyan text-[#0D1F3C] hover:bg-cyan/90"
          disabled={!confirmed || beginBusy}
          onClick={onBegin}
        >
          {beginBusy ? "Starting…" : beginLabel}
        </Button>
        <p className="mt-2.5 text-center font-mono text-[10px] tracking-widest text-[#5F7492] uppercase">
          Part 1 starts immediately · {totalMinutes} min total
        </p>
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
          const end = Math.max(start + 1, Math.floor(((i + 1) / WAVE_BARS) * usable));
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
            const envelope = 0.35 + 0.65 * Math.sin(Math.PI * (i / (WAVE_BARS - 1)));
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

function DiagTip({
  title,
  body,
  delayMs = 0,
}: {
  title: string;
  body: string;
  delayMs?: number;
}) {
  return (
    <li className="rounded-[12px] border border-[#E8EEF4] bg-[#F8FBFC] px-3 py-2.5 sm:px-3.5 sm:py-3">
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

function ChecklistItem({
  icon,
  title,
  body,
  variant,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  variant: Variant;
}) {
  const isDiagnostic = variant === "diagnostic";
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border p-3.5",
        isDiagnostic ? "border-navy/10 bg-white" : "border-cyan/15 bg-[#122747]",
      )}
    >
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-cyan/12">
        {icon}
      </div>
      <div className="min-w-0">
        <p className={cn("text-xs font-semibold", isDiagnostic ? "text-navy" : undefined)}>
          {title}
        </p>
        <p
          className={cn(
            "mt-0.5 text-[11.5px] leading-relaxed",
            isDiagnostic ? "text-[#6E83A0]" : "text-[#5F7492]",
          )}
        >
          {body}
        </p>
      </div>
    </div>
  );
}
