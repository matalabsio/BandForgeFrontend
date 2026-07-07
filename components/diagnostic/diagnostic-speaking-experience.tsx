"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square } from "lucide-react";
import { DiagnosticChrome } from "@/components/diagnostic/diagnostic-chrome";
import { DiagnosticExamShell, DiagnosticExamScroll, DiagnosticExamColumn } from "@/components/diagnostic/diagnostic-exam-shell";
import { DiagnosticModuleGuard } from "@/components/diagnostic/diagnostic-module-guard";
import { DiagnosticTimerPill } from "@/components/diagnostic/ui/diagnostic-timer-pill";
import { diagnosticPaths } from "@/lib/diagnostic-catalog";
import { computeFinalDiagnosticScores } from "@/lib/diagnostic-finalize";
import { loadDiagnosticPack, type DiagnosticPack } from "@/lib/diagnostic-pack";
import { useCountdown } from "@/hooks/use-countdown";
import {
  completeDiagnostic,
  readDiagnosticProgress,
  saveModuleAnswers,
  type DiagnosticSpeakingAnswers,
} from "@/lib/diagnostic-storage";
import { cn } from "@/lib/utils";

type SpeakingPhase = "part1" | "part2-prep" | "part2-record" | "part2-done";

function parseCueCard(text: string): { title: string; bullets: string[] } {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const title = lines[0] ?? text;
  const bullets = lines.slice(1).filter((l) => !l.toLowerCase().startsWith("you should"));
  return { title, bullets };
}

export function DiagnosticSpeakingExperience() {
  const router = useRouter();
  const [pack, setPack] = useState<DiagnosticPack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [part1Index, setPart1Index] = useState(0);
  const [phase, setPhase] = useState<SpeakingPhase>("part1");
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [speakingAnswers, setSpeakingAnswers] = useState<DiagnosticSpeakingAnswers>({
    part1: {},
    part2: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordStartRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  const part2PrepRemaining = useCountdown(
    pack?.speaking.part2.prepSec ?? 60,
    phase === "part2-prep",
  );
  const part2RecordRemaining = useCountdown(
    pack?.speaking.part2.recordSec ?? 120,
    phase === "part2-record",
  );

  useEffect(() => {
    const progress = readDiagnosticProgress();
    if (progress?.answers.speaking) {
      setSpeakingAnswers(progress.answers.speaking);
    }
    void loadDiagnosticPack()
      .then(setPack)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Could not load diagnostic.");
      });
  }, []);

  useEffect(() => {
    if (phase === "part2-prep" && part2PrepRemaining === 0) {
      setPhase("part2-record");
    }
  }, [phase, part2PrepRemaining]);

  const persistSpeaking = useCallback((answers: DiagnosticSpeakingAnswers) => {
    setSpeakingAnswers(answers);
    saveModuleAnswers("speaking", answers);
  }, []);

  const stopRecording = useCallback(async () => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    mediaRecorderRef.current = null;
    setRecording(false);

    const durationSec = recordStartRef.current
      ? Math.round((Date.now() - recordStartRef.current) / 1000)
      : recordSeconds;

    if (phase === "part1" && pack) {
      const q = pack.speaking.part1.questions[part1Index];
      const next: DiagnosticSpeakingAnswers = {
        ...speakingAnswers,
        part1: {
          ...speakingAnswers.part1,
          [q.id]: { durationSec, completed: true },
        },
      };
      persistSpeaking(next);
      if (part1Index < pack.speaking.part1.questions.length - 1) {
        setPart1Index((i) => i + 1);
      } else if (pack.speaking.part2.enabled) {
        setPhase("part2-prep");
      } else {
        setPhase("part2-done");
      }
    } else if (phase === "part2-record") {
      const next: DiagnosticSpeakingAnswers = {
        ...speakingAnswers,
        part2: {
          prepSec: pack?.speaking.part2.prepSec ?? 60,
          recordSec: durationSec,
          completed: true,
        },
      };
      persistSpeaking(next);
      setPhase("part2-done");
    }
    setRecordSeconds(0);
    recordStartRef.current = null;
  }, [phase, pack, part1Index, persistSpeaking, recordSeconds, speakingAnswers]);

  useEffect(() => {
    if (phase === "part2-record" && part2RecordRemaining === 0 && recording) {
      void stopRecording();
    }
  }, [phase, part2RecordRemaining, recording, stopRecording]);

  const part1Question = pack?.speaking.part1.questions[part1Index];

  useEffect(() => {
    if (phase !== "part1" || !recording || !part1Question) return;
    if (recordSeconds >= part1Question.maxSec) {
      void stopRecording();
    }
  }, [phase, recording, part1Question, recordSeconds, stopRecording]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recordStartRef.current = Date.now();
      setRecordSeconds(0);
      tickRef.current = window.setInterval(() => {
        if (recordStartRef.current) {
          setRecordSeconds(
            Math.round((Date.now() - recordStartRef.current) / 1000),
          );
        }
      }, 500);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setRecording(true);
    } catch {
      setError("Microphone access is required for the speaking section.");
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!pack || submitting) return;
    const hasPart1 = Object.keys(speakingAnswers.part1).length > 0;
    const hasPart2 = speakingAnswers.part2?.completed;
    if (!hasPart1 && !hasPart2) {
      setError("Please complete at least one speaking recording before submitting.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const progress = readDiagnosticProgress();
    if (!progress) return;

    const finalAnswers: DiagnosticSpeakingAnswers = {
      ...speakingAnswers,
      part2: speakingAnswers.part2 ?? {
        prepSec: 0,
        recordSec: 0,
        completed: false,
      },
    };
    saveModuleAnswers("speaking", finalAnswers);

    const { scores, review } = computeFinalDiagnosticScores(pack, {
      ...progress,
      answers: { ...progress.answers, speaking: finalAnswers },
    });

    completeDiagnostic(scores, review);
    router.replace(diagnosticPaths.processing);
  }, [pack, submitting, speakingAnswers, router]);

  const part2Enabled = pack?.speaking.part2.enabled ?? true;
  const cueCard =
    pack && part2Enabled && pack.speaking.part2.cueCard.trim()
      ? parseCueCard(pack.speaking.part2.cueCard)
      : null;

  return (
    <DiagnosticModuleGuard module="speaking">
      <DiagnosticChrome variant="exam" fillViewport>
        <DiagnosticExamShell
          module="speaking"
          moduleIcon={Mic}
          error={error}
          loading={!pack}
          footerLabel="Submit for examiner review"
          footerBusy={submitting}
          onFooter={handleSubmit}
          timer={
            phase === "part2-prep" || phase === "part2-record" ? (
              <DiagnosticTimerPill
                remainingSeconds={
                  phase === "part2-prep"
                    ? part2PrepRemaining
                    : part2RecordRemaining
                }
              />
            ) : undefined
          }
        >
          {pack ? (
            <DiagnosticExamScroll>
              <DiagnosticExamColumn>
              {phase === "part1" && part1Question ? (
                <>
                  <p className="font-mono text-[10.5px] tracking-wider text-teal uppercase">
                    Part 1 · Question {part1Index + 1}
                  </p>
                  <p className="mt-3 break-words font-display text-lg font-semibold leading-snug text-navy">
                    {part1Question.prompt}
                  </p>
                  <RecordingControls
                    recording={recording}
                    seconds={recordSeconds}
                    onStart={startRecording}
                    onStop={() => void stopRecording()}
                  />
                </>
              ) : null}

              {(phase === "part2-prep" ||
                phase === "part2-record" ||
                phase === "part2-done") &&
              cueCard ? (
                <>
                  <CueCard title={cueCard.title} bullets={cueCard.bullets} />
                  {phase === "part2-prep" ? (
                    <button
                      type="button"
                      onClick={() => setPhase("part2-record")}
                      className="mt-4 mx-auto flex w-full cursor-pointer rounded-full border border-cyan/40 px-5 py-2 text-sm font-semibold text-teal hover:bg-cyan/5 sm:w-auto"
                    >
                      Start recording early
                    </button>
                  ) : null}
                  {phase === "part2-record" ? (
                    <RecordingControls
                      recording={recording}
                      seconds={recordSeconds}
                      onStart={startRecording}
                      onStop={() => void stopRecording()}
                    />
                  ) : null}
                  {phase === "part2-done" ? (
                    <p className="mt-6 text-center text-sm text-teal">
                      Part 2 recording complete. Submit speaking to see your report.
                    </p>
                  ) : null}
                </>
              ) : null}

              {phase === "part2-done" && !part2Enabled ? (
                <p className="mt-6 text-center text-sm text-teal">
                  Recording complete. Submit speaking to see your report.
                </p>
              ) : null}
              </DiagnosticExamColumn>
            </DiagnosticExamScroll>
          ) : null}
        </DiagnosticExamShell>
      </DiagnosticChrome>
    </DiagnosticModuleGuard>
  );
}

function CueCard({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <div className="mt-2 rounded-[18px] border border-navy/10 bg-navy/[0.04] p-5 shadow-[0_16px_40px_rgba(13,31,60,0.07)]">
      <p className="mb-3.5 font-mono text-[10.5px] tracking-wider text-teal uppercase">
        Part 2 — Cue Card
      </p>
      <p className="break-words font-display text-[18.5px] leading-snug font-semibold tracking-tight text-navy">
        {title}
      </p>
      {bullets.length > 0 ? (
        <>
          <p className="mt-4 mb-2.5 text-[13px] font-light text-[#5A6B82]">
            You should say:
          </p>
          <ul className="flex flex-col gap-2.5">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5">
                <span className="mt-2 size-[5px] shrink-0 rounded-full bg-cyan" />
                <span className="min-w-0 flex-1 break-words text-sm leading-snug text-[#1B2B45]">{b}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function RecordingControls({
  recording,
  seconds,
  onStart,
  onStop,
}: {
  recording: boolean;
  seconds: number;
  onStart: () => void;
  onStop: () => void;
}) {
  return (
    <div className="mt-8 flex flex-col items-center">
      <div
        className="mb-6 flex h-12 w-full max-w-xs items-end justify-center gap-1"
        aria-hidden
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "w-1 rounded-sm bg-cyan",
              recording && "animate-[bfwave_1.1s_ease-in-out_infinite]",
            )}
            style={{
              height: recording ? `${10 + (i % 5) * 6}px` : "6px",
              animationDelay: recording ? `${i * 0.05}s` : undefined,
              transformOrigin: "center",
            }}
          />
        ))}
      </div>
      <p className="mb-5 text-sm text-[#5A6B82]">
        {recording ? `Recording… ${seconds}s` : "Tap to record your answer"}
      </p>
      <button
        type="button"
        onClick={recording ? onStop : onStart}
        className={cn(
          "flex size-20 cursor-pointer items-center justify-center rounded-full text-white transition-all",
          recording
            ? "bg-red-500 hover:bg-red-600"
            : "bg-cyan shadow-[0_0_0_0_rgba(0,188,212,0.4)] hover:bg-brand-sky-hover animate-[bfpulse_2s_ease-out_infinite]",
        )}
        aria-label={recording ? "Stop recording" : "Start recording"}
      >
        {recording ? (
          <Square className="size-7" fill="currentColor" />
        ) : (
          <Mic className="size-7" />
        )}
      </button>
    </div>
  );
}
