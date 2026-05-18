"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCountdown } from "@/hooks/use-countdown";
import {
  QuestionNav,
  TestHeader,
  TestProgress,
  TestShell,
  TestTimer,
} from "@/components/test";
import { cn } from "@/lib/utils";

const TOTAL = 40;
const DEMO_SECONDS = 60 * 60;

const OPTIONS = ["A", "B", "C", "D"] as const;

export function TestReadingView() {
  const remaining = useCountdown(DEMO_SECONDS);
  const [current, setCurrent] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const answeredSet = new Set(Object.keys(answers).map(Number));

  const selectOption = useCallback((option: string) => {
    setAnswers((prev) => ({ ...prev, [current]: option }));
  }, [current]);

  const selected = answers[current];

  return (
    <TestShell
      header={
        <TestHeader
          timer={<TestTimer remainingSeconds={remaining} />}
        />
      }
    >
      <QuestionNav
        totalQuestions={TOTAL}
        currentQuestion={current}
        answeredQuestions={answeredSet}
        onSelect={setCurrent}
        label="Reading questions"
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TestProgress
          current={answeredSet.size}
          total={TOTAL}
          label="Reading · Passage 1"
        />
        <div className="border-b border-border px-4 py-2 md:px-6">
          <p className="text-meta font-medium text-navy">
            Question {current} of {TOTAL}
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-0 overflow-hidden lg:flex-row">
          <section
            className="overflow-y-auto border-b border-surface bg-white p-4 lg:w-1/2 lg:border-b-0 lg:border-r lg:p-6"
            aria-label="Reading passage"
          >
            <p className="text-question leading-relaxed text-ink" data-test-question>
              The development of urban public transport in the late nineteenth century
              transformed how workers commuted. Before reliable tram networks, most
              labourers lived within walking distance of factories. As cities expanded,
              municipalities invested in electrified lines that reduced journey times and
              supported suburban growth.
            </p>
            <p className="text-question mt-4 leading-relaxed text-ink" data-test-question>
              Historians debate whether these investments primarily benefited employers
              seeking larger labour pools or residents gaining access to cheaper housing.
              Evidence from Manchester and Berlin suggests both forces operated simultaneously,
              though funding models differed sharply between British and German councils.
            </p>
          </section>

          <section
            className="flex flex-1 flex-col overflow-y-auto p-4 lg:w-1/2 lg:p-6"
            aria-label="Question"
          >
            <p className="text-question font-medium text-ink" data-test-question>
              According to the passage, what changed when tram networks became reliable?
            </p>

            <fieldset className="mt-6 space-y-2">
              <legend className="sr-only">Choose an answer</legend>
              {OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className={cn(
                    "flex min-h-[var(--spacing-touch)] cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors duration-200",
                    selected === opt
                      ? "border-teal bg-teal/5"
                      : "border-navy/15 bg-white hover:border-teal/40",
                  )}
                >
                  <input
                    type="radio"
                    name={`q-${current}`}
                    value={opt}
                    checked={selected === opt}
                    onChange={() => selectOption(opt)}
                    className="h-4 w-4 accent-teal"
                  />
                  <span className="text-question text-ink">
                    <span className="font-mono font-semibold text-navy">{opt}.</span>{" "}
                    {opt === "A" && "Workers could live farther from factories."}
                    {opt === "B" && "Factories closed in city centres."}
                    {opt === "C" && "Walking commutes became more common."}
                    {opt === "D" && "German councils stopped funding transport."}
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="sticky-test-actions mt-auto flex flex-wrap gap-3 pt-8">
              <Button
                variant="secondary"
                className="min-w-0 flex-1 sm:flex-none"
                disabled={current <= 1}
                onClick={() => setCurrent((c) => Math.max(1, c - 1))}
              >
                Previous
              </Button>
              <Button
                variant="primary"
                className="min-w-0 flex-1 sm:flex-none"
                onClick={() =>
                  setCurrent((c) => (c < TOTAL ? c + 1 : c))
                }
              >
                {current >= TOTAL ? "Review" : "Next"}
              </Button>
            </div>
          </section>
        </div>
      </main>
    </TestShell>
  );
}
