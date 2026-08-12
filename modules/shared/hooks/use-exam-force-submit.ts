"use client";

import { useCallback, useEffect, useRef } from "react";

type Args = {
  canSubmit: boolean;
  /** Return true when submit finished (navigated or completed). False = retry. */
  submit: () => Promise<boolean | void> | boolean | void;
  resetKey?: string | null;
};

/**
 * Time-up submit that keeps retrying until the submit call reports success.
 * Does not mark expiry done before the request succeeds.
 */
export function useExamForceSubmit({ canSubmit, submit, resetKey }: Args): {
  onExpire: () => void;
} {
  const pendingRef = useRef(false);
  const inFlightRef = useRef(false);
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
  }, [resetKey]);

  const tryForceSubmit = useCallback(() => {
    if (!pendingRef.current) return;
    if (!canSubmitRef.current) return;
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    void Promise.resolve()
      .then(() => submitRef.current())
      .then((ok) => {
        if (ok === true) {
          pendingRef.current = false;
          return;
        }
        window.setTimeout(() => tryForceSubmit(), 1500);
      })
      .catch(() => {
        window.setTimeout(() => tryForceSubmit(), 1500);
      })
      .finally(() => {
        inFlightRef.current = false;
      });
  }, []);

  useEffect(() => {
    tryForceSubmit();
  }, [canSubmit, tryForceSubmit]);

  const onExpire = useCallback(() => {
    pendingRef.current = true;
    tryForceSubmit();
  }, [tryForceSubmit]);

  return { onExpire };
}
