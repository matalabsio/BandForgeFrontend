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
import { SpeakingUploadWorker } from "@/modules/speaking/lib/speaking-upload-worker";
import {
  acquireSpeakingWakeLock,
  type SpeakingWakeLockHandle,
} from "@/modules/speaking/lib/speaking-wake-lock";
import { speakingApi } from "@/modules/speaking/services/speaking-api";
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

function idempotencyKeyFor(questionId: string, attemptId: string): string {
  return `practice-${attemptId}-${questionId}`;
}

export function PracticeSpeakingExam({
  exercise,
  busy,
  error,
  onSubmit,
}: Props) {
  const micScope = exercise.attempt_id;
  const speakingAttemptId = exercise.speaking_attempt_id?.trim() || null;
  const speakingManifestHash = exercise.speaking_manifest_hash?.trim() || null;
  const manifest = useMemo(
    () => bankExerciseToSpeakingManifest(exercise),
    [exercise],
  );
  const sequenceByQuestion = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 0; i < manifest.length; i++) {
      const item = manifest[i];
      map.set(item.id, item.sequence ?? i + 1);
    }
    return map;
  }, [manifest]);

  const [micStateReady, setMicStateReady] = useState(false);
  const [micPassed, setMicPassed] = useState(false);
  const [startedAtIso, setStartedAtIso] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const submittedRef = useRef(false);
  const wakeLockRef = useRef<SpeakingWakeLockHandle | null>(null);
  const recordingsRef = useRef<SpeakingSessionRecording[]>([]);
  const uploadPromisesRef = useRef(new Map<string, Promise<void>>());
  const uploadedIdsRef = useRef(new Set<string>());
  const uploadWorkerRef = useRef<SpeakingUploadWorker | null>(null);

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

  useEffect(() => {
    const worker = new SpeakingUploadWorker({
      onStart: () => setLocalError(null),
      onSuccess: (job) => {
        uploadedIdsRef.current.add(job.questionId);
      },
      onFailure: (_job, uploadError) => {
        const message =
          uploadError instanceof Error
            ? uploadError.message
            : "Upload failed. It will retry when you submit.";
        setLocalError(message);
      },
    });
    uploadWorkerRef.current = worker;
    return () => {
      uploadWorkerRef.current = null;
    };
  }, []);

  const enqueueUpload = useCallback(
    (recording: SpeakingSessionRecording) => {
      if (!speakingAttemptId || !recording.blob) return;
      const sequence = sequenceByQuestion.get(recording.questionId) ?? 1;
      const job = {
        questionId: recording.questionId,
        part: recording.part,
        sequence,
        attemptId: speakingAttemptId,
        audio: recording.blob,
        durationSec: recording.durationSec,
        idempotencyKey: idempotencyKeyFor(
          recording.questionId,
          speakingAttemptId,
        ),
      };
      const upload = (
        uploadWorkerRef.current?.enqueue(job) ??
        Promise.reject(new Error("Upload worker is not ready."))
      )
        .catch((e: unknown) => {
          setLocalError(
            e instanceof Error
              ? `Answer saved on this device, but upload failed: ${e.message}`
              : "Answer saved on this device, but upload failed.",
          );
        })
        .finally(() => {
          uploadPromisesRef.current.delete(recording.questionId);
        });
      uploadPromisesRef.current.set(recording.questionId, upload);
      void upload.catch(() => undefined);
    },
    [sequenceByQuestion, speakingAttemptId],
  );

  const finish = useCallback(
    async (recordings: SpeakingSessionRecording[]) => {
      if (submittedRef.current || busy || uploading) return;
      if (!speakingAttemptId || !speakingManifestHash) {
        setLocalError(
          "Speaking session is not ready. Go back and restart this practice set.",
        );
        return;
      }
      if (recordings.length < manifest.length) {
        setLocalError(
          `Please record every speaking answer before submitting (${manifest.length - recordings.length} remaining).`,
        );
        return;
      }
      for (const rec of recordings) {
        if (!rec.blob) {
          setLocalError(
            "A recording is missing audio data. Re-record that answer and try again.",
          );
          return;
        }
        if (!uploadedIdsRef.current.has(rec.questionId)) {
          enqueueUpload(rec);
        }
      }

      submittedRef.current = true;
      setUploading(true);
      setLocalError(null);
      try {
        await Promise.all(
          [...uploadPromisesRef.current.values()].map((p) =>
            p.catch(() => undefined),
          ),
        );
        for (const rec of recordings) {
          if (!uploadedIdsRef.current.has(rec.questionId) && rec.blob) {
            const sequence = sequenceByQuestion.get(rec.questionId) ?? 1;
            await speakingApi.uploadResponse(speakingAttemptId, {
              questionId: rec.questionId,
              part: rec.part,
              sequence,
              durationSec: rec.durationSec,
              audio: rec.blob,
            });
            uploadedIdsRef.current.add(rec.questionId);
          }
        }
        const missing = recordings.filter(
          (r) => !uploadedIdsRef.current.has(r.questionId),
        );
        if (missing.length > 0) {
          throw new Error(
            `${missing.length} answer${missing.length === 1 ? " is" : "s are"} still uploading. Try submitting again.`,
          );
        }

        await speakingApi.finalize(speakingAttemptId, {
          manifestHash: speakingManifestHash,
        });

        onSubmit({
          speaking_attempt_id: speakingAttemptId,
          speaking_manifest_hash: speakingManifestHash,
        });
      } catch (e) {
        submittedRef.current = false;
        setLocalError(
          e instanceof Error
            ? e.message
            : "Could not submit speaking answers. Please try again.",
        );
      } finally {
        setUploading(false);
      }
    },
    [
      busy,
      enqueueUpload,
      manifest.length,
      onSubmit,
      sequenceByQuestion,
      speakingAttemptId,
      speakingManifestHash,
      uploading,
    ],
  );

  const remaining = useListeningTimer({
    startedAtIso,
    serverTimeIso: startedAtIso,
    durationSeconds: PRACTICE_SPEAKING_DURATION_SEC,
    active: micPassed,
    onExpire: () => {
      if (submittedRef.current || busy || uploading) return;
      void finish(recordingsRef.current);
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

  const handleStepRecorded = useCallback(
    (recording: SpeakingSessionRecording) => {
      const next = recordingsRef.current.filter(
        (row) => row.questionId !== recording.questionId,
      );
      next.push(recording);
      recordingsRef.current = next;
      enqueueUpload(recording);
    },
    [enqueueUpload],
  );

  if (!micStateReady) {
    return (
      <div className="fixed inset-0 z-[60] bg-white">
        <ExamSectionLoader title="Loading speaking…" />
      </div>
    );
  }

  if (!speakingAttemptId || !speakingManifestHash) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white p-6">
        <p className="max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Speaking upload session could not be created. Go back and restart this
          practice set.
        </p>
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
              beginBusy={busy || uploading}
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
        header={
          <TestHeader timer={<TestTimer remainingSeconds={remaining} />} />
        }
      >
        <main className="flex min-h-0 w-full flex-1 flex-col overflow-hidden sm:p-4 md:p-6 lg:p-8">
          <SpeakingExamFlow
            key={exercise.attempt_id}
            variant="mock"
            manifest={manifest}
            onStepRecorded={handleStepRecorded}
            onExamComplete={(recordings) => {
              void finish(recordings);
            }}
            footerBusy={busy || uploading}
            completeLabel={
              uploading ? "Uploading answers…" : "Submit for AI feedback"
            }
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
