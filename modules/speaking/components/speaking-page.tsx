"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { useResolvedMockAttemptId } from "@/modules/mock/hooks/use-resolved-mock-attempt";
import { fetchMockProgressDeduped } from "@/modules/mock/lib/mock-progress-fetch";
import { SpeakingExamFlow } from "@/modules/speaking/components/speaking-exam-flow";
import { SpeakingMicCheck } from "@/modules/speaking/components/speaking-mic-check";
import {
  readMicCheckPassed,
  writeMicCheckPassed,
} from "@/modules/speaking/lib/speaking-mic-check-storage";
import { MOCK_SPEAKING_MANIFEST } from "@/modules/speaking/lib/speaking-question-manifest";
import {
  pickSubmitRecording,
  saveSpeakingSessionRecording,
} from "@/modules/speaking/lib/speaking-session-storage";
import {
  acquireSpeakingWakeLock,
  type SpeakingWakeLockHandle,
} from "@/modules/speaking/lib/speaking-wake-lock";
import { speakingApi } from "@/modules/speaking/services/speaking-api";
import type { SpeakingSessionRecording } from "@/modules/speaking/types";
import { TestHeader, TestShell, TestTimer } from "@/modules/shared";
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
};

export function SpeakingPage({
  mockTestId,
  mockSlug = DEFAULT_MOCK_SLUG,
  testNumber: testNumberProp,
  skillContext = null,
}: Props) {
  const router = useRouter();
  const mockAttemptId = useResolvedMockAttemptId(mockTestId);
  const testNumber = testNumberProp ?? testNumberForMockId(mockTestId);
  const micScope = mockAttemptId ?? mockTestId;

  const [micPassed, setMicPassed] = useState(() => readMicCheckPassed(micScope));
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(14 * 60);
  const [startedAtIso, setStartedAtIso] = useState<string | null>(null);
  const [serverTimeIso, setServerTimeIso] = useState<string | null>(null);

  const remaining = useListeningTimer({
    startedAtIso,
    serverTimeIso,
    durationSeconds,
    active: Boolean(attemptId),
  });
  useExamSessionGuard(Boolean(attemptId));

  const wakeLockRef = useRef<SpeakingWakeLockHandle | null>(null);

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
      });
      setAttemptId(boot.attempt_id);
      setStudentName(boot.student_name);
      setDurationSeconds(boot.duration_seconds);
      setStartedAtIso(boot.started_at);
      setServerTimeIso(boot.server_time);
    } catch (e) {
      if (e instanceof ApiError && mockAttemptId && (e.status === 403 || e.status === 409)) {
        try {
          const progress = await fetchMockProgressDeduped(mockAttemptId);
          router.replace(mockPathFromProgress(mockSlug, mockAttemptId, progress));
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
  }, [mockAttemptId, mockSlug, mockTestId, router]);

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
      saveSpeakingSessionRecording(micScope, {
        questionId: recording.questionId,
        part: recording.part,
        durationSec: recording.durationSec,
      });
    },
    [micScope],
  );

  const handleExamComplete = useCallback(
    async (recordings: SpeakingSessionRecording[]) => {
      if (!attemptId || busy) return;
      const submitClip = pickSubmitRecording(recordings);
      if (!submitClip?.blob) {
        setError("No valid recording to submit.");
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const result = await speakingApi.submit(
          attemptId,
          submitClip.blob,
          submitClip.durationSec,
        );
        const wake = wakeLockRef.current;
        wakeLockRef.current = null;
        if (wake) void wake.release();
        persistModuleResultAttempt(testNumber, "speaking", result.attempt_id);
        if (mockAttemptId) {
          router.replace(
            sectionResultsPathForMockSubmit(mockTestId, "speaking", {
              attempt: result.attempt_id,
              part: 1,
              mockAttemptId,
            }),
          );
          return;
        }
        router.replace(
          sectionResultsPathForMockSubmit(mockTestId, "speaking", {
            attempt: result.attempt_id,
            part: 1,
          }),
        );
      } catch (e) {
        setError(formatExamSubmitError(e));
      } finally {
        setBusy(false);
      }
    },
    [attemptId, busy, mockAttemptId, mockTestId, router, testNumber],
  );

  if (!micPassed) {
    return (
      <TestShell header={<TestHeader timer={null} />}>
        <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
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

  return (
    <TestShell
      header={<TestHeader timer={<TestTimer remainingSeconds={remaining} />} />}
    >
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-y-auto p-4 md:p-8 lg:p-10">
        {studentName ? (
          <div className="mb-4 inline-flex items-center gap-2 self-start rounded-full border border-border bg-surface px-3 py-1.5 text-meta text-ink/75">
            <UserRound className="size-3.5 text-teal" aria-hidden />
            <span>
              Recording as <span className="font-semibold text-navy">{studentName}</span>
            </span>
          </div>
        ) : null}

        <SpeakingExamFlow
          manifest={MOCK_SPEAKING_MANIFEST}
          onStepRecorded={handleStepRecorded}
          onExamComplete={(recordings) => void handleExamComplete(recordings)}
          footerBusy={busy}
          completeLabel="Submit for human review"
        />

        {error ? (
          <p className="mt-4 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <p className="mt-4 text-center text-meta text-ink/55">
          Your Speaking band will be available within 24 hours after examiner review.
        </p>
      </main>

      {busy ? <ExamBusyOverlay title="Uploading your recording…" /> : null}
    </TestShell>
  );
}
