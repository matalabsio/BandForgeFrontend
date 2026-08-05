"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import {
  cacheCheckpointSubmit,
  cacheSectionAdvance,
} from "@/lib/mock-checkpoint-cache";
import { cacheMockNavHint, shouldSkipMockGuard } from "@/lib/mock-nav-cache";
import { redirectIfMockCompleted } from "@/lib/mock-completed-nav";
import type { ReadingBootServer } from "@/lib/mock-boot-types";
import {
  getMockMeta,
  mockAfterSectionSubmitPath,
  mockHubPath,
  mockPathFromProgress,
  shortModuleResultsPath,
  testNumberForMockId,
  type MockMeta,
} from "@/lib/mock-catalog";
import { sectionResultsPathForMockSubmit } from "@/lib/mock-section-continue";
import { fetchMockProgressDeduped } from "@/modules/mock/lib/mock-progress-fetch";
import { syncExamRoute, navigateAfterSectionSubmit } from "@/lib/mock-exam-nav";
import {
  diagnosticPaths,
  DIAGNOSTIC_NAV_TEST_NUMBER,
  isDiagnosticFlow,
} from "@/lib/diagnostic-catalog";
import {
  diagnosticAfterReadingSubmit,
  navigateAfterDiagnosticSectionSubmit,
} from "@/lib/diagnostic-exam-nav";
import { useExamNavFlags } from "@/modules/mock/hooks/use-exam-nav-flags";
import { persistModuleResultAttempt } from "@/lib/exam-session-storage";
import type { PracticeSkill } from "@/lib/practice-types";
import {
  type PlanTaskKind,
} from "@/lib/plan-task-flow";
import { recordPlanDayOutcome } from "@/lib/plan-daily-progress";
import {
  completePlanStepAndGetNextHref,
  shouldCompleteHubForPlanTask,
} from "@/lib/plan-step-completion";
import { useResolvedMockAttemptId } from "@/modules/mock/hooks/use-resolved-mock-attempt";
import { readingApi } from "@/modules/reading/services/reading-api";
import type { ReadingQuestion } from "@/modules/reading/types";
import { useListeningTimer } from "@/modules/listening/hooks/use-listening-timer";
import { useExamExpiryCatchUp } from "@/modules/shared/hooks/use-exam-expiry-catchup";
import { useExamSessionGuard } from "@/modules/shared/hooks/use-exam-session-refresh";
import {
  formatExamSubmitError,
  submitWithExamSession,
} from "@/modules/shared/lib/submit-with-exam-session";
import { ReadingExamToolbar } from "@/modules/reading/components/reading-exam-toolbar";
import { ReadingIntroOverlay } from "@/modules/reading/components/reading-intro-overlay";
import { ReadingPassagePanel } from "@/modules/reading/components/reading-passage-panel";
import { ReadingQuestionSection } from "@/modules/reading/components/reading-question-section";
import { ReadingSectionStepper } from "@/modules/reading/components/reading-section-stepper";
import { ReadingExamSkeleton } from "@/modules/reading/components/reading-exam-skeleton";
import { ExamPartFooter } from "@/components/exam/exam-part-footer";
import { ExamBusyOverlay } from "@/modules/shared/components/exam-section-loader";
import {
  clearFlowSnapshot,
  nextSection,
  prevSection,
  readFlowSnapshot,
  QUESTION_SECTION_ORDER,
  type QuestionSectionId,
  type ReadingExamPhase,
  writeFlowSnapshot,
} from "@/modules/reading/lib/reading-exam-flow";
import { groupReadingQuestions } from "@/modules/reading/lib/question-groups";

function readConsent(moduleKey: string, attemptScope: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(`bf-instructions:${moduleKey}:${attemptScope}`) === "1";
  } catch {
    return false;
  }
}

function writeConsent(moduleKey: string, attemptScope: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`bf-instructions:${moduleKey}:${attemptScope}`, "1");
  } catch {
    /* ignore */
  }
}

const STORAGE_PREFIX = "bf-reading-";
const READING_AUTOSAVE_DEBOUNCE_MS = 2500;

function storageKey(attemptId: string): string {
  return `${STORAGE_PREFIX}${attemptId}`;
}

function passageDisplayTitle(text: string, fallback: string): string {
  const line = text.split("\n").map((s) => s.trim()).find(Boolean);
  return line ?? fallback;
}

type Props = {
  testId: string;
  mockSlug?: string;
  mockMeta?: MockMeta;
  passage: number;
  /** @deprecated Timer and API start are deferred to intro CTA */
  autoStart?: boolean;
  initialBoot?: ReadingBootServer | null;
  testNumber?: number;
  flow?: "mock" | "diagnostic";
  skillContext?: PracticeSkill | null;
  fromPlan?: boolean;
  planTask?: PlanTaskKind | null;
  planTaskId?: string | null;
  planHubId?: string | null;
};

type SessionStart = Awaited<ReturnType<typeof readingApi.start>>;

function isActiveReadingStatus(status: string | undefined): boolean {
  return status === "in_progress" || status === "started";
}

function defaultQuestionSection(
  groups: ReturnType<typeof groupReadingQuestions>,
): QuestionSectionId {
  const first = groups[0]?.id as QuestionSectionId | undefined;
  if (first && QUESTION_SECTION_ORDER.includes(first)) return first;
  return "tfng";
}

export function ReadingPage({
  testId,
  mockSlug = "m01",
  mockMeta: mockMetaProp,
  passage,
  initialBoot = null,
  testNumber: testNumberProp,
  flow = "mock",
  skillContext = null,
  fromPlan = false,
  planTask = null,
  planTaskId = null,
  planHubId = null,
}: Props) {
  const isDiagnostic = isDiagnosticFlow(flow, testId);
  const { replace, push } = useRouter();
  const mockAttemptId = useResolvedMockAttemptId(testId);
  const resolvedTestNumber = isDiagnostic
    ? DIAGNOSTIC_NAV_TEST_NUMBER
    : (testNumberProp ?? testNumberForMockId(testId));
  const { sectionStart } = useExamNavFlags({
    testNumber: resolvedTestNumber,
    module: "reading",
  });
  const mockMeta = useMemo(
    () => mockMetaProp ?? getMockMeta(mockSlug),
    [mockMetaProp, mockSlug],
  );
  const readingPassageCount = mockMeta.readingPassageCount;

  const beginSessionInFlightRef = useRef<Promise<SessionStart | null> | null>(
    null,
  );
  const bootGenerationRef = useRef(0);
  const initialBootConsumedRef = useRef(false);

  const [loadStatus, setLoadStatus] = useState<"booting" | "ready" | "error">(
    "booting",
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [introAgreed, setIntroAgreed] = useState(false);
  const [examPhase, setExamPhase] = useState<ReadingExamPhase>("intro");
  const [questionSection, setQuestionSection] =
    useState<QuestionSectionId>("tfng");

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const attemptIdRef = useRef<string | null>(null);
  const autosaveAbortRef = useRef<AbortController | null>(null);
  const [startedAtIso, setStartedAtIso] = useState<string | null>(null);
  const [serverTimeIso, setServerTimeIso] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(60 * 60);
  const [testTitle, setTestTitle] = useState("Reading passage");
  const [passageText, setPassageText] = useState("");
  const [questions, setQuestions] = useState<ReadingQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const autosaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingAutosaveValuesRef = useRef<Record<string, string>>({});
  const shouldShowIntro = fromPlan
    ? false
    : !mockAttemptId || passage === 1;
  const shouldShowIntroRef = useRef(shouldShowIntro);
  const instructionScope = useMemo(
    () => mockAttemptId ?? `${testId}:reading`,
    [mockAttemptId, testId],
  );

  const questionGroups = useMemo(
    () => groupReadingQuestions(questions, passage, mockSlug),
    [questions, passage, mockSlug],
  );

  const activeQuestionSection = useMemo(() => {
    if (questionGroups.some((g) => g.id === questionSection)) {
      return questionSection;
    }
    return defaultQuestionSection(questionGroups);
  }, [questionGroups, questionSection]);

  const currentGroup = useMemo(
    () => questionGroups.find((g) => g.id === activeQuestionSection) ?? null,
    [questionGroups, activeQuestionSection],
  );
  const sectionQuestionRanges = useMemo(() => {
    const map: Record<QuestionSectionId, string> = {
      tfng: "Questions 1–5",
      matching_headings: "Questions 6–9",
      sentence_completion: "Questions 10–13",
    };
    for (const g of questionGroups) {
      const id = g.id as QuestionSectionId;
      if (id in map) map[id] = g.title;
    }
    return map;
  }, [questionGroups]);
  const continueLabel = useMemo(() => {
    if (activeQuestionSection === "tfng") {
      return `Continue to ${sectionQuestionRanges.matching_headings}`;
    }
    if (activeQuestionSection === "matching_headings") {
      return `Continue to ${sectionQuestionRanges.sentence_completion}`;
    }
    return "Submit passage";
  }, [activeQuestionSection, sectionQuestionRanges]);

  const isLastQuestionSection = activeQuestionSection === "sentence_completion";

  const toolbarSubmitLabel = useMemo(() => {
    if (mockAttemptId) {
      return passage < readingPassageCount ? "Next Part" : "Finish reading";
    }
    return `Submit passage ${passage}`;
  }, [mockAttemptId, passage, readingPassageCount]);

  const answeredCount = useMemo(
    () => questions.filter((q) => (answers[q.id] ?? "").trim()).length,
    [questions, answers],
  );

  const persistFlow = useCallback(
    (
      phase: ReadingExamPhase,
      section: QuestionSectionId,
      nextAnswers: Record<string, string>,
      nextAttemptId: string | null,
    ) => {
      if (!nextAttemptId) return;
      writeFlowSnapshot(testId, passage, mockAttemptId, {
        attemptId: nextAttemptId,
        passage,
        examPhase: phase,
        questionSection: section,
        answers: nextAnswers,
      });
      try {
        localStorage.setItem(
          storageKey(nextAttemptId),
          JSON.stringify({ answers: nextAnswers, passage }),
        );
      } catch {
        /* ignore */
      }
    },
    [testId, passage, mockAttemptId],
  );

  const cancelAutosaveInFlight = useCallback(() => {
    autosaveAbortRef.current?.abort();
    autosaveAbortRef.current = null;
  }, []);

  const clearAutosaveTimers = useCallback(() => {
    for (const handle of Object.values(autosaveTimers.current)) {
      clearTimeout(handle);
    }
    autosaveTimers.current = {};
    cancelAutosaveInFlight();
  }, [cancelAutosaveInFlight]);

  const setAnswer = useCallback(
    (id: string, value: string) => {
      setAnswers((prev) => {
        const next = { ...prev, [id]: value };
        persistFlow(examPhase, questionSection, next, attemptId);
        return next;
      });
      if (!attemptId) return;
      const saveAttemptId = attemptId;
      pendingAutosaveValuesRef.current[id] = value;
      if (autosaveTimers.current[id]) clearTimeout(autosaveTimers.current[id]);
      autosaveTimers.current[id] = setTimeout(() => {
        void (async () => {
          if (attemptIdRef.current !== saveAttemptId) return;
          cancelAutosaveInFlight();
          const controller = new AbortController();
          autosaveAbortRef.current = controller;
          try {
            await readingApi.autosave(saveAttemptId, id, value, {
              signal: controller.signal,
            });
            if (pendingAutosaveValuesRef.current[id] === value) {
              delete pendingAutosaveValuesRef.current[id];
            }
          } catch (e) {
            if (e instanceof Error && e.name === "AbortError") return;
            /* ignore other autosave errors */
          } finally {
            if (autosaveAbortRef.current === controller) {
              autosaveAbortRef.current = null;
            }
          }
        })();
      }, READING_AUTOSAVE_DEBOUNCE_MS);
    },
    [attemptId, examPhase, questionSection, persistFlow, cancelAutosaveInFlight],
  );

  useEffect(() => {
    const prev = attemptIdRef.current;
    attemptIdRef.current = attemptId;
    if (prev !== null && prev !== attemptId) {
      clearAutosaveTimers();
      pendingAutosaveValuesRef.current = {};
    }
  }, [attemptId, clearAutosaveTimers]);

  const goToResults = useCallback(
    (
      id: string,
      submit?: {
        mock_next_module?: string | null;
        mock_next_part?: number | null;
        mock_reading_complete?: boolean;
      },
    ) => {
      if (mockAttemptId && submit) {
        if (isDiagnostic) {
          const dest = submit.mock_reading_complete
            ? diagnosticAfterReadingSubmit()
            : diagnosticAfterReadingSubmit();
          navigateAfterDiagnosticSectionSubmit(
            { push, replace },
            mockAttemptId,
            dest,
            submit.mock_reading_complete ? "writing" : "reading",
          );
          return;
        }
        const dest =
          submit.mock_reading_complete && submit.mock_next_module
            ? mockPathFromProgress(
                mockSlug,
                mockAttemptId,
                {
                  next_module: submit.mock_next_module,
                  next_part: submit.mock_next_part ?? 1,
                },
                id,
                { testNumber: resolvedTestNumber },
              )
            : submit.mock_reading_complete
              ? mockAfterSectionSubmitPath(mockSlug, mockAttemptId, "reading", {
                  completedPart: readingPassageCount,
                  attemptId: id,
                  testNumber: resolvedTestNumber,
                })
              : mockAfterSectionSubmitPath(mockSlug, mockAttemptId, "reading", {
                  completedPart: passage,
                  attemptId: id,
                  testNumber: resolvedTestNumber,
                });
        navigateAfterSectionSubmit(
          { push, replace },
          mockSlug,
          mockAttemptId,
          dest,
          { replace: true },
        );
        return;
      }
      const testNumber = resolvedTestNumber;
      persistModuleResultAttempt(testNumber, "reading", id);
      push(shortModuleResultsPath(testNumber, "reading"));
    },
    [replace, push, testId, mockSlug, mockAttemptId, passage, isDiagnostic, readingPassageCount, resolvedTestNumber],
  );

  /** After each reading passage in a mock: per-section results screen. */
  const goToMockSectionResults = useCallback(
    (attemptId: string, completedPassage: number) => {
      if (!mockAttemptId) return;
      const testNumber = resolvedTestNumber;
      persistModuleResultAttempt(testNumber, "reading", attemptId);
      replace(
        sectionResultsPathForMockSubmit(mockSlug, "reading", {
          attempt: attemptId,
          part: completedPassage,
          mockAttemptId,
          testNumber,
        }),
      );
    },
    [mockAttemptId, mockSlug, replace, resolvedTestNumber],
  );

  const finishPlanReading = useCallback(
    (score?: {
      band?: number | null;
      raw_score?: number | null;
      total_questions?: number | null;
    }) => {
      if (!fromPlan || !planHubId) return false;
      const current = planTask ?? "practice";
      if (current === "practice") {
        recordPlanDayOutcome({
          skill: "reading",
          taskType: "practice",
          band: score?.band ?? null,
          rawScore: score?.raw_score ?? null,
          totalQuestions: score?.total_questions ?? null,
        });
      }
      const nextHref = completePlanStepAndGetNextHref({
        fromPlan,
        skill: "reading",
        hubId: planHubId,
        currentTask: current,
        currentTaskId: planTaskId,
        catalogNumber: resolvedTestNumber,
        part: passage,
        preferExercise: true,
        completeHub: shouldCompleteHubForPlanTask("reading", current),
      });
      push(
        nextHref ?? "/study-plan/today",
      );
      return true;
    },
    [fromPlan, planHubId, planTask, planTaskId, passage, push, resolvedTestNumber],
  );

  const flushAutosaves = useCallback(
    async (id: string, snapshot: Record<string, string>) => {
      clearAutosaveTimers();
      const pending = Object.entries(pendingAutosaveValuesRef.current);
      if (pending.length === 0) return;
      await Promise.all(
        pending.map(([questionId]) =>
          readingApi
            .autosave(id, questionId, (snapshot[questionId] ?? "").trim())
            .catch(() => undefined),
        ),
      );
      pendingAutosaveValuesRef.current = {};
    },
    [clearAutosaveTimers],
  );

  const submitAll = useCallback(async () => {
    if (!attemptId || questions.length === 0 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const body = questions.map((q) => ({
        question_id: q.id,
        user_answer: (answers[q.id] ?? "").trim(),
      }));
      const result = await submitWithExamSession({
        flush: () => flushAutosaves(attemptId, answers),
        submit: () => readingApi.submit(attemptId, body),
      });
      if (mockAttemptId) {
        cacheCheckpointSubmit(result.attempt_id, {
          band: result.band,
          raw_score: result.raw_score,
          total_questions: result.total_questions,
          skill_breakdown: result.skill_breakdown ?? {},
        });
        cacheSectionAdvance({
          from: "reading",
          band: result.band,
          raw_score: result.raw_score,
          total_questions: result.total_questions,
        });
        const readingDoneOnClient = passage >= readingPassageCount;
        cacheMockNavHint({
          mock_attempt_id: mockAttemptId,
          next_module: readingDoneOnClient
            ? (result.mock_next_module ?? "writing")
            : "reading",
          next_part: readingDoneOnClient
            ? (result.mock_next_part ?? 1)
            : result.mock_next_part ?? passage + 1,
        });
      }
      try {
        localStorage.removeItem(storageKey(attemptId));
        clearFlowSnapshot(testId, passage, mockAttemptId);
      } catch {
        /* ignore */
      }
      const readingComplete =
        result.mock_reading_complete === true || passage >= readingPassageCount;
      if (
        finishPlanReading({
          band: result.band,
          raw_score: result.raw_score,
          total_questions: result.total_questions,
        })
      )
        return;
      if (mockAttemptId && !isDiagnostic) {
        goToMockSectionResults(result.attempt_id, passage);
        return;
      }
      goToResults(result.attempt_id, {
        ...result,
        mock_reading_complete: readingComplete,
      });
      return;
    } catch (e) {
      if (e instanceof ApiError && e.status === 409 && mockAttemptId) {
        try {
          const p = await fetchMockProgressDeduped(mockAttemptId);
          replace(
            mockPathFromProgress(
              mockSlug,
              mockAttemptId,
              {
                next_module: p.next_module,
                next_part: p.next_part,
                status: p.status,
              },
              undefined,
              { testNumber: resolvedTestNumber },
            ),
          );
          return;
        } catch {
          /* fall through */
        }
      }
      setError(formatExamSubmitError(e));
    } finally {
      setBusy(false);
    }
  }, [
    attemptId,
    questions,
    answers,
    goToResults,
    goToMockSectionResults,
    finishPlanReading,
    isDiagnostic,
    mockAttemptId,
    testId,
    passage,
    readingPassageCount,
    busy,
    flushAutosaves,
    mockSlug,
    replace,
  ]);

  const expiryFiredRef = useRef(false);

  useEffect(() => {
    expiryFiredRef.current = false;
  }, [startedAtIso]);

  const canSubmitOnExpiry =
    loadStatus === "ready" &&
    Boolean(attemptId) &&
    questions.length > 0 &&
    !busy;

  const onTimerExpire = useCallback(() => {
    if (expiryFiredRef.current) return;
    if (!canSubmitOnExpiry) return;
    expiryFiredRef.current = true;
    void submitAll();
  }, [canSubmitOnExpiry, submitAll]);

  const timerActive =
    loadStatus === "ready" &&
    (examPhase === "passage" || examPhase === "questions") &&
    Boolean(attemptId);

  const examSessionGuardActive = loadStatus === "ready" && Boolean(attemptId);

  useExamSessionGuard(examSessionGuardActive);

  const remaining = useListeningTimer({
    startedAtIso,
    serverTimeIso,
    durationSeconds,
    active: timerActive,
    onExpire: onTimerExpire,
  });

  useExamExpiryCatchUp({
    remaining,
    canSubmit: canSubmitOnExpiry,
    onExpire: onTimerExpire,
    resetKey: startedAtIso,
  });

  const hydrateFromStart = useCallback(
    (
      start: Awaited<ReturnType<typeof readingApi.start>>,
      freshPassage = false,
      snap?: ReturnType<typeof readFlowSnapshot>,
    ) => {
      if (attemptIdRef.current !== start.attempt_id) {
        clearAutosaveTimers();
      }
      attemptIdRef.current = start.attempt_id;
      setAttemptId(start.attempt_id);
      setStartedAtIso(start.started_at);
      setServerTimeIso(start.server_time);
      setDurationSeconds(start.duration_seconds);
      if (start.test?.title) setTestTitle(start.test.title);
      if (start.passage_text) setPassageText(start.passage_text);
      const qs = start.questions ?? [];
      setQuestions(qs);
      const init: Record<string, string> = {};
      for (const q of qs) init[q.id] = "";
      if (!freshPassage && start.saved_answers) {
        for (const q of qs) {
          if (start.saved_answers[q.id]) init[q.id] = start.saved_answers[q.id];
        }
      } else if (snap?.answers && !freshPassage) {
        for (const q of qs) {
          if (snap.answers[q.id]) init[q.id] = snap.answers[q.id];
        }
      } else if (!freshPassage) {
        try {
          const raw = localStorage.getItem(storageKey(start.attempt_id));
          if (raw) {
            const parsed = JSON.parse(raw) as { answers?: Record<string, string> };
            if (parsed.answers) {
              for (const q of qs) {
                if (parsed.answers[q.id]) init[q.id] = parsed.answers[q.id];
              }
            }
          }
        } catch {
          /* ignore */
        }
      }
      setAnswers(init);
      return init;
    },
    [clearAutosaveTimers],
  );

  const beginSession = useCallback(
    async (
      freshPassage = false,
      snap?: ReturnType<typeof readFlowSnapshot>,
    ): Promise<SessionStart | null> => {
      if (beginSessionInFlightRef.current) {
        return beginSessionInFlightRef.current;
      }

      const task = (async (): Promise<SessionStart | null> => {
        setError(null);
        try {
          let start: SessionStart;

          // Reuse server-fetched boot once per mount to avoid a duplicate /start.
          if (
            !initialBootConsumedRef.current &&
            initialBoot?.passage_text &&
            initialBoot.questions?.length &&
            isActiveReadingStatus(initialBoot.status)
          ) {
            initialBootConsumedRef.current = true;
            start = {
              attempt_id: initialBoot.attempt_id,
              started_at: initialBoot.started_at,
              server_time: initialBoot.server_time,
              status: initialBoot.status,
              module: "reading",
              duration_seconds: initialBoot.duration_seconds,
              resumed: initialBoot.resumed,
              test: initialBoot.test ?? { id: testId, title: "Reading" },
              passage_text: initialBoot.passage_text,
              questions: initialBoot.questions as ReadingQuestion[],
            saved_answers: initialBoot.saved_answers ?? {},
            };
          } else {
            start = await readingApi.start(testId, {
              forceNew: false,
              part: passage,
              mockAttemptId: mockAttemptId ?? undefined,
              skillContext: fromPlan ? "reading" : (skillContext ?? undefined),
              fromPlan: fromPlan || undefined,
            });
            if (!start.questions?.length || !start.passage_text) {
              const qs = await readingApi.questions(testId, { part: passage });
              start = {
                ...start,
                test: qs.test,
                passage_text: qs.passage_text,
                questions: qs.questions,
              };
            }
          }

          if (!start.questions?.length || !start.passage_text) {
            throw new ApiError(
              "This passage has no questions yet. Refresh or try again.",
              503,
            );
          }

          hydrateFromStart(start, freshPassage, snap);
          if (snap && (snap.examPhase === "passage" || snap.examPhase === "questions")) {
            setExamPhase(snap.examPhase);
            setQuestionSection(snap.questionSection);
          }
          return start;
        } catch (e) {
          const apiMessage =
            e instanceof ApiError
              ? e.message
              : "Could not load this passage. Sign in and try again.";
          if (e instanceof ApiError && e.status === 403 && mockAttemptId) {
            try {
              const p = await fetchMockProgressDeduped(mockAttemptId);
              replace(
                mockPathFromProgress(
                  mockSlug,
                  mockAttemptId,
                  {
                    next_module: p.next_module,
                    next_part: p.next_part,
                    status: p.status,
                  },
                  undefined,
                  { testNumber: resolvedTestNumber },
                ),
              );
              return null;
            } catch {
              setLoadStatus("error");
              setError(apiMessage);
              return null;
            }
          }
          setLoadStatus("error");
          setError(apiMessage);
          throw e;
        }
      })();

      beginSessionInFlightRef.current = task;
      try {
        return await task;
      } finally {
        if (beginSessionInFlightRef.current === task) {
          beginSessionInFlightRef.current = null;
        }
      }
    },
    [
      testId,
      passage,
      mockAttemptId,
      mockSlug,
      hydrateFromStart,
      replace,
      initialBoot,
      skillContext,
      fromPlan,
      resolvedTestNumber,
    ],
  );

  const finishBoot = useCallback(
    (
      start: SessionStart | null,
      cancelled: boolean,
      bootGen: number,
      opts?: { examPhase?: ReadingExamPhase; questionSection?: QuestionSectionId },
    ) => {
      if (cancelled || bootGenerationRef.current !== bootGen) return false;
      if (!start?.questions?.length || !start.passage_text) {
        setLoadStatus("error");
        setError("Could not load this passage. Please try again.");
        return false;
      }
      if (opts?.examPhase) setExamPhase(opts.examPhase);
      if (opts?.questionSection) {
        setQuestionSection(
          groupReadingQuestions(start.questions, passage, mockSlug).some(
            (g) => g.id === opts.questionSection,
          )
            ? opts.questionSection
            : defaultQuestionSection(
                groupReadingQuestions(start.questions, passage, mockSlug),
              ),
        );
      }
      setLoadStatus("ready");
      return true;
    },
    [passage],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = readConsent("reading", instructionScope);
    setIntroAgreed(seen);
  }, [instructionScope]);

  useEffect(() => {
    shouldShowIntroRef.current = shouldShowIntro;
  }, [shouldShowIntro]);

  useEffect(() => {
    if (!mockAttemptId) return;
    if (isDiagnostic) {
      let cancelled = false;
      void (async () => {
        try {
          const p = await fetchMockProgressDeduped(mockAttemptId);
          if (cancelled) return;
          if (p.status === "completed") {
            replace(diagnosticPaths.results);
          }
        } catch {
          /* ignore */
        }
      })();
      return () => {
        cancelled = true;
      };
    }
    if (shouldSkipMockGuard(mockAttemptId, sectionStart)) return;
    let cancelled = false;
    void (async () => {
      try {
        const p = await fetchMockProgressDeduped(mockAttemptId);
        if (cancelled) return;
        if (redirectIfMockCompleted(p.status, replace)) {
          return;
        }
        if (p.status !== "in_progress") {
          replace(mockHubPath(mockSlug));
          return;
        }
        syncExamRoute(
          { replace },
          mockSlug,
          mockAttemptId,
          {
            module: "reading",
            part: passage,
          },
          p,
          { testNumber: resolvedTestNumber },
        );
      } catch {
        if (!cancelled) replace(mockHubPath(mockSlug));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mockAttemptId, mockSlug, passage, sectionStart, replace, isDiagnostic, resolvedTestNumber]);

  useEffect(() => {
    let cancelled = false;
    const bootGen = ++bootGenerationRef.current;
    initialBootConsumedRef.current = false;

    setLoadStatus("booting");
    setError(null);

    if (sectionStart) {
      clearFlowSnapshot(testId, passage, mockAttemptId);
    }

    const snap = sectionStart
      ? null
      : readFlowSnapshot(testId, passage, mockAttemptId);

    if (
      snap &&
      snap.attemptId &&
      (snap.examPhase === "passage" || snap.examPhase === "questions")
    ) {
      void (async () => {
        try {
          const start = await beginSession(false, snap);
          finishBoot(start, cancelled, bootGen);
        } catch {
          if (!cancelled && bootGenerationRef.current === bootGen) {
            setExamPhase("intro");
            setLoadStatus("ready");
          }
        }
      })();
      return () => {
        cancelled = true;
      };
    }

    if (!shouldShowIntroRef.current) {
      void (async () => {
        try {
          const start = await beginSession(sectionStart, null);
          finishBoot(start, cancelled, bootGen, {
            examPhase: "questions",
            questionSection: "tfng",
          });
        } catch {
          if (!cancelled && bootGenerationRef.current === bootGen) {
            setLoadStatus("error");
          }
        }
      })();
      return () => {
        cancelled = true;
      };
    }

    setExamPhase("intro");
    if (!cancelled && bootGenerationRef.current === bootGen) {
      setLoadStatus("ready");
    }

    return () => {
      cancelled = true;
    };
  }, [testId, passage, mockAttemptId, sectionStart, beginSession, finishBoot]);

  const handleIntroStart = useCallback(async () => {
    if (!introAgreed) return;
    setBusy(true);
    setError(null);
    const bootGen = bootGenerationRef.current;
    try {
      const start = await beginSession(sectionStart, null);
      if (
        !finishBoot(start, false, bootGen, {
          examPhase: "questions",
          questionSection: "tfng",
        })
      ) {
        return;
      }
      writeConsent("reading", instructionScope);
    } catch {
      /* error state set in beginSession */
    } finally {
      setBusy(false);
    }
  }, [beginSession, sectionStart, introAgreed, instructionScope, finishBoot]);

  const handleContinueToQuestions = useCallback(() => {
    setExamPhase("questions");
    setQuestionSection("tfng");
    if (attemptId) {
      persistFlow("questions", "tfng", answers, attemptId);
    }
  }, [attemptId, answers, persistFlow]);

  const handleSectionContinue = useCallback(() => {
    const nxt = nextSection(questionSection);
    if (!nxt) return;
    setQuestionSection(nxt);
    if (attemptId) {
      persistFlow("questions", nxt, answers, attemptId);
    }
  }, [questionSection, attemptId, answers, persistFlow]);

  const handleSectionBack = useCallback(() => {
    const prev = prevSection(questionSection);
    if (!prev) return;
    setQuestionSection(prev);
    if (attemptId) {
      persistFlow("questions", prev, answers, attemptId);
    }
  }, [questionSection, attemptId, answers, persistFlow]);

  const handleStepperSelect = useCallback(
    (section: QuestionSectionId) => {
      setQuestionSection(section);
      if (attemptId) {
        persistFlow("questions", section, answers, attemptId);
      }
    },
    [attemptId, answers, persistFlow],
  );

  useEffect(() => {
    if (attemptId && examPhase !== "intro") {
      persistFlow(examPhase, questionSection, answers, attemptId);
    }
  }, [attemptId, examPhase, questionSection, answers, persistFlow]);

  const contentReady =
    loadStatus === "ready" &&
    questions.length > 0 &&
    passageText.trim().length > 0;

  if (loadStatus === "booting" || (loadStatus === "ready" && !contentReady && examPhase !== "intro")) {
    return (
      <ReadingExamSkeleton
        light={fromPlan}
        title={`Loading Reading · Passage ${passage}`}
        subtitle={
          fromPlan
            ? "Opening your reading practice…"
            : "Fetching the passage and questions for this section."
        }
      />
    );
  }

  if (loadStatus === "error") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="max-w-md text-[14px] text-red-700" role="alert">
          {error}
        </p>
        <button
          type="button"
          onClick={() => {
            setLoadStatus("booting");
            void beginSession(sectionStart).then(() => setLoadStatus("ready"));
          }}
          className="cursor-pointer rounded-md bg-[var(--reading-accent)] px-5 py-2.5 text-[13px] font-bold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  const displayTitle = passageText
    ? passageDisplayTitle(passageText, testTitle)
    : testTitle;
  const durationMinutes = Math.round(durationSeconds / 60);

  const submitOverlayTitle =
    remaining <= 0
      ? "Time's up — submitting…"
      : mockAttemptId && passage >= readingPassageCount
        ? "Finishing reading…"
        : `Submitting Passage ${passage}…`;
  const submitOverlaySubtitle =
    remaining <= 0
      ? "Saving your answers before the deadline."
      : mockAttemptId && passage >= readingPassageCount
        ? "Saving your answers and opening writing."
        : `Saving your answers and loading Passage ${passage + 1}.`;

  return (
    <div className="flex min-h-dvh flex-col">
      {busy ||
      (remaining <= 0 &&
        loadStatus === "ready" &&
        Boolean(attemptId) &&
        questions.length > 0 &&
        examPhase === "intro") ? (
        <ExamBusyOverlay
          title={submitOverlayTitle}
          subtitle={submitOverlaySubtitle}
        />
      ) : null}
      {examPhase === "intro" && shouldShowIntro && remaining > 0 ? (
        <ReadingIntroOverlay
          passageTitle={displayTitle}
          passageNumber={passage}
          totalPassages={readingPassageCount}
          mockSlug={mockSlug}
          durationMinutes={durationMinutes}
          busy={busy}
          agreed={introAgreed}
          onAgreeChange={setIntroAgreed}
          onStart={() => void handleIntroStart()}
        />
      ) : null}

      {examPhase !== "intro" ? (
        <>
          <ReadingExamToolbar
            passage={passage}
            testTitle={
              fromPlan
                ? displayTitle
                : mockAttemptId
                  ? mockMeta.displayLabel
                  : testTitle
            }
            hubHref={
              fromPlan
                ? "/study-plan/today"
                : mockAttemptId
                  ? mockHubPath(mockSlug, mockAttemptId)
                  : undefined
            }
            hubLabel={
              fromPlan
                ? "← Today’s plan"
                : mockAttemptId
                  ? `← ${mockMeta.displayLabel}`
                  : undefined
            }
            sectionHint={
              fromPlan
                ? undefined
                : mockAttemptId
                  ? `Passage ${passage} of ${readingPassageCount}`
                  : undefined
            }
            plainHeader={fromPlan}
            submitLabel={mockAttemptId ? toolbarSubmitLabel : undefined}
            remainingSeconds={remaining}
            timerActive={timerActive}
            answeredCount={answeredCount}
            totalQuestions={questions.length}
            busy={busy}
            showSubmit={
              examPhase === "questions" &&
              activeQuestionSection === "sentence_completion" &&
              contentReady
            }
            onSubmit={() => void submitAll()}
          />

          {error ? (
            <p
              className="shrink-0 border-b border-red-200 bg-red-50 px-4 py-2 text-center text-[13px] text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {examPhase === "questions" ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
              <div className="min-h-[38vh] max-h-[46vh] overflow-hidden border-b border-[var(--reading-border)] sm:min-h-[40vh] lg:max-h-none lg:min-h-0 lg:w-[56%] lg:flex-1 lg:border-b-0 lg:border-r">
                <ReadingPassagePanel passageText={passageText} />
              </div>
              <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:w-[min(44%,560px)] lg:max-w-[560px] lg:shrink-0 lg:max-h-[calc(100dvh-3rem)]">
                <ReadingSectionStepper
                  current={activeQuestionSection}
                  onSelect={handleStepperSelect}
                  labels={{
                    tfng: `${sectionQuestionRanges.tfng} · ${
                      mockSlug === "m02" && passage === 3
                        ? "Yes / No / Not Given"
                        : "TFNG"
                    }`,
                    matching_headings: `${sectionQuestionRanges.matching_headings} · Headings`,
                    sentence_completion: `${sectionQuestionRanges.sentence_completion} · Completion`,
                  }}
                  onBack={handleSectionBack}
                  onContinue={handleSectionContinue}
                  onSubmit={() => void submitAll()}
                  busy={busy}
                  isLastSection={isLastQuestionSection}
                  continueLabel={continueLabel}
                />
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  {currentGroup ? (
                    <ReadingQuestionSection
                      group={currentGroup}
                      sectionId={activeQuestionSection}
                      answers={answers}
                      onAnswer={setAnswer}
                    />
                  ) : (
                    <div className="flex flex-1 items-center justify-center px-6 py-10 text-center">
                      <div className="max-w-md space-y-2">
                        <p className="text-[14px] font-semibold text-[var(--reading-ink)]">
                          No questions in this section
                        </p>
                        <p className="text-[13px] text-[var(--reading-ink)]/70">
                          {isLastQuestionSection
                            ? "This is the final section for this passage. You can submit now."
                            : "This section has no questions for this test. Continue to the next section."}
                        </p>
                      </div>
                    </div>
                  )}
                  <ExamPartFooter
                    variant="reading"
                    label={
                      isLastQuestionSection
                        ? "Submit passage"
                        : continueLabel
                    }
                    busy={busy}
                    onAction={() => {
                      if (isLastQuestionSection) {
                        void submitAll();
                      } else {
                        handleSectionContinue();
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
