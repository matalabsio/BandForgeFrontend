"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCountdown } from "@/hooks/use-countdown";
import {
  QuestionNav,
  TestAudioPlayer,
  TestHeader,
  TestProgress,
  TestShell,
  TestTimer,
} from "@/components/test";
import { cn } from "@/lib/utils";

const TOTAL = 40;
const DEMO_SECONDS = 30 * 60;

export function TestListeningView() {
  const remaining = useCountdown(DEMO_SECONDS);
  const [current, setCurrent] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const answeredSet = new Set(Object.keys(answers).map(Number));

  const select = useCallback(
    (opt: string) => setAnswers((p) => ({ ...p, [current]: opt })),
    [current],
  );

  return (
    <TestShell
      header={<TestHeader timer={<TestTimer remainingSeconds={remaining} />} />}
    >
      <QuestionNav
        totalQuestions={TOTAL}
        currentQuestion={current}
        answeredQuestions={answeredSet}
        onSelect={setCurrent}
        label="Listening questions"
      />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TestProgress
          current={answeredSet.size}
          total={TOTAL}
          label="Listening · Section 1"
        />
        <div className="sticky top-0 z-10 border-b border-border bg-white p-4 md:px-6">
          <TestAudioPlayer src="" />
        </div>
        <section className="flex-1 overflow-y-auto p-4 md:p-6">
          <p className="text-question font-medium text-ink" data-test-question>
            Question {current}: What is the main purpose of the speaker&apos;s
            visit?
          </p>
          <fieldset className="mt-6 space-y-2">
            <legend className="sr-only">Choose an answer</legend>
            {["A", "B", "C", "D"].map((opt) => (
              <label
                key={opt}
                className={cn(
                  "flex min-h-[var(--spacing-touch)] cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors duration-200",
                  answers[current] === opt
                    ? "border-teal bg-teal/5"
                    : "border-border hover:border-teal/40",
                )}
              >
                <input
                  type="radio"
                  name={`lq-${current}`}
                  checked={answers[current] === opt}
                  onChange={() => select(opt)}
                  className="accent-teal"
                />
                <span className="text-question">
                  <span className="font-mono font-semibold text-navy">{opt}.</span>{" "}
                  Sample response option {opt}
                </span>
              </label>
            ))}
          </fieldset>
          <div className="sticky-test-actions mt-8 flex gap-3">
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
              onClick={() => setCurrent((c) => Math.min(TOTAL, c + 1))}
            >
              Next
            </Button>
          </div>
        </section>
      </main>
    </TestShell>
  );
}
