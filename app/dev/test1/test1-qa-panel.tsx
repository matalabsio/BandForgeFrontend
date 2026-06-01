"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  DEFAULT_MOCK_SLUG,
  M01_MOCK_TEST_ID,
  mockModulePath,
  mockResultsPath,
  TEST1_LISTENING_PART_COUNT,
  TEST1_READING_PASSAGE_COUNT,
  TEST1_WRITING_TASK_COUNT,
} from "@/lib/mock-catalog";
import { ModuleProgressChips } from "@/modules/mock/components/module-progress-chips";
import {
  mockApi,
  type MockAttemptProgress,
  type MockAttemptSummary,
} from "@/modules/mock/services/mock-api";

const PERF_CHECKS = [
  "Dashboard: no client /session on first load",
  "Hub: no /history until past attempts expanded",
  "Listening P1: one POST start with include_questions",
  "After submit: no progress GET when section_start=1",
  "Warm /session second call under 500ms",
] as const;

function appendSectionStart(path: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}section_start=1`;
}

function band(v: number | null | undefined): string {
  if (v == null || v <= 0) return "—";
  return v.toFixed(1);
}

export function Test1QaPanel() {
  const mockSlug = DEFAULT_MOCK_SLUG;
  const [session, setSession] = useState<MockAttemptProgress | null>(null);
  const [summary, setSummary] = useState<MockAttemptSummary | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warmMs, setWarmMs] = useState<[number, number] | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  const mockAttemptId = session?.mock_attempt_id ?? null;

  const refreshSession = useCallback(async () => {
    setError(null);
    try {
      const s = await mockApi.session(M01_MOCK_TEST_ID);
      setSession(s);
      if (s?.mock_attempt_id) {
        const sum = await mockApi.summary(s.mock_attempt_id);
        setSummary(sum);
      } else {
        setSummary(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load session.");
    }
  }, []);

  const startNew = async (forceNew = false) => {
    setBusy("start");
    setError(null);
    try {
      const res = await mockApi.start(M01_MOCK_TEST_ID, forceNew);
      if (res.progress) setSession(res.progress);
      else await refreshSession();
      window.location.href = appendSectionStart(
        mockModulePath(mockSlug, "listening", {
          part: 1,
          mockAttemptId: res.mock_attempt_id,
          auto: true,
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Start failed.");
    } finally {
      setBusy(null);
    }
  };

  const runWarmTest = async () => {
    setBusy("warm");
    setError(null);
    try {
      const t0 = performance.now();
      await mockApi.session(M01_MOCK_TEST_ID);
      const t1 = performance.now();
      await mockApi.session(M01_MOCK_TEST_ID);
      const t2 = performance.now();
      setWarmMs([Math.round(t1 - t0), Math.round(t2 - t1)]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Warm test failed.");
    } finally {
      setBusy(null);
    }
  };

  const copyUrl = () => {
    if (!mockAttemptId) return;
    void navigator.clipboard.writeText(window.location.origin + mockResultsPath(mockSlug, mockAttemptId));
  };

  const toggleCheck = (label: string) => {
    setChecks((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const stepLinks: { label: string; href: string }[] = [];
  if (mockAttemptId) {
    for (let p = 1; p <= TEST1_LISTENING_PART_COUNT; p++) {
      stepLinks.push({
        label: `Listening P${p}`,
        href: appendSectionStart(
          mockModulePath(mockSlug, "listening", { part: p, mockAttemptId, auto: true }),
        ),
      });
    }
    for (let p = 1; p <= TEST1_READING_PASSAGE_COUNT; p++) {
      stepLinks.push({
        label: `Reading P${p}`,
        href: appendSectionStart(
          mockModulePath(mockSlug, "reading", { passage: p, mockAttemptId, auto: true }),
        ),
      });
    }
    for (let p = 1; p <= TEST1_WRITING_TASK_COUNT; p++) {
      stepLinks.push({
        label: `Writing T${p}`,
        href: appendSectionStart(
          mockModulePath(mockSlug, "writing", { part: p, mockAttemptId, auto: true }),
        ),
      });
    }
    stepLinks.push({
      label: "Results",
      href: mockResultsPath(mockSlug, mockAttemptId),
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-700">
          Dev only · Test 1 QA
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-slate-900">
          Test 1 flow &amp; perf panel
        </h1>
        <p className="mt-2 text-[14px] text-slate-600">
          Validate session, navigation, scores, and warm-cache behaviour without re-running the full exam manually.
        </p>
      </header>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-slate-500">Actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void refreshSession()}
            className="cursor-pointer rounded-lg bg-slate-800 px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
          >
            Refresh session
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void startNew(false)}
            className="cursor-pointer rounded-lg bg-cyan-600 px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
          >
            {busy === "start" ? "Starting…" : "Start / resume → L P1"}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void startNew(true)}
            className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700 disabled:opacity-50"
          >
            Force new attempt
          </button>
          <button
            type="button"
            disabled={!mockAttemptId}
            onClick={copyUrl}
            className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700 disabled:opacity-50"
          >
            Copy results URL
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void runWarmTest()}
            className="cursor-pointer rounded-lg border border-cyan-300 px-4 py-2 text-[13px] font-semibold text-cyan-800 disabled:opacity-50"
          >
            {busy === "warm" ? "Testing…" : "Warm session test (×2)"}
          </button>
        </div>
        {warmMs ? (
          <p className="mt-3 text-[13px] text-slate-600">
            Session call 1: {warmMs[0]}ms · call 2: {warmMs[1]}ms (target 2nd &lt; 500ms)
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-slate-500">Session</h2>
        {session ? (
          <div className="mt-3 space-y-3">
            <p className="font-mono text-[12px] text-slate-700 break-all">{session.mock_attempt_id}</p>
            <p className="text-[14px] text-slate-800">
              Status: <strong>{session.status}</strong>
              {session.next_module ? (
                <> · Next: {session.next_module} part/passage {session.next_part ?? 1}</>
              ) : null}
            </p>
            <ModuleProgressChips modules={session.modules} />
          </div>
        ) : (
          <p className="mt-3 text-[14px] text-slate-500">No active session — click Refresh or Start.</p>
        )}
      </section>

      {summary ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-slate-500">Scores</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-[11px] uppercase text-slate-500">Overall</p>
              <p className="text-2xl font-bold text-cyan-700">{band(summary.aggregate_band)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-slate-500">Listening</p>
              <p className="text-xl font-bold">{band(summary.listening_band)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-slate-500">Reading</p>
              <p className="text-xl font-bold">{band(summary.reading_band)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-slate-500">Writing</p>
              <p className="text-xl font-bold">{band(summary.writing_band)}</p>
            </div>
          </div>
        </section>
      ) : null}

      {stepLinks.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-slate-500">Step launcher</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {stepLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-block rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] font-medium text-cyan-800 hover:bg-cyan-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-slate-500">Perf checklist</h2>
        <ul className="mt-3 space-y-2">
          {PERF_CHECKS.map((label) => (
            <li key={label}>
              <label className="flex cursor-pointer items-start gap-2 text-[14px] text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(checks[label])}
                  onChange={() => toggleCheck(label)}
                  className="mt-1"
                />
                {label}
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
