"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, UserRound } from "lucide-react";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_MOCK_SLUG,
  shortModuleSpeakingPendingPath,
  testNumberForMockId,
  type MockMeta,
} from "@/lib/mock-catalog";
import { persistModuleResultAttempt } from "@/lib/exam-session-storage";
import { useResolvedMockAttemptId } from "@/modules/mock/hooks/use-resolved-mock-attempt";
import { parseSpeakingPrompt } from "@/modules/speaking/lib/parse-speaking-prompt";
import { speakingApi } from "@/modules/speaking/services/speaking-api";
import { TestHeader, TestShell, TestTimer } from "@/modules/shared";
import { useListeningTimer } from "@/modules/shared/hooks/use-exam-timer";
import { useExamSessionGuard } from "@/modules/shared/hooks/use-exam-session-refresh";
import { SectionInstructionsModal } from "@/modules/shared/components/section-instructions-modal";
import {
  ExamBusyOverlay,
  ExamSectionLoader,
} from "@/modules/shared/components/exam-section-loader";
import { formatExamSubmitError } from "@/modules/shared/lib/submit-with-exam-session";
import { cn } from "@/lib/utils";

function readConsent(scope: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(`bf-instructions:speaking:${scope}`) === "1";
  } catch {
    return false;
  }
}

function writeConsent(scope: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`bf-instructions:speaking:${scope}`, "1");
  } catch {
    /* ignore */
  }
}

type Props = {
  mockTestId: string;
  mockSlug?: string;
  mockMeta?: MockMeta;
  testNumber?: number;
};

export function SpeakingPage({
  mockTestId,
  mockSlug = DEFAULT_MOCK_SLUG,
  testNumber: testNumberProp,
}: Props) {
  const router = useRouter();
  const mockAttemptId = useResolvedMockAttemptId(mockTestId);
  const testNumber = testNumberProp ?? testNumberForMockId(mockTestId);
  const consentScope = mockAttemptId ?? mockTestId;

  const [showInstructions, setShowInstructions] = useState(
    () => !readConsent(consentScope),
  );
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [promptText, setPromptText] = useState("");
  const [partLabel, setPartLabel] = useState("Part 1");
  const [maxRecordSec, setMaxRecordSec] = useState(120);
  const [durationSeconds, setDurationSeconds] = useState(14 * 60);
  const [startedAtIso, setStartedAtIso] = useState<string | null>(null);
  const [serverTimeIso, setServerTimeIso] = useState<string | null>(null);

  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const recordStartRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  const remaining = useListeningTimer({
    startedAtIso,
    serverTimeIso,
    durationSeconds,
    active: Boolean(attemptId),
  });
  useExamSessionGuard(Boolean(attemptId));

  const parsedPrompt = parseSpeakingPrompt(promptText);

  const startExam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const boot = await speakingApi.start(mockTestId, {
        part: 1,
        mockAttemptId: mockAttemptId ?? undefined,
      });
      setAttemptId(boot.attempt_id);
      setStudentName(boot.student_name);
      setPromptText(boot.question.prompt);
      setPartLabel(boot.question.part_label ?? `Part ${boot.part}`);
      setMaxRecordSec(boot.question.duration_hint_sec ?? 120);
      setDurationSeconds(boot.duration_seconds);
      setStartedAtIso(boot.started_at);
      setServerTimeIso(boot.server_time);
      setShowInstructions(false);
      writeConsent(consentScope);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not start speaking.");
    } finally {
      setLoading(false);
    }
  }, [consentScope, mockAttemptId, mockTestId]);

  const stopRecording = useCallback(() => {
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
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current = recorder;
      recordStartRef.current = Date.now();
      setRecordSeconds(0);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setAudioBlob(blob);
      };

      tickRef.current = window.setInterval(() => {
        if (!recordStartRef.current) return;
        const elapsed = Math.round((Date.now() - recordStartRef.current) / 1000);
        setRecordSeconds(elapsed);
        if (elapsed >= maxRecordSec) {
          stopRecording();
        }
      }, 400);

      recorder.start();
      setRecording(true);
    } catch {
      setError("Microphone access is required for the speaking section.");
    }
  }, [maxRecordSec, stopRecording]);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  const handleSubmit = useCallback(async () => {
    if (!attemptId || !audioBlob || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await speakingApi.submit(attemptId, audioBlob, recordSeconds);
      persistModuleResultAttempt(testNumber, "speaking", result.attempt_id);
      router.replace(shortModuleSpeakingPendingPath(testNumber, result.attempt_id));
    } catch (e) {
      setError(formatExamSubmitError(e));
    } finally {
      setBusy(false);
    }
  }, [attemptId, audioBlob, busy, recordSeconds, router, testNumber]);

  if (showInstructions) {
    return (
      <SectionInstructionsModal
        badge="IELTS Academic · Speaking"
        title="Part 1 — Introduction and interview"
        description="You will record one spoken answer. A certified examiner will review your recording and assign your band within 24 hours."
        instructions={[
          "Find a quiet place and use headphones with a microphone if possible.",
          "Speak clearly for about 1–2 minutes.",
          "Cover who you are, why you are taking IELTS, where you are going, and your purpose.",
          "You can re-record before submitting, but only one final recording is sent for review.",
        ]}
        ctaLabel="Start speaking"
        busy={loading}
        agreed={agreed}
        onAgreeChange={setAgreed}
        onContinue={() => void startExam()}
      />
    );
  }

  if (!attemptId) {
    return <ExamSectionLoader title="Loading speaking…" />;
  }

  return (
    <TestShell
      header={<TestHeader timer={<TestTimer remainingSeconds={remaining} />} />}
    >
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-y-auto p-4 md:p-8">
        {studentName ? (
          <div className="mb-4 inline-flex items-center gap-2 self-start rounded-full border border-border bg-surface px-3 py-1.5 text-meta text-ink/75">
            <UserRound className="size-3.5 text-teal" aria-hidden />
            <span>
              Recording as <span className="font-semibold text-navy">{studentName}</span>
            </span>
          </div>
        ) : null}

        <p className="text-meta font-medium text-navy">{partLabel}</p>
        <h1 className="mt-2 font-display text-h3 text-navy">{parsedPrompt.title}</h1>
        <p className="mt-3 text-body text-ink/70">{parsedPrompt.guidance}</p>

        <ul className="mt-4 space-y-2 text-body text-ink/80">
          {parsedPrompt.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2">
              <span className="text-teal" aria-hidden>
                •
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-xl border border-border bg-surface p-6">
          <div
            className="flex h-16 items-end justify-center gap-1"
            aria-hidden
          >
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1 rounded-full bg-teal transition-all duration-200",
                  recording ? "animate-pulse" : audioBlob ? "opacity-80" : "opacity-35",
                )}
                style={{
                  height: recording
                    ? `${18 + Math.sin(i * 0.75 + recordSeconds * 0.2) * 14}px`
                    : audioBlob
                      ? "12px"
                      : "8px",
                }}
              />
            ))}
          </div>

          <p className="mt-4 text-center text-meta text-ink/60">
            {recording
              ? `Recording… ${recordSeconds}s / ${maxRecordSec}s`
              : audioBlob
                ? `Recording ready · ${recordSeconds}s`
                : "Tap the microphone when you are ready"}
          </p>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => (recording ? stopRecording() : void startRecording())}
              disabled={busy}
              aria-label={recording ? "Stop recording" : "Start recording"}
              className={cn(
                "touch-target flex size-16 cursor-pointer items-center justify-center rounded-full text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                recording ? "bg-danger hover:bg-danger/90" : "bg-teal hover:bg-cyan-light",
              )}
            >
              {recording ? <Square className="size-6" /> : <Mic className="size-6" />}
            </button>
            {audioBlob && !recording ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setAudioBlob(null);
                  setRecordSeconds(0);
                }}
              >
                Record again
              </Button>
            ) : null}
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <div className="sticky-test-actions mt-8">
          <Button
            variant="primary"
            className="w-full"
            disabled={!audioBlob || recording || busy}
            onClick={() => void handleSubmit()}
          >
            {busy ? "Submitting…" : "Submit for human review"}
          </Button>
          <p className="mt-2 text-center text-meta text-ink/55">
            Your Speaking band will be available within 24 hours after examiner review.
          </p>
        </div>
      </main>

      {busy ? <ExamBusyOverlay title="Uploading your recording…" /> : null}
    </TestShell>
  );
}
