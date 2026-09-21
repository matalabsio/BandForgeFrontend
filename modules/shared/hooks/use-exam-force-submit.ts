"use client";

import { useCallback, useEffect, useRef } from "react";

type Args = {
  canSubmit: boolean;
  /** Return true when submit finished (navigated, completed, or terminal error). False = retry. */
  submit: () => Promise<boolean | void> | boolean | void;
  resetKey?: string | null;
};

const INITIAL_RETRY_MS = 1500;
const MAX_RETRY_MS = 12_000;
const MAX_ATTEMPTS = 20;

/**
 * Time-up submit that keeps retrying until the submit call reports success
 * (or a terminal stop). Uses exponential backoff so failed submits cannot
 * hammer expensive endpoints.
 */
export function useExamForceSubmit({ canSubmit, submit, resetKey }: Args): {
  onExpire: () => void;
} {
  const pendingRef = useRef(false);
  const inFlightRef = useRef(false);
  const retryDelayRef = useRef(INITIAL_RETRY_MS);
  const attemptsRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const canSubmitRef = useRef(canSubmit);
  const submitRef = useRef(submit);

  useEffect(() => {
    canSubmitRef.current = canSubmit;
  }, [canSubmit]);

  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  useEffect(() => {
    pendingRef.current = false;
    inFlightRef.current = false;
    retryDelayRef.current = INITIAL_RETRY_MS;
    attemptsRef.current = 0;
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [resetKey]);

  const scheduleRetry = useCallback((tryForceSubmit: () => void) => {
    if (attemptsRef.current >= MAX_ATTEMPTS) {
      pendingRef.current = false;
      return;
    }
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
    }
    const delay = retryDelayRef.current;
    retryDelayRef.current = Math.min(MAX_RETRY_MS, Math.round(delay * 1.75));
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      tryForceSubmit();
    }, delay);
  }, []);

  const tryForceSubmit = useCallback(() => {
    if (!pendingRef.current) return;
    if (!canSubmitRef.current) return;
    if (inFlightRef.current) return;
    if (attemptsRef.current >= MAX_ATTEMPTS) {
      pendingRef.current = false;
      return;
    }
    inFlightRef.current = true;
    attemptsRef.current += 1;
    void Promise.resolve()
      .then(() => submitRef.current())
      .then((ok) => {
        if (ok === true) {
          pendingRef.current = false;
          retryDelayRef.current = INITIAL_RETRY_MS;
          attemptsRef.current = 0;
          return;
        }
        scheduleRetry(tryForceSubmit);
      })
      .catch(() => {
        scheduleRetry(tryForceSubmit);
      })
      .finally(() => {
        inFlightRef.current = false;
      });
  }, [scheduleRetry]);

  useEffect(() => {
    tryForceSubmit();
  }, [canSubmit, tryForceSubmit]);

  const onExpire = useCallback(() => {
    pendingRef.current = true;
    retryDelayRef.current = INITIAL_RETRY_MS;
    attemptsRef.current = 0;
    tryForceSubmit();
  }, [tryForceSubmit]);

  return { onExpire };
}
