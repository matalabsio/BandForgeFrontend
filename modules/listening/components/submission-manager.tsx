"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ensureExamSessionIfStale } from "@/lib/exam-session";
import { listeningApi } from "@/modules/listening/services/listening-api";
import {
  formatExamSubmitError,
  submitWithExamSession,
} from "@/modules/shared/lib/submit-with-exam-session";
import type { AutosaveQueueItem, SubmitListeningPayload } from "@/modules/listening/types";

const QUEUE_PREFIX = "bf-listening-queue-";
const DEBOUNCE_MS = 250;

function queueKey(attemptId: string): string {
  return `${QUEUE_PREFIX}${attemptId}`;
}

function readQueue(attemptId: string): AutosaveQueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(queueKey(attemptId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AutosaveQueueItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(attemptId: string, items: AutosaveQueueItem[]): void {
  if (typeof window === "undefined") return;
  try {
    if (items.length === 0) {
      window.localStorage.removeItem(queueKey(attemptId));
    } else {
      window.localStorage.setItem(queueKey(attemptId), JSON.stringify(items));
    }
  } catch {
    // ignore
  }
}

async function tryAutosave(
  attemptId: string,
  questionId: string,
  userAnswer: string,
): Promise<boolean> {
  try {
    await ensureExamSessionIfStale();
    await listeningApi.autosave(attemptId, questionId, userAnswer);
    return true;
  } catch {
    return false;
  }
}

async function flushQueue(attemptId: string): Promise<void> {
  let items = readQueue(attemptId);
  if (items.length === 0) return;
  const next: AutosaveQueueItem[] = [];
  for (const item of items) {
    const ok = await tryAutosave(attemptId, item.question_id, item.user_answer);
    if (!ok) next.push(item);
  }
  items = next;
  writeQueue(attemptId, items);
}

export function useAutosave(attemptId: string | null) {
  const timersRef = useRef<Record<string, number>>({});

  const cancelTimer = useCallback((qid: string) => {
    const handle = timersRef.current[qid];
    if (handle) {
      window.clearTimeout(handle);
      delete timersRef.current[qid];
    }
  }, []);

  const schedule = useCallback(
    (questionId: string, value: string) => {
      if (!attemptId) return;
      cancelTimer(questionId);
      const handle = window.setTimeout(async () => {
        delete timersRef.current[questionId];
        const ok = await tryAutosave(attemptId, questionId, value);
        if (!ok) {
          const items = readQueue(attemptId).filter((i) => i.question_id !== questionId);
          items.push({
            question_id: questionId,
            user_answer: value,
            queued_at: new Date().toISOString(),
          });
          writeQueue(attemptId, items);
        }
      }, DEBOUNCE_MS);
      timersRef.current[questionId] = handle;
    },
    [attemptId, cancelTimer],
  );

  const flushNow = useCallback(async () => {
    if (!attemptId) return;
    const timerEntries = Object.entries(timersRef.current);
    for (const [, handle] of timerEntries) {
      window.clearTimeout(handle);
    }
    timersRef.current = {};
    await flushQueue(attemptId);
  }, [attemptId]);

  useEffect(() => {
    if (!attemptId) return;
    void flushQueue(attemptId);
    const onOnline = () => void flushQueue(attemptId);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("online", onOnline);
    };
  }, [attemptId]);

  return { schedule, flushNow };
}

type SubmitButtonProps = {
  attemptId: string | null;
  answers: { question_id: string; user_answer: string }[];
  disabled?: boolean;
  variant?: "default" | "exam";
  onBeforeSubmit?: () => Promise<void> | void;
  onSubmitted: (payload: SubmitListeningPayload) => void;
  onError: (message: string) => void;
};

export function SubmissionButton({
  attemptId,
  answers,
  disabled,
  variant = "default",
  onBeforeSubmit,
  onSubmitted,
  onError,
}: SubmitButtonProps) {
  const [busy, setBusy] = useState(false);

  const submit = useCallback(async () => {
    if (!attemptId || busy) return;
    setBusy(true);
    try {
      const payload = await submitWithExamSession({
        flush: onBeforeSubmit,
        submit: () => listeningApi.submit(attemptId, answers),
      });
      onSubmitted(payload);
    } catch (e) {
      onError(formatExamSubmitError(e));
    } finally {
      setBusy(false);
    }
  }, [attemptId, answers, busy, onBeforeSubmit, onSubmitted, onError]);

  const isExam = variant === "exam";

  return (
    <button
      type="button"
      disabled={disabled || busy || !attemptId}
      onClick={() => void submit()}
      className={
        isExam
          ? "min-h-[44px] cursor-pointer border border-[#18181b] bg-[#18181b] px-6 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#27272a] disabled:cursor-not-allowed disabled:opacity-50"
          : "min-h-[44px] cursor-pointer rounded-xl bg-navy px-5 py-2 text-body font-semibold text-white hover:bg-navy/90 disabled:opacity-60"
      }
    >
      {busy ? "Submitting…" : isExam ? "Submit test" : "Submit attempt"}
    </button>
  );
}
