"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExamTimeWarningDialog } from "@/components/exam/exam-time-warning-dialog";
import { bankExerciseToSpeakingManifest } from "@/lib/bank-exercise-to-exam";
import type { BankExerciseStart } from "@/lib/practice-api";
import { SpeakingExamFlow } from "@/modules/speaking/components/speaking-exam-flow";
import { SpeakingMicCheck } from "@/modules/speaking/components/speaking-mic-check";
import {
  readMicCheckPassed,
  writeMicCheckPassed,
} from "@/modules/speaking/lib/speaking-mic-check-storage";
import {
  acquireSpeakingWakeLock,
  type SpeakingWakeLockHandle,
} from "@/modules/speaking/lib/speaking-wake-lock";
import type { SpeakingSessionRecording } from "@/modules/speaking/types";
import {
  ExamSectionLoader,
  TestHeader,
  TestShell,
  TestTimer,
  useExamTimeWarning,
  useListeningTimer,
} from "@/modules/shared";

type Props = {
  exercise: BankExerciseStart;
  hubHref: string;
  hubLabel: string;
  busy: boolean;
  error: string | null;
  onSubmit: (answers: Record<string, string>) => void;
};

const PRACTICE_SPEAKING_DURATION_SEC = 14 * 60;

export function PracticeSpeakingExam({
  exercise,
  busy,
  error,
  onSubmit,
}: Props) {
  const micScope = exercise.attempt_id;
  const manifest = useMemo(
    () => bankExerciseToSpeakingManifest(exercise),
    [exercise],
  );
  const [micStateReady, setMicStateReady] = useState(false);
  const [micPassed, setMicPassed] = useState(false);
  const [startedAtIso, setStartedAtIso] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const submittedRef = useRef(false);
  const wakeLockRef = useRef<SpeakingWakeLockHandle | null>(null);
  const recordingsRef = useRef<SpeakingSessionRecording[]>([]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setMicPassed(readMicCheckPassed(micScope));
      setMicStateReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [micScope]);

  useEffect(() => {
    if (!micPassed || startedAtIso) return;
    setStartedAtIso(new Date().toISOString());
  }, [micPassed, startedAtIso]);

  useEffect(() => {
    if (!micPassed) return;
    let cancelled = false;
    void acquireSpeakingWakeLock().then((handle) => {
      if (cancelled) {
        void handle.release();
        return;
      }
      wakeLockRef.current = handle;
    });
    return () => {
      cancelled = true;
      const handle = wakeLockRef.current;
      wakeLockRef.current = null;
      if (handle) void handle.release();
    };
  }, [micPassed]);

  const finish = useCallback(
    (recordings: SpeakingSessionRecording[]) => {
      if (submittedRef.current || busy) return;
      if (recordings.length < manifest.length) {
        setLocalError(
          `Please record every speaking answer before submitting (${manifest.length - recordings.length} remaining).`,
        );
        return;
      }
      submittedRef.current = true;
      const answers: Record<string, string> = {};
      for (const rec of recordings) {
        answers[rec.questionId] = String(rec.durationSec);
      }
      onSubmit(answers);
    },
    [busy, manifest.length, onSubmit],
  );

  const remaining = useListeningTimer({
    startedAtIso,
    serverTimeIso: startedAtIso,
    durationSeconds: PRACTICE_SPEAKING_DURATION_SEC,
    active: micPassed,
    onExpire: () => {
      if (submittedRef.current || busy) return;
      submittedRef.current = true;
      const answers: Record<string, string> = {};
      for (const rec of recordingsRef.current) {
        answers[rec.questionId] = String(rec.durationSec);
      }
      onSubmit(answers);
    },
  });
  const timeWarning = useExamTimeWarning({
    remaining,
    durationSeconds: PRACTICE_SPEAKING_DURATION_SEC,
    resetKey: startedAtIso,
    active: micPassed && remaining > 0,
  });

  const handleMicBegin = useCallback(() => {
    writeMicCheckPassed(micScope);
    setMicPassed(true);
  }, [micScope]);

  const handleStepRecorded = useCallback((recording: SpeakingSessionRecording) => {
    const next = recordingsRef.current.filter(
      (row) => row.questionId !== recording.questionId,
    );
    next.push(recording);
    recordingsRef.current = next;
  }, []);

  if (!micStateReady) {
    return (
      <div className="fixed inset-0 z-[60] bg-white">
        <ExamSectionLoader title="Loading speaking…" />
      </div>
    );
  }

  if (!micPassed) {
    return (
      <div className="fixed inset-0 z-[60] bg-white">
        <TestShell fillViewport header={<TestHeader timer={null} />}>
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
            <SpeakingMicCheck
              onBegin={handleMicBegin}
              beginBusy={busy}
              totalMinutes={14}
            />
          </main>
        </TestShell>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-white">
    <TestShell
      fillViewport
      header={<TestHeader timer={<TestTimer remainingSeconds={remaining} />} />}
    >
      <main className="flex min-h-0 w-full flex-1 flex-col overflow-hidden sm:p-4 md:p-6 lg:p-8">
        <SpeakingExamFlow
          key={exercise.attempt_id}
          variant="mock"
          manifest={manifest}
          onStepRecorded={handleStepRecorded}
          onExamComplete={(recordings) => finish(recordings)}
          footerBusy={busy}
          completeLabel="Submit for human review"
        />
        {error || localError ? (
          <p
            className="mt-3 shrink-0 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
            role="alert"
          >
            {localError ?? error}
          </p>
        ) : null}
      </main>
      <ExamTimeWarningDialog
        open={timeWarning.open}
        remainingSeconds={remaining}
        onDismiss={timeWarning.dismiss}
      />
    </TestShell>
    </div>
  );
}
