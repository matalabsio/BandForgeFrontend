"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCountdown } from "@/hooks/use-countdown";
import { TestHeader, TestShell, TestTimer } from "@/modules/shared";
import { cn } from "@/lib/utils";

const DEMO_SECONDS = 15 * 60;

export function TestSpeakingView() {
  const remaining = useCountdown(DEMO_SECONDS);
  const [recording, setRecording] = useState(false);
  const [part, setPart] = useState(1);

  return (
    <TestShell
      header={<TestHeader timer={<TestTimer remainingSeconds={remaining} />} />}
    >
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-y-auto p-4 md:p-8">
        <p className="text-meta font-medium text-navy">Speaking · Part {part}</p>
        <p className="text-question mt-4 text-ink" data-test-question>
          Describe a place you visited that made a strong impression on you. You
          should say where it was, when you went there, what you did there, and
          explain why it impressed you.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-surface p-6">
          <div
            className="flex h-16 items-end justify-center gap-1"
            aria-hidden
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1 rounded-full bg-teal transition-all duration-200",
                  recording ? "animate-pulse" : "opacity-40",
                )}
                style={{
                  height: recording
                    ? `${20 + Math.sin(i * 0.8) * 16}px`
                    : "8px",
                }}
              />
            ))}
          </div>
          <p className="mt-4 text-center text-meta text-ink/55">
            {recording ? "Recording…" : "Ready to record"}
          </p>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setRecording((r) => !r)}
              className={cn(
                "touch-target flex size-16 cursor-pointer items-center justify-center rounded-full text-body font-semibold text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2",
                recording ? "bg-danger hover:bg-danger/90" : "bg-teal hover:bg-teal-light",
              )}
            >
              {recording ? "Stop" : "Rec"}
            </button>
          </div>
        </div>

        <div className="sticky-test-actions mt-8 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            disabled={part <= 1}
            onClick={() => setPart((p) => Math.max(1, p - 1))}
          >
            Previous part
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => setPart((p) => Math.min(3, p + 1))}
          >
            Next part
          </Button>
        </div>

        <section className="mt-10 space-y-4" aria-label="AI feedback preview">
          <h2 className="text-h4 text-navy">AI feedback (preview)</h2>
          <Card>
            <div className="flex items-start justify-between gap-2">
              <p className="text-body font-medium text-navy">Fluency & coherence</p>
              <Badge variant="teal">Band 6.5</Badge>
            </div>
            <p className="mt-2 text-body text-ink/65">
              Good pace with occasional hesitation. Link ideas with clearer
              signposting between examples.
            </p>
          </Card>
          <Card>
            <div className="flex items-start justify-between gap-2">
              <p className="text-body font-medium text-navy">Pronunciation</p>
              <Badge variant="success">Band 7.0</Badge>
            </div>
            <p className="mt-2 text-body text-ink/65">
              Vowel sounds clear. Work on word stress in multi-syllable academic
              terms.
            </p>
          </Card>
        </section>
      </main>
    </TestShell>
  );
}
