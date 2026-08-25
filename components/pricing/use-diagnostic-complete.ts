"use client";

import { useEffect, useState } from "react";

import { fetchDiagnosticLatestClient } from "@/lib/diagnostic-results-sync";
import { readDiagnosticResults } from "@/lib/diagnostic-session";

export type DiagnosticCompleteStatus = "loading" | "complete" | "incomplete";

function isLocalDiagnosticComplete(): boolean {
  const snap = readDiagnosticResults();
  if (!snap) return false;
  if (snap.completed_at) return true;
  return snap.aggregate_band != null && snap.aggregate_band > 0;
}

/** Whether the visitor has finished the free diagnostic (local snapshot or server). */
export function useDiagnosticComplete(): DiagnosticCompleteStatus {
  const [status, setStatus] = useState<DiagnosticCompleteStatus>("loading");

  useEffect(() => {
    let active = true;

    if (isLocalDiagnosticComplete()) {
      setStatus("complete");
      return () => {
        active = false;
      };
    }

    void fetchDiagnosticLatestClient()
      .then((latest) => {
        if (!active) return;
        const band = latest?.aggregate_band;
        if (band != null && band > 0) {
          setStatus("complete");
        } else {
          setStatus("incomplete");
        }
      })
      .catch(() => {
        if (active) setStatus("incomplete");
      });

    return () => {
      active = false;
    };
  }, []);

  return status;
}
