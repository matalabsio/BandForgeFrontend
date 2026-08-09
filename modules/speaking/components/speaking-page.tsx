"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_MOCK_SLUG,
  mockHubPath,
  mockPathFromProgress,
  testNumberForMockId,
  type MockMeta,
} from "@/lib/mock-catalog";
import { sectionResultsPathForMockSubmit } from "@/lib/mock-section-continue";
import { persistModuleResultAttempt } from "@/lib/exam-session-storage";
import type { PracticeSkill } from "@/lib/practice-types";
import type { PlanTaskKind } from "@/lib/plan-task-flow";
import { appendPlanResultParams } from "@/lib/plan-day-tasks";
import { recordPlanDayOutcome } from "@/lib/plan-daily-progress";
import {
  markPlanStepDone,
  shouldCompleteHubForPlanTask,
} from "@/lib/plan-step-completion";
import { useResolvedMockAttemptId } from "@/modules/mock/hooks/use-resolved-mock-attempt";
import { fetchMockProgressDeduped } from "@/modules/mock/lib/mock-progress-fetch";
import { mockApi } from "@/modules/mock/services/mock-api";
import { SpeakingExamFlow } from "@/modules/speaking/components/speaking-exam-flow";
import { SpeakingMicCheck } from "@/modules/speaking/components/speaking-mic-check";
import { speakingPendingPath } from "@/modules/speaking/lib/speaking-status-routing";
import {
  readMicCheckPassed,
  writeMicCheckPassed,
} from "@/modules/speaking/lib/speaking-mic-check-storage";
import {
  MOCK_SPEAKING_MANIFEST,
  speakingManifestFromServer,
} from "@/modules/speaking/lib/speaking-question-manifest";
import {
  clearSpeakingSessionRecordings,
  saveSpeakingSessionRecording,
} from "@/modules/speaking/lib/speaking-session-storage";
import {
  acceptedRecoveredQuestionIds,
  createSpeakingResponseState,
  missingExpectedResponseIds,
  speakingResponseReducer,
  type ExpectedSpeakingResponse,
} from "@/modules/speaking/lib/speaking-response-state";
import {
  clearSpeakingResponseMetadata,
  persistSpeakingResponseMetadata,
  readSpeakingResponseMetadata,
} from "@/modules/speaking/lib/speaking-response-metadata";
import {
  SpeakingUploadWorker,
  type SpeakingUploadJob,
} from "@/modules/speaking/lib/speaking-upload-worker";
import {
  acquireSpeakingWakeLock,
  type SpeakingWakeLockHandle,
} from "@/modules/speaking/lib/speaking-wake-lock";
import { speakingApi } from "@/modules/speaking/services/speaking-api";
import type {
  SpeakingQuestionManifest,
  SpeakingSessionRecording,
} from "@/modules/speaking/types";
import { TestHeader, TestShell, TestTimer } from "@/modules/shared";
import { useExamExpiryCatchUp } from "@/modules/shared/hooks/use-exam-expiry-catchup";
import { useListeningTimer } from "@/modules/shared/hooks/use-exam-timer";
import { useExamSessionGuard } from "@/modules/shared/hooks/use-exam-session-refresh";
import {
  ExamBusyOverlay,
  ExamSectionLoader,
} from "@/modules/shared/components/exam-section-loader";
import { formatExamSubmitError } from "@/modules/shared/lib/submit-with-exam-session";

type Props = {
  mockTestId: string;
  mockSlug?: string;
  mockMeta?: MockMeta;
  testNumber?: number;
  skillContext?: PracticeSkill | null;
  fromPlan?: boolean;
  planTask?: PlanTaskKind | null;
  planTaskId?: string | null;
  planHubId?: string | null;
};

export function SpeakingPage({
  mockTestId,
  mockSlug = DEFAULT_MOCK_SLUG,
  testNumber: testNumberProp,
  skillContext = null,
  fromPlan = false,
  planTask = null,
  planTaskId = null,
  planHubId = null,
}: Props) {
  const router = useRouter();
  const mockAttemptId = useResolvedMockAttemptId(mockTestId);
  const testNumber = testNumberProp ?? testNumberForMockId(mockTestId);
  const micScope = mockAttemptId ?? mockTestId;

  const [micPassed, setMicPassed] = useState(false);
  const [micStateReady, setMicStateReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoveredQuestionIds, setRecoveredQuestionIds] = useState<string[]>([]);
  const [part2NoPrepQuestionIds, setPart2NoPrepQuestionIds] = useState<string[]>([]);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(14 * 60);
  const [startedAtIso, setStartedAtIso] = useState<string | null>(null);
  const [serverTimeIso, setServerTimeIso] = useState<string | null>(null);
  const [part2Timing, setPart2Timing] = useState<{
    prepSeconds?: number;
    maxResponseSeconds?: number;
    prepStartedAt?: string | null;
  }>({});
  const [manifest, setManifest] = useState<SpeakingQuestionManifest[]>(
    MOCK_SPEAKING_MANIFEST,
  );
  const [manifestHash, setManifestHash] = useState<string | null>(null);

  const wakeLockRef = useRef<SpeakingWakeLockHandle | null>(null);
  const recordingsRef = useRef(new Map<string, SpeakingSessionRecording>());
  const uploadedQuestionIdsRef = useRef(new Set<string>());
  const uploadPromisesRef = useRef(new Map<string, Promise<void>>());
  const idempotencyKeysRef = useRef(new Map<string, string>());
  const finalizeInFlightRef = useRef(false);
  const uploadWorkerRef = useRef<SpeakingUploadWorker | null>(null);
  const expiryHandlerRef = useRef<() => void>(() => {});

  const remaining = useListeningTimer({
    startedAtIso,
    serverTimeIso,
    durationSeconds,
    active: Boolean(attemptId),
    onExpire: () => expiryHandlerRef.current(),
  });
  useExamSessionGuard(Boolean(attemptId));

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

  const expectedResponses = useMemo<ExpectedSpeakingResponse[]>(
    () =>
      manifest.map((question, index) => ({
        questionId: question.id,
        part: question.part,
        sequence: question.sequence ?? index + 1,
      })),
    [manifest],
  );
  const [, dispatchResponse] = useReducer(
    speakingResponseReducer,
    expectedResponses,
    createSpeakingResponseState,
  );

  const persistJobStatus = useCallback(
    (
      job: SpeakingUploadJob,
      status: "queued" | "uploading" | "uploaded" | "failed",
      jobError: string | null = null,
    ) =>
      persistSpeakingResponseMetadata({
        scope: micScope,
        questionId: job.questionId,
        part: job.part,
        sequence: job.sequence,
        status,
        durationSec: job.durationSec,
        capturedAt: new Date().toISOString(),
        error: jobError,
        idempotencyKey: job.idempotencyKey,
      }),
    [micScope],
  );

  useEffect(() => {
    uploadWorkerRef.current = new SpeakingUploadWorker({
      onStart: (job) => {
        dispatchResponse({ type: "upload_start", questionId: job.questionId });
        void persistJobStatus(job, "uploading");
      },
      onOffline: () => {
        setError(
          "You are offline. Your answer is held in this open page and will upload automatically when the connection returns.",
        );
      },
      onSuccess: (job) => {
        uploadedQuestionIdsRef.current.add(job.questionId);
        dispatchResponse({ type: "upload_success", questionId: job.questionId });
        void persistJobStatus(job, "uploaded");
      },
      onFailure: (job, uploadError) => {
        const message = uploadError instanceof Error ? uploadError.message : "Upload failed.";
        dispatchResponse({ type: "upload_failure", questionId: job.questionId, error: message });
        void persistJobStatus(job, "failed", message);
      },
    });
    return () => {
      uploadWorkerRef.current = null;
    };
  }, [persistJobStatus]);

  const recoverResponses = useCallback(async (speakingAttemptId: string) => {
    setRecoveryReady(false);
    setError(null);
    try {
      const localMetadata = await readSpeakingResponseMetadata(micScope);
      localMetadata.forEach((item) => {
        if (item.idempotencyKey) {
          idempotencyKeysRef.current.set(item.questionId, item.idempotencyKey);
        }
      });
      const preparingPart2 = localMetadata.find(
        (item) => item.part === 2 && item.status === "preparing" && item.prepStartedAt,
      );
      if (preparingPart2?.prepStartedAt) {
        setPart2Timing((current) => ({
          ...current,
          prepStartedAt: preparingPart2.prepStartedAt,
        }));
      }
      const recovery = await speakingApi.responses(speakingAttemptId);
      const uploaded = recovery.filter(
        (item) =>
          item.status === "uploaded" &&
          item.idempotency_key &&
          item.duration_sec != null,
      );
      const confirmedAfterRecovery = await Promise.all(
        uploaded.map(async (item) => {
          try {
            return await speakingApi.confirmResponseUpload(
              speakingAttemptId,
              item.id,
              {
                idempotencyKey: item.idempotency_key!,
                durationSec: item.duration_sec!,
              },
            );
          } catch {
            return item;
          }
        }),
      );
      const accepted = acceptedRecoveredQuestionIds([
        ...recovery,
        ...confirmedAfterRecovery,
      ]);
      dispatchResponse({ type: "recover", questionIds: [...accepted] });
      const unrecoverable = localMetadata
        .filter(
          (item) =>
            item.status !== "preparing" &&
            item.status !== "idle" &&
            !accepted.has(item.questionId),
        )
        .map((item) => item.questionId);
      setPart2NoPrepQuestionIds(
        localMetadata
          .filter(
            (item) =>
              item.part === 2 &&
              item.status !== "preparing" &&
              item.status !== "idle" &&
              !accepted.has(item.questionId),
          )
          .map((item) => item.questionId),
      );
      if (unrecoverable.length > 0) {
        dispatchResponse({ type: "crash_recovery", questionIds: unrecoverable });
        setError(
          "A previous answer was saved without audio because this browser keeps recordings in memory only. Offline recovery after a crash is unsupported; please record it again while online.",
        );
      }
      uploadedQuestionIdsRef.current = accepted;
      setRecoveredQuestionIds([...accepted]);
      setRecoveryReady(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? `Could not recover your uploaded answers. ${e.message}`
          : "Could not recover your uploaded answers.",
      );
    }
  }, [micScope]);

  useEffect(() => {
    if (!micPassed || !attemptId) return;

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
  }, [micPassed, attemptId]);

  const startExam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const boot = await speakingApi.start(mockTestId, {
        part: 1,
        mockAttemptId: mockAttemptId ?? undefined,
        skillContext: skillContext ?? undefined,
        fromPlan: fromPlan || undefined,
      });
      setAttemptId(boot.attempt_id);
      setStudentName(boot.student_name);
      setDurationSeconds(boot.duration_seconds);
      setStartedAtIso(boot.started_at);
      setServerTimeIso(boot.server_time);
      setPart2Timing({
        prepSeconds: boot.questions.find((question) => question.part === 2)?.prep_seconds,
        maxResponseSeconds: boot.questions.find((question) => question.part === 2)
          ?.max_recording_seconds,
      });
      setManifest(speakingManifestFromServer(boot.questions));
      setManifestHash(boot.manifest_hash);
      await recoverResponses(boot.attempt_id);
    } catch (e) {
      if (e instanceof ApiError && mockAttemptId && (e.status === 403 || e.status === 409)) {
        try {
          const review = await mockApi.speakingModuleReview(mockAttemptId);
          router.replace(
            sectionResultsPathForMockSubmit(mockTestId, "speaking", {
              attempt: review.attempt_id,
              part: review.part,
              mockAttemptId,
              testNumber,
            }),
          );
          return;
        } catch {
          // If the submitted review is not available, fall back to orchestrator progress.
        }
        try {
          const progress = await fetchMockProgressDeduped(mockAttemptId);
          const destination = mockPathFromProgress(mockSlug, mockAttemptId, progress, undefined, {
            testNumber,
          });
          router.replace(
            destination.includes("/speaking")
              ? mockHubPath(mockSlug, mockAttemptId)
              : destination,
          );
          return;
        } catch {
          router.replace(mockHubPath(mockSlug));
          return;
        }
      }
      setError(e instanceof ApiError ? e.message : "Could not start speaking.");
    } finally {
      setLoading(false);
    }
  }, [fromPlan, mockAttemptId, mockSlug, mockTestId, recoverResponses, router, skillContext, testNumber]);

  const handleMicBegin = useCallback(() => {
    writeMicCheckPassed(micScope);
    setMicPassed(true);
    void startExam();
  }, [micScope, startExam]);

  const bootRef = useRef(false);

  useEffect(() => {
    if (micPassed && !attemptId && !loading && !error && !bootRef.current) {
      bootRef.current = true;
      void startExam();
    }
  }, [micPassed, attemptId, loading, error, startExam]);

  const handleStepRecorded = useCallback(
    (recording: SpeakingSessionRecording) => {
      recordingsRef.current.set(recording.questionId, recording);
      saveSpeakingSessionRecording(micScope, {
        questionId: recording.questionId,
        part: recording.part,
        durationSec: recording.durationSec,
      });
      dispatchResponse({
        type: "capture",
        questionId: recording.questionId,
        durationSec: recording.durationSec,
      });
      if (!attemptId || !recording.blob) return;
      const descriptor = expectedResponses.find(
        (response) => response.questionId === recording.questionId,
      );
      if (!descriptor) return;

      const job: SpeakingUploadJob = {
        attemptId,
        ...descriptor,
        audio: recording.blob,
        durationSec: recording.durationSec,
        idempotencyKey:
          idempotencyKeysRef.current.get(recording.questionId) ??
          crypto.randomUUID().replaceAll("-", ""),
      };
      idempotencyKeysRef.current.set(recording.questionId, job.idempotencyKey);
      dispatchResponse({ type: "queue", questionId: recording.questionId });
      void persistJobStatus(job, "queued");
      const upload = (uploadWorkerRef.current?.enqueue(job) ?? Promise.reject(new Error("Upload worker is not ready.")))
        .catch((e: unknown) => {
          setError(
            e instanceof Error
              ? `Answer saved on this device, but upload failed: ${e.message}`
              : "Answer saved on this device, but upload failed. It will retry at submission.",
          );
          throw e;
        })
        .finally(() => {
          uploadPromisesRef.current.delete(recording.questionId);
        });
      uploadPromisesRef.current.set(recording.questionId, upload);
      void upload.catch(() => undefined);
    },
    [attemptId, expectedResponses, micScope, persistJobStatus],
  );

  const handleStepRecordingStarted = useCallback(
    async (response: ExpectedSpeakingResponse) => {
      const idempotencyKey =
        idempotencyKeysRef.current.get(response.questionId) ??
        crypto.randomUUID().replaceAll("-", "");
      idempotencyKeysRef.current.set(response.questionId, idempotencyKey);
      await persistSpeakingResponseMetadata({
        scope: micScope,
        ...response,
        status: "recording",
        durationSec: null,
        capturedAt: new Date().toISOString(),
        error: null,
        idempotencyKey,
        prepStartedAt: null,
      });
    },
    [micScope],
  );

  const handlePart2PreparationStarted = useCallback(
    async (response: ExpectedSpeakingResponse, startedAt: string) => {
      await persistSpeakingResponseMetadata({
        scope: micScope,
        ...response,
        status: "preparing",
        durationSec: null,
        capturedAt: null,
        error: null,
        idempotencyKey: null,
        prepStartedAt: startedAt,
      });
    },
    [micScope],
  );

  const handleExamComplete = useCallback(
    async (recordings: SpeakingSessionRecording[]) => {
      if (!attemptId || busy || finalizeInFlightRef.current) return;
      finalizeInFlightRef.current = true;
      recordings.forEach((recording) => recordingsRef.current.set(recording.questionId, recording));
      setBusy(true);
      setError(null);

      const goToResults = (resultAttemptId: string) => {
        const wake = wakeLockRef.current;
        wakeLockRef.current = null;
        if (wake) void wake.release();
        try {
          clearSpeakingSessionRecordings(micScope);
        } catch {
          /* best-effort */
        }
        void clearSpeakingResponseMetadata(micScope).catch(() => undefined);
        persistModuleResultAttempt(testNumber, "speaking", resultAttemptId);
        if (fromPlan && planHubId) {
          const current = planTask ?? "submit";
          recordPlanDayOutcome({
            skill: "speaking",
            taskType: current,
            band: null,
            rawScore: null,
            totalQuestions: null,
          });
          markPlanStepDone({
            fromPlan: true,
            hubId: planHubId,
            currentTaskId: planTaskId,
            completeHub: shouldCompleteHubForPlanTask("speaking", current),
          });
          router.replace(
            appendPlanResultParams(
              speakingPendingPath(testNumber, resultAttemptId, mockAttemptId),
              {
                task: current,
                taskId: planTaskId,
                hubId: planHubId,
              },
            ),
          );
          return;
        }
        // Pending status while AI / human score is processing.
        router.replace(
          speakingPendingPath(testNumber, resultAttemptId, mockAttemptId),
        );
      };

      try {
        // Trust the server for what is already confirmed (local refs can lag).
        try {
          const recovery = await speakingApi.responses(attemptId);
          const accepted = acceptedRecoveredQuestionIds(recovery);
          accepted.forEach((id) => uploadedQuestionIdsRef.current.add(id));
        } catch {
          /* keep local upload set */
        }

        const missingBeforeRetry = missingExpectedResponseIds(
          expectedResponses,
          uploadedQuestionIdsRef.current,
        );
        await Promise.all(
          missingBeforeRetry.map(async (questionId) => {
            const pending = uploadPromisesRef.current.get(questionId);
            if (pending) {
              await pending;
              return;
            }
            const recording = recordingsRef.current.get(questionId);
            const descriptor = expectedResponses.find(
              (response) => response.questionId === questionId,
            );
            if (!recording?.blob || !descriptor) {
              throw new Error(
                "One or more answers are missing. Resume the test to record every question.",
              );
            }
            const job: SpeakingUploadJob = {
              attemptId,
              ...descriptor,
              audio: recording.blob,
              durationSec: recording.durationSec,
              idempotencyKey:
                idempotencyKeysRef.current.get(questionId) ??
                crypto.randomUUID().replaceAll("-", ""),
            };
            idempotencyKeysRef.current.set(questionId, job.idempotencyKey);
            dispatchResponse({ type: "queue", questionId });
            await persistJobStatus(job, "queued");
            const worker = uploadWorkerRef.current;
            if (!worker) throw new Error("Upload worker is not ready.");
            await worker.enqueue(job);
          }),
        );

        const missing = missingExpectedResponseIds(
          expectedResponses,
          uploadedQuestionIdsRef.current,
        );
        if (missing.length > 0) {
          throw new Error(
            `${missing.length} answer${missing.length === 1 ? " is" : "s are"} still uploading. Try submitting again.`,
          );
        }

        if (!manifestHash) throw new Error("The speaking manifest could not be verified.");
        const result = await speakingApi.finalize(attemptId, { manifestHash });
        goToResults(result.attempt_id);
      } catch (e) {
        // Finalize (or a prior attempt) may have already completed on the server.
        try {
          const recovery = await speakingApi.responses(attemptId);
          const accepted = acceptedRecoveredQuestionIds(recovery);
          if (
            expectedResponses.length > 0 &&
            missingExpectedResponseIds(expectedResponses, accepted).length === 0
          ) {
            goToResults(attemptId);
            return;
          }
        } catch {
          /* fall through to error */
        }
        setError(formatExamSubmitError(e));
      } finally {
        finalizeInFlightRef.current = false;
        setBusy(false);
      }
    },
    [
      attemptId,
      busy,
      expectedResponses,
      fromPlan,
      micScope,
      mockAttemptId,
      mockTestId,
      planHubId,
      planTask,
      planTaskId,
      router,
      testNumber,
      persistJobStatus,
      manifestHash,
    ],
  );

  const canSubmitOnExpiry =
    Boolean(attemptId) &&
    recoveryReady &&
    Boolean(manifestHash) &&
    !busy;

  const onTimerExpire = useCallback(() => {
    if (!canSubmitOnExpiry) return;
    void handleExamComplete(Array.from(recordingsRef.current.values()));
  }, [canSubmitOnExpiry, handleExamComplete]);

  useEffect(() => {
    expiryHandlerRef.current = onTimerExpire;
  }, [onTimerExpire]);

  useExamExpiryCatchUp({
    remaining,
    canSubmit: canSubmitOnExpiry,
    onExpire: onTimerExpire,
    resetKey: startedAtIso,
  });

  if (!micStateReady) {
    return <ExamSectionLoader title="Loading speaking…" />;
  }

  if (!micPassed) {
    return (
      <TestShell fillViewport header={<TestHeader timer={null} />}>
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
          <SpeakingMicCheck
            onBegin={handleMicBegin}
            beginBusy={loading}
            totalMinutes={14}
          />
        </main>
      </TestShell>
    );
  }

  if (!attemptId) {
    if (error) {
      return (
        <TestShell header={<TestHeader timer={null} />}>
          <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
            <p className="text-[14px] text-red-600" role="alert">
              {error}
            </p>
            <Button variant="primary" onClick={() => void startExam()}>
              Retry speaking
            </Button>
          </main>
        </TestShell>
      );
    }
    return <ExamSectionLoader title="Loading speaking…" />;
  }

  if (!recoveryReady) {
    if (error) {
      return (
        <TestShell header={<TestHeader timer={null} />}>
          <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="max-w-md text-sm text-danger" role="alert">
              {error}
            </p>
            <Button variant="primary" onClick={() => void recoverResponses(attemptId)}>
              Retry recovery
            </Button>
          </main>
        </TestShell>
      );
    }
    return <ExamSectionLoader title="Recovering speaking answers…" />;
  }

  return (
    <TestShell
      fillViewport
      header={<TestHeader timer={<TestTimer remainingSeconds={remaining} />} />}
    >
      <main className="mx-auto flex min-h-0 w-full max-w-[1360px] flex-1 flex-col overflow-hidden p-3 sm:p-5 md:p-8 lg:p-10">
        {studentName ? (
          <div className="mb-3 inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-border bg-surface px-3 py-1.5 text-meta text-ink/75 sm:mb-4">
            <UserRound className="size-3.5 text-teal" aria-hidden />
            <span>
              Recording as <span className="font-semibold text-navy">{studentName}</span>
            </span>
          </div>
        ) : null}

        <SpeakingExamFlow
          key={attemptId}
          manifest={manifest}
          completedQuestionIds={recoveredQuestionIds}
          part2NoPrepQuestionIds={part2NoPrepQuestionIds}
          onStepRecordingStarted={handleStepRecordingStarted}
          onPart2PreparationStarted={handlePart2PreparationStarted}
          onStepRecorded={handleStepRecorded}
          onExamComplete={(recordings) => void handleExamComplete(recordings)}
          footerBusy={busy}
          completeLabel="Submit for human review"
          part2Timing={{ ...part2Timing, serverTime: serverTimeIso }}
        />

        {error ? (
          <p className="mt-3 shrink-0 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <p className="mt-3 shrink-0 text-center text-meta text-ink/55">
          Your Speaking band will be available within 24 hours after examiner review.
        </p>
      </main>

      {busy ? <ExamBusyOverlay title="Uploading all speaking answers…" /> : null}
    </TestShell>
  );
}
