"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { writingTargets } from "@/lib/design-tokens";
import { useCountdown } from "@/hooks/use-countdown";
import { TestHeader, TestShell, TestTimer, WordCounter } from "@/modules/shared";
import { cn } from "@/lib/utils";

const DEMO_SECONDS = 60 * 60;

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function TestWritingView() {
  const remaining = useCountdown(DEMO_SECONDS);
  const [task, setTask] = useState<1 | 2>(2);
  const [essay, setEssay] = useState("");
  const [saved, setSaved] = useState(true);

  const min =
    task === 1 ? writingTargets.task1Min : writingTargets.task2Min;
  const wordCount = useMemo(() => countWords(essay), [essay]);

  const handleChange = (v: string) => {
    setEssay(v);
    setSaved(false);
    window.setTimeout(() => setSaved(true), 600);
  };

  return (
    <TestShell
      header={<TestHeader timer={<TestTimer remainingSeconds={remaining} />} />}
    >
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-6">
          <div className="flex gap-2">
            {([1, 2] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTask(t)}
                className={cn(
                  "cursor-pointer rounded-lg px-4 py-2 text-body font-medium transition-colors duration-200",
                  task === t
                    ? "bg-navy text-white"
                    : "bg-surface text-ink/70 hover:text-navy",
                )}
              >
                Task {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <WordCounter count={wordCount} min={min} />
            <span
              className={cn(
                "text-meta",
                saved ? "text-success" : "text-ink/45",
              )}
            >
              {saved ? "Saved" : "Saving…"}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row lg:p-6">
          <section
            className="lg:w-2/5 lg:overflow-y-auto"
            aria-label="Task prompt"
          >
            <p className="text-meta font-medium text-navy">
              Writing Task {task}
            </p>
            <p className="text-question mt-3 leading-relaxed text-ink" data-test-question>
              {task === 1
                ? "The chart below shows the proportion of households in owned and rented accommodation in England and Wales between 1918 and 2011. Summarise the information by selecting and reporting the main features, and make comparisons where relevant."
                : "Some people believe that technology has made life more complicated. To what extent do you agree or disagree? Give reasons for your answer and include relevant examples from your own knowledge or experience."}
            </p>
            {task === 2 ? (
              <aside className="mt-4 rounded-lg border border-border bg-surface p-4">
                <p className="text-meta font-semibold text-navy">Tips</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-meta text-ink/65">
                  <li>State your position in the introduction</li>
                  <li>Use clear paragraphs with one main idea each</li>
                  <li>Leave 5 minutes to proofread</li>
                </ul>
              </aside>
            ) : null}
          </section>

          <section className="flex min-h-[280px] flex-1 flex-col">
            <label htmlFor="essay" className="sr-only">
              Your response
            </label>
            <textarea
              id="essay"
              value={essay}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Type your response here…"
              className="answer-input min-h-[240px] flex-1 resize-none rounded-lg border border-border bg-white p-4 text-ink transition-colors duration-200 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
            />
            <div className="sticky-test-actions mt-4 flex justify-end gap-3">
              <Button variant="secondary">Save draft</Button>
              <Button variant="primary">Submit task</Button>
            </div>
          </section>
        </div>
      </main>
    </TestShell>
  );
}
