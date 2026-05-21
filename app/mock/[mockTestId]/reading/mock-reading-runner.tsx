"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ApiError, parseApiError, parseJsonResponse, type ApiErrorBody } from "@/lib/api";

type QuestionPublic = {
  id: string;
  question_number: number;
  question_type: string;
  prompt: string;
  options?: { label: string; text: string }[] | null;
  skill_tag?: string | null;
};

type QuestionsPayload = {
  test: { id: string; title: string; description?: string | null };
  module: string;
  passage_text: string | null;
  audio_urls: string[];
  questions: QuestionPublic[];
};

type StartPayload = {
  attempt_id: string;
  started_at: string;
  status: string;
  module: string;
};

type SubmitPayload = {
  attempt_id: string;
  status: string;
  submitted_at: string;
  answer_count: number;
  late_submission: boolean;
};

const TFNG = ["TRUE", "FALSE", "NOT GIVEN"] as const;

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = await parseJsonResponse<T | ApiErrorBody>(res);
  if (!res.ok) {
    throw new ApiError(parseApiError(body as ApiErrorBody, res.status), res.status);
  }
  return body as T;
}

function QuestionInput({
  q,
  value,
  onChange,
}: {
  q: QuestionPublic;
  value: string;
  onChange: (v: string) => void;
}) {
  const opts = q.options;
  const type = q.question_type.toLowerCase();

  if (opts && opts.length > 0) {
    return (
      <fieldset className="mt-2 space-y-2">
        <legend className="sr-only">Options</legend>
        {opts.map((o) => (
          <label
            key={o.label}
            className="flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-white px-3 py-2 text-body has-[:checked]:border-teal has-[:checked]:bg-teal/5"
          >
            <input
              type="radio"
              name={q.id}
              value={o.label}
              checked={value === o.label}
              onChange={() => onChange(o.label)}
              className="mt-1"
            />
            <span>
              <span className="font-semibold text-navy">{o.label}.</span>{" "}
              {o.text}
            </span>
          </label>
        ))}
      </fieldset>
    );
  }

  if (type === "tfng") {
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {TFNG.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={`rounded-lg border px-3 py-2 text-meta font-semibold transition-colors ${
              value === t
                ? "border-teal bg-teal text-white"
                : "border-border bg-surface text-navy hover:bg-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Your answer"
      className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-body outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
    />
  );
}

export function MockReadingRunner({ mockTestId }: { mockTestId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [payload, setPayload] = useState<QuestionsPayload | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitResult, setSubmitResult] = useState<SubmitPayload | null>(null);

  const setAnswer = useCallback((id: string, v: string) => {
    setAnswers((prev) => ({ ...prev, [id]: v }));
  }, []);

  const loadFlow = useCallback(async () => {
    setError(null);
    setSubmitResult(null);
    setBusy(true);
    try {
      const start = await apiJson<StartPayload>(`/api/tests/${encodeURIComponent(mockTestId)}/start`, {
        method: "POST",
        body: JSON.stringify({ module: "reading" }),
      });
      setAttemptId(start.attempt_id);
      const qs = await apiJson<QuestionsPayload>(
        `/api/tests/${encodeURIComponent(mockTestId)}/questions?module=reading`,
        { method: "GET" },
      );
      setPayload(qs);
      const init: Record<string, string> = {};
      for (const q of qs.questions) {
        init[q.id] = "";
      }
      setAnswers(init);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setError(
          "You already have an in-progress reading attempt for this mock. Complete or remove it in Supabase (`test_attempts`) then try again.",
        );
      } else {
        setError(e instanceof ApiError ? e.message : "Could not start mock.");
      }
      setAttemptId(null);
      setPayload(null);
    } finally {
      setBusy(false);
    }
  }, [mockTestId]);

  const submit = useCallback(async () => {
    if (!attemptId || !payload) return;
    setError(null);
    setBusy(true);
    try {
      const body = {
        answers: payload.questions.map((q) => ({
          question_id: q.id,
          user_answer: (answers[q.id] ?? "").trim(),
        })),
      };
      const res = await apiJson<SubmitPayload>(
        `/api/attempts/${encodeURIComponent(attemptId)}/submit`,
        { method: "POST", body: JSON.stringify(body) },
      );
      setSubmitResult(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Submit failed.");
    } finally {
      setBusy(false);
    }
  }, [attemptId, payload, answers]);

  const title = useMemo(() => payload?.test.title ?? "Reading mock", [payload]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void loadFlow()}
          className="rounded-xl bg-teal px-4 py-2 text-body font-semibold text-white hover:bg-teal-light disabled:opacity-60"
        >
          {busy ? "Loading…" : "1. Start + load questions"}
        </button>
        <Link
          href="/dashboard"
          className="text-meta font-semibold text-teal hover:text-teal-light"
        >
          Back to dashboard
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-body text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {submitResult ? (
        <div className="rounded-lg border border-teal/40 bg-teal/5 px-4 py-3 text-body text-navy">
          <p className="font-semibold">Submitted</p>
          <p className="mt-1 text-meta">
            Status: {submitResult.status} · Answers: {submitResult.answer_count} · Late:{" "}
            {submitResult.late_submission ? "yes" : "no"}
          </p>
          <p className="mt-2 text-meta text-ink/60">
            Scoring is not implemented yet (Day 3). You can start again after submit.
          </p>
        </div>
      ) : null}

      {payload ? (
        <>
          <header>
            <h2 className="font-display text-h3 text-navy">{title}</h2>
            <p className="mt-1 text-meta text-ink/60">Attempt: {attemptId}</p>
          </header>

          {payload.passage_text ? (
            <section className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <h3 className="text-meta font-semibold uppercase tracking-wide text-teal">
                Passage
              </h3>
              <div className="mt-3 whitespace-pre-wrap text-body leading-relaxed text-ink">
                {payload.passage_text}
              </div>
            </section>
          ) : null}

          <section className="space-y-6">
            <h3 className="text-h4 text-navy">Questions</h3>
            {payload.questions.map((q) => (
              <article
                key={q.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <p className="text-meta font-semibold text-ink/55">
                  Q{q.question_number} · {q.question_type}
                  {q.skill_tag ? ` · ${q.skill_tag}` : ""}
                </p>
                <p className="mt-2 text-body text-navy">{q.prompt}</p>
                <QuestionInput q={q} value={answers[q.id] ?? ""} onChange={(v) => setAnswer(q.id, v)} />
              </article>
            ))}
          </section>

          <button
            type="button"
            disabled={busy || !attemptId}
            onClick={() => void submit()}
            className="rounded-xl bg-navy px-4 py-2 text-body font-semibold text-white hover:bg-navy/90 disabled:opacity-60"
          >
            2. Submit all answers
          </button>
        </>
      ) : null}
    </div>
  );
}
