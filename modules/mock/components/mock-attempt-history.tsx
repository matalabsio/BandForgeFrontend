"use client";

import { useState } from "react";
import Link from "next/link";
import { mockResultsPath } from "@/lib/mock-catalog";
import {
  mockApi,
  type MockAttemptHistoryLiteItem,
} from "@/modules/mock/services/mock-api";

type Props = {
  mockSlug: string;
  mockTestId: string;
  currentMockAttemptId?: string | null;
};

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function statusLabel(status: string): string {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In progress";
  if (status === "abandoned") return "Abandoned";
  return status;
}

export function MockAttemptHistory({
  mockSlug,
  mockTestId,
  currentMockAttemptId,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<MockAttemptHistoryLiteItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    if (loaded || loading) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await mockApi.historyLite(mockTestId);
      setItems(rows);
      setLoaded(true);
    } catch {
      setError("Could not load past attempts.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next) void loadHistory();
  };

  return (
    <section className="mt-8">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[var(--exam-border)] bg-white px-4 py-3 text-left shadow-sm hover:border-[var(--exam-ink-muted)]"
        aria-expanded={expanded}
      >
        <span>
          <span className="text-[13px] font-bold uppercase tracking-wide text-[var(--exam-ink-muted)]">
            Past attempts
          </span>
          <span className="mt-0.5 block text-[13px] text-[var(--exam-ink-muted)]">
            {expanded
              ? "Every finished run is saved. Open any attempt to review scores."
              : "Show past attempts"}
          </span>
        </span>
        <span className="text-[12px] font-semibold text-[var(--exam-accent)]">
          {expanded ? "Hide" : "Show"}
        </span>
      </button>

      {expanded ? (
        <div className="mt-3">
          {loading ? (
            <p className="text-[13px] text-[var(--exam-ink-muted)]">Loading…</p>
          ) : error ? (
            <p className="text-[13px] text-red-700" role="alert">
              {error}
            </p>
          ) : items.length === 0 ? (
            <p className="text-[13px] text-[var(--exam-ink-muted)]">
              No past attempts yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((item, index) => {
                const isCurrent = item.mock_attempt_id === currentMockAttemptId;
                const when = item.completed_at ?? item.started_at;
                return (
                  <li
                    key={item.mock_attempt_id}
                    className="rounded-xl border border-[var(--exam-border)] bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-bold text-[var(--exam-ink)]">
                          Attempt {items.length - index}
                          {isCurrent ? (
                            <span className="ml-2 text-[11px] font-semibold uppercase text-[var(--exam-accent)]">
                              Current
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 text-[12px] text-[var(--exam-ink-muted)]">
                          {formatWhen(when)} · {statusLabel(item.status)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {item.status === "completed" ? (
                          <Link
                            href={mockResultsPath(mockSlug, item.mock_attempt_id)}
                            className="text-[12px] font-semibold text-[var(--exam-accent)] hover:underline"
                          >
                            View results
                          </Link>
                        ) : item.status === "in_progress" ? (
                          <span className="text-[12px] font-semibold text-[var(--exam-ink-muted)]">
                            Resume from hub
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}
