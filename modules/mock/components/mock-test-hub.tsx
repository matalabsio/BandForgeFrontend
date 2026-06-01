"use client";

import { useRouter } from "next/navigation";
import { ClockIcon } from "@/components/bandforge/dashboard/icons";
import {
  MOCK_DISPLAY_FLOW_HINT,
  MOCK_DISPLAY_LABEL,
  MOCK_DISPLAY_SUBTITLE,
  mockResultsPath,
  TEST1_TOTAL_MINUTES,
} from "@/lib/mock-catalog";
import { navigateAfterMockStart, navigateFromProgress } from "@/lib/mock-exam-nav";
import { MockAttemptHistory } from "@/modules/mock/components/mock-attempt-history";
import { useMockSession } from "@/modules/mock/hooks/use-mock-session";
import { defaultModuleProgress } from "@/modules/mock/lib/mock-progress";
import { Test1FlowStepper } from "@/modules/mock/components/test1-flow-stepper";
import type { MockAttemptProgress } from "@/modules/mock/services/mock-api";

type Props = {
  mockSlug: string;
  mockTestId: string;
  title?: string;
  initialProgress?: MockAttemptProgress | null;
};

export function MockTestHub({
  mockSlug,
  mockTestId,
  title = MOCK_DISPLAY_LABEL,
  initialProgress = null,
}: Props) {
  const { push, replace } = useRouter();
  const nav = { push, replace };
  const { mockAttemptId, progress, busy, error, start } = useMockSession(
    mockTestId,
    { initialProgress },
  );

  const showRetake = progress?.status === "completed";

  const startFullMock = async (forceNew = false) => {
    try {
      const res = await start(forceNew || showRetake);
      navigateAfterMockStart(nav, mockSlug, res);
    } catch {
      /* error surfaced via hook */
    }
  };

  const resumeFullMock = async () => {
    if (!progress?.mock_attempt_id) return;
    if (progress.status === "completed") {
      push(mockResultsPath(mockSlug, progress.mock_attempt_id));
      return;
    }
    if (progress.next_module) {
      navigateFromProgress(nav, mockSlug, progress.mock_attempt_id, progress);
      return;
    }
    if (progress.status === "in_progress" && progress.current_module) {
      navigateFromProgress(nav, mockSlug, progress.mock_attempt_id, {
        status: progress.status,
        next_module: progress.current_module,
        next_part:
          progress.next_part ??
          progress.modules.find((m) => m.module === progress.current_module)
            ?.part ??
          1,
      });
    }
  };

  const modules = progress?.modules ?? defaultModuleProgress();

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="bf-dash-enter mx-auto max-w-2xl">
        <div className="rounded-xl border border-[var(--exam-border)] bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--exam-accent)]">
            IELTS Academic · Full test
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[var(--exam-ink)] sm:text-[1.65rem]">
            {title}
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--exam-ink-muted)]">
            {MOCK_DISPLAY_SUBTITLE}
          </p>
          <p className="mt-2 text-[13px] text-[var(--exam-ink-muted)]">
            Complete each section in order to unlock the next. {MOCK_DISPLAY_FLOW_HINT}
          </p>
          <ul className="mt-4 flex flex-wrap gap-3 text-[11px] font-medium text-[var(--exam-ink-muted)]">
            <li className="inline-flex items-center gap-1">
              <ClockIcon className="size-3.5 text-[var(--exam-accent)]" />
              ~{TEST1_TOTAL_MINUTES} min live sections
            </li>
          </ul>

          {error ? (
            <p
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-800"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            {progress?.status === "in_progress" ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void resumeFullMock()}
                className="cursor-pointer rounded-xl bg-[var(--exam-accent)] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Resume {MOCK_DISPLAY_LABEL}
              </button>
            ) : showRetake ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void startFullMock(true)}
                className="cursor-pointer rounded-xl bg-[var(--exam-accent)] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Retake {MOCK_DISPLAY_LABEL}
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => void startFullMock(false)}
                className="cursor-pointer rounded-xl bg-[var(--exam-accent)] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Starting…" : `Start ${MOCK_DISPLAY_LABEL}`}
              </button>
            )}
            {progress?.status === "in_progress" ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void startFullMock(true)}
                className="cursor-pointer rounded-xl border border-[var(--exam-border)] px-4 py-2.5 text-[13px] font-semibold text-[var(--exam-ink-muted)] hover:border-[var(--exam-ink-muted)] disabled:opacity-60"
              >
                Start fresh
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[var(--exam-ink-muted)]">
            Your test journey
          </h2>
          <Test1FlowStepper
            mockSlug={mockSlug}
            modules={modules}
            mockAttemptId={progress?.mock_attempt_id}
            mockStatus={progress?.status}
          />
        </div>

        <p className="mt-6 text-center text-[12px] leading-relaxed text-[var(--exam-ink-muted)]">
          Each section has its own timer. When time runs out, your answers submit
          automatically. <strong className="font-semibold">Finish section</strong> moves
          you to the next part (Reading → Listening → Results).
        </p>

        <MockAttemptHistory
          mockSlug={mockSlug}
          mockTestId={mockTestId}
          currentMockAttemptId={mockAttemptId}
        />
      </div>
    </div>
  );
}
