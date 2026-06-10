"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError } from "@/lib/api";
import {
  cacheCheckpointSubmit,
  cacheSectionAdvance,
} from "@/lib/mock-checkpoint-cache";
import { cacheMockNavHint, shouldSkipMockGuard } from "@/lib/mock-nav-cache";
import { redirectIfMockCompleted } from "@/lib/mock-completed-nav";
import type { ReadingBootServer } from "@/lib/mock-server";
import {
  getMockMeta,
  mockAfterSectionSubmitPath,
  mockHubPath,
  mockPathFromProgress,
} from "@/lib/mock-catalog";
import { fetchMockProgressDeduped } from "@/modules/mock/lib/mock-progress-fetch";
import { syncExamRoute } from "@/lib/mock-exam-nav";
import { readingModuleResultsPath } from "@/lib/reading-test";
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
  passage: number;
  /** @deprecated Timer and API start are deferred to intro CTA */
  autoStart?: boolean;
  initialBoot?: ReadingBootServer | null;
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
  passage,
  initialBoot = null,
}: Props) {
  const { replace, push } = useRouter();
  const searchParams = useSearchParams();
  const mockAttemptId = searchParams.get("mock_attempt");
  const sectionStart = searchParams.get("section_start") === "1";
  const readingPassageCount = getMockMeta(mockSlug).readingPassageCount;

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
  const shouldShowIntro = !mockAttemptId || passage === 1;
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

  const footerLabel = useMemo(() => {
    if (!isLastQuestionSection) return continueLabel;
    if (mockAttemptId) {
      return passage < readingPassageCount ? "Next Part" : "Finish reading";
    }
    return continueLabel;
  }, [isLastQuestionSection, continueLabel, mockAttemptId, passage, readingPassageCount]);

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
        const dest = submit.mock_reading_complete
          ? mockAfterSectionSubmitPath(mockSlug, mockAttemptId, "reading", {
              completedPart: readingPassageCount,
              attemptId: id,
            })
          : mockAfterSectionSubmitPath(mockSlug, mockAttemptId, "reading", {
              completedPart: passage,
              attemptId: id,
            });
        replace(dest);
        return;
      }
      push(readingModuleResultsPath(testId, id));
    },
    [replace, push, testId, mockSlug, mockAttemptId, passage],
  );

  const flushAutosaves = useCallback(
    async (id: string, snapshot: Record<string, string>) => {
      clearAutosaveTimers();
      await Promise.all(
        questions.map((q) =>
          readingApi
            .autosave(id, q.id, (snapshot[q.id] ?? "").trim())
            .catch(() => undefined),
        ),
      );
    },
    [questions, clearAutosaveTimers],
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
        cacheMockNavHint({
          mock_attempt_id: mockAttemptId,
          next_module: result.mock_reading_complete ? "writing" : "reading",
          next_part: result.mock_reading_complete
            ? 1
            : result.mock_next_part ?? passage + 1,
        });
      }
      try {
        localStorage.removeItem(storageKey(attemptId));
        clearFlowSnapshot(testId, passage, mockAttemptId);
      } catch {
        /* ignore */
      }
      goToResults(result.attempt_id, result);
      return;
    } catch (e) {
      if (e instanceof ApiError && e.status === 409 && mockAttemptId) {
        try {
          const p = await fetchMockProgressDeduped(mockAttemptId);
          replace(
            mockPathFromProgress(mockSlug, mockAttemptId, {
              next_module: p.next_module,
              next_part: p.next_part,
              status: p.status,
            }),
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
    mockAttemptId,
    testId,
    passage,
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
      if (snap?.answers && !freshPassage) {
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
            };
          } else {
            start = await readingApi.start(testId, {
              forceNew: false,
              part: passage,
              mockAttemptId: mockAttemptId ?? undefined,
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
                mockPathFromProgress(mockSlug, mockAttemptId, {
                  next_module: p.next_module,
                  next_part: p.next_part,
                  status: p.status,
                }),
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
        syncExamRoute({ replace }, mockSlug, mockAttemptId, {
          module: "reading",
          part: passage,
        }, p);
      } catch {
        if (!cancelled) replace(mockHubPath(mockSlug));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mockAttemptId, mockSlug, passage, sectionStart, replace]);

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
        title={`Loading Reading · Passage ${passage}`}
        subtitle="Fetching the passage and questions for this section."
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
            testTitle={mockAttemptId ? getMockMeta(mockSlug).displayLabel : testTitle}
            hubHref={
              mockAttemptId ? mockHubPath(mockSlug, mockAttemptId) : undefined
            }
            hubLabel={mockAttemptId ? `← ${getMockMeta(mockSlug).displayLabel}` : undefined}
            sectionHint={
              mockAttemptId
                ? `Passage ${passage} of ${readingPassageCount}`
                : undefined
            }
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

          {examPhase === "questions" && currentGroup ? (
            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
              <div className="min-h-[34vh] border-b border-[var(--reading-border)] lg:min-h-0 lg:w-[min(56%,1fr)] lg:border-b-0 lg:border-r">
                <ReadingPassagePanel passageText={passageText} />
              </div>
              <div className="flex min-h-[52vh] min-w-0 flex-1 flex-col lg:min-h-0 lg:w-[min(44%,560px)] lg:shrink-0 lg:max-h-[calc(100dvh-3rem)]">
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
                <div className="flex min-h-0 flex-1 flex-col">
                  <ReadingQuestionSection
                    group={currentGroup}
                    sectionId={activeQuestionSection}
                    answers={answers}
                    onAnswer={setAnswer}
                  />
                  <ExamPartFooter
                    variant="reading"
                    label={footerLabel}
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
          ) : examPhase === "questions" ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
              <p className="max-w-md text-[14px] text-[var(--reading-ink)]/75">
                Passage content did not load. This can happen after submitting the
                previous section — retry to continue.
              </p>
              <button
                type="button"
                onClick={() => {
                  setLoadStatus("booting");
                  const bootGen = ++bootGenerationRef.current;
                  void beginSession(sectionStart, null).then((start) => {
                    finishBoot(start, false, bootGen, {
                      examPhase: "questions",
                      questionSection: activeQuestionSection,
                    });
                  });
                }}
                className="cursor-pointer rounded-md bg-[var(--reading-accent)] px-5 py-2.5 text-[13px] font-bold text-white"
              >
                Reload passage
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
