"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Clock, Mic, Pause, Play, RotateCcw, Smartphone, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatAudioDuration,
  getAudioRecordingCapability,
  getSupportedAudioMimeType,
} from "@/modules/speaking/lib/media-recorder-support";
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
      tickRef.current = null;
    }
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
    };
  }, [clearTick, stopStream]);

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
      if (audio.ended || audio.currentTime > 0) {
        audio.currentTime = 0;
      }
      await audio.play();
    } catch {
      setError("Could not play your recording. Check speaker volume and try again.");
      setIsPlaying(false);
    }
  }, [isPlaying, playbackUrl]);

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
        ? "Tap play to listen, then confirm you can hear yourself clearly."
        : "Your Speaking test is recorded and evaluated by an examiner.";

  const durationLabel = formatAudioDuration(
    playbackDuration > 0 ? playbackDuration : MIC_TEST_SEC,
  );

  return (
    <div
      className={cn(
        "w-full",
        isDiagnostic
          ? "mx-auto max-w-[760px]"
          : "mx-auto max-w-md rounded-[28px] border border-cyan/20 bg-gradient-to-b from-[#081426] to-[#0D1F3C] p-5 text-[#EAF1F8] shadow-2xl md:max-w-3xl md:p-7 lg:max-w-4xl",
      )}
    >
      {/* Hidden audio element — reliable playback across browsers */}
      <audio ref={audioRef} className="hidden" playsInline preload="auto" />

      <div className={cn(isDiagnostic ? "pb-2" : "")}>
        {!isDiagnostic ? (
          <>
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
          </>
        ) : null}

        <div className={cn(isDiagnostic ? "mt-1" : "mt-6")}>
          <p className="font-mono text-[10px] tracking-[0.14em] text-teal uppercase">
            Before you begin
          </p>
          <h1
            className={cn(
              "mt-1.5 font-display font-bold leading-tight",
              isDiagnostic ? "text-xl text-navy sm:text-2xl" : "text-2xl",
            )}
          >
            Let&apos;s check your microphone
          </h1>
          <p
            className={cn(
              "mt-2 text-[13px] leading-relaxed sm:text-sm",
              isDiagnostic ? "text-[#5A6B82]" : "text-[#9FB2C8]",
            )}
          >
            Your Speaking test is recorded and evaluated by an examiner. Thirty seconds here makes
            sure every word is captured.
          </p>
        </div>
      </div>

      <div
        className={cn(
          "mt-5 rounded-[18px] p-5 text-center sm:p-6",
          isDiagnostic
            ? "border border-navy/12 bg-white shadow-[0_14px_30px_rgba(13,31,60,0.07)]"
            : "border border-cyan/15 bg-[#122747] md:mx-auto md:max-w-2xl",
        )}
      >
        <div
          className={cn(
            "relative mx-auto flex items-center justify-center rounded-full border-2",
            isDiagnostic
              ? "size-24 border-cyan/45 bg-cyan/10"
              : "size-[104px] border-cyan bg-[radial-gradient(circle_at_50%_40%,rgba(0,188,212,0.25),rgba(0,151,167,0.05))]",
          )}
        >
          <Mic
            className={cn("text-cyan", isDiagnostic ? "size-9" : "size-10")}
            strokeWidth={1.8}
          />
          {phase === "recording" ? (
            <>
              <span className="absolute -inset-2.5 motion-safe:animate-ping rounded-full border border-cyan/35" />
              <span className="absolute -inset-2.5 rounded-full border border-cyan/20" />
            </>
          ) : null}
        </div>

        <p
          className={cn(
            "mt-4 text-sm font-semibold",
            isDiagnostic ? "text-navy" : undefined,
          )}
          role="status"
          aria-live="polite"
        >
          {statusLabel}
        </p>
        <p
          className={cn(
            "mt-1 text-xs",
            isDiagnostic ? "text-[#475569]" : "text-[#5F7492]",
          )}
        >
          {statusSub}
        </p>

        {phase === "idle" ? (
          <Button
            variant="primary"
            className="mt-5 min-h-[var(--spacing-touch,48px)] w-full sm:max-w-sm"
            onClick={() => void startTest()}
          >
            Test my microphone
          </Button>
        ) : null}

        {(phase === "playback" || phase === "confirmed") && playbackUrl ? (
          <button
            type="button"
            onClick={() => void playPlayback()}
            className={cn(
              "mt-5 flex w-full cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan",
              isDiagnostic
                  ? "border-navy/15 bg-white hover:border-cyan/40 hover:bg-cyan/8"
                : "border-cyan/15 bg-teal/10 hover:bg-teal/15",
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
            <div className="flex h-5 min-w-0 flex-1 items-center gap-0.5 overflow-hidden" aria-hidden>
              {Array.from({ length: 18 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-[3px] shrink-0 rounded-sm bg-cyan/55 transition-all duration-200",
                    isPlaying && "motion-safe:animate-[bfwave_1.1s_ease-in-out_infinite]",
                  )}
                  style={{
                    height: isPlaying ? `${8 + (i % 6) * 3}px` : `${5 + (i % 6) * 2}px`,
                    animationDelay: isPlaying ? `${i * 0.05}s` : undefined,
                  }}
                />
              ))}
            </div>
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
                  ? isDiagnostic
                    ? "border-[#C9F0DC] bg-[#ECFBF3] text-[#0E8F5B]"
                    : "border-[#3ECF8E]/40 bg-[#3ECF8E]/12 text-[#3ECF8E]"
                  : isDiagnostic
                    ? "border-navy/15 text-[#334155] hover:border-cyan/40 hover:bg-cyan/8"
                    : "border-cyan/15 text-[#9FB2C8] hover:border-[#3ECF8E]/30",
              )}
            >
              <Check className="size-3.5 shrink-0" strokeWidth={2.5} />
              I hear myself clearly
            </button>
            <button
              type="button"
              onClick={handleRecordAgain}
              className={cn(
                "flex min-h-[var(--spacing-touch,48px)] cursor-pointer items-center justify-center gap-1.5 rounded-[11px] border px-3 py-2.5 text-xs font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:text-sm",
                isDiagnostic
                  ? "border-navy/15 bg-white text-[#334155] hover:border-navy/25 hover:bg-slate-50"
                  : "border-cyan/15 text-[#9FB2C8] hover:bg-white/5",
              )}
            >
              <RotateCcw className="size-3.5 shrink-0" />
              Record again
            </button>
          </div>
        ) : null}
      </div>

      <div className={cn("mt-6", !isDiagnostic && "md:mx-auto md:w-full md:max-w-3xl")}>
        <h2
          className={cn(
            "font-display text-[15px] font-bold",
            isDiagnostic ? "text-navy" : undefined,
          )}
        >
          Set up like the real test
        </h2>
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
        <div
          className={cn(
            "mt-2 flex gap-3 rounded-xl border p-3.5",
            isDiagnostic
              ? "border-amber-300/80 bg-[#FFF7E8]"
              : "border-[#F5C46B]/30 bg-[#F5C46B]/10",
          )}
        >
          <div
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg",
              isDiagnostic ? "bg-amber-100" : "bg-[#F5C46B]/16",
            )}
          >
            <Smartphone
              className={cn("size-3.5", isDiagnostic ? "text-[#8A5A00]" : "text-[#F5C46B]")}
              strokeWidth={1.8}
            />
          </div>
          <div>
            <p
              className={cn(
                "text-xs font-semibold",
                isDiagnostic ? "text-[#8A5A00]" : "text-[#F5C46B]",
              )}
            >
              Keep your screen on
            </p>
            <p
              className={cn(
                "mt-0.5 text-[11.5px] leading-relaxed",
                isDiagnostic ? "text-[#6B4D1F]" : "text-[#9FB2C8]",
              )}
            >
              We&apos;ll try to keep your screen awake during the test. Locking your
              phone or switching apps can still stop the recording.
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <p
          className={cn(
            "mt-4 rounded-lg border px-3 py-2 text-sm",
            isDiagnostic
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-red-400/30 bg-red-500/10 text-red-300",
          )}
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div
        className={cn(
          "mt-6 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
          !isDiagnostic && "md:mx-auto md:w-full md:max-w-3xl",
        )}
      >
        <Button
          variant="primary"
          className={cn(
            "min-h-[var(--spacing-touch,48px)] w-full",
            !isDiagnostic && "bg-cyan text-[#0D1F3C] hover:bg-cyan/90",
          )}
          disabled={!confirmed || beginBusy}
          onClick={onBegin}
        >
          {beginBusy ? "Starting…" : beginLabel}
        </Button>
        <p
          className={cn(
            "mt-2.5 text-center font-mono text-[10px] tracking-widest uppercase",
            isDiagnostic ? "text-[#64748B]" : "text-[#5F7492]",
          )}
        >
          Part 1 starts immediately · {totalMinutes} min total
        </p>
      </div>
    </div>
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
