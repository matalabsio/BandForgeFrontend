"use client";

import { useState } from "react";
import { Printer, Share2 } from "lucide-react";
import {
  printSpeakingReport,
  shareSpeakingReport,
  type SpeakingShareResult,
} from "@/modules/speaking/lib/speaking-report-actions";

type Feedback = {
  tone: "success" | "neutral" | "error";
  message: string;
};

function shareFeedback(result: SpeakingShareResult): Feedback {
  if (result === "copied") {
    return { tone: "success", message: "Private report link copied." };
  }
  if (result === "cancelled") {
    return { tone: "neutral", message: "Share cancelled." };
  }
  return { tone: "success", message: "Private report link shared." };
}

export function SpeakingReportActions() {
  const [sharing, setSharing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleShare = async () => {
    setSharing(true);
    setFeedback(null);
    try {
      const result = await shareSpeakingReport(window.location.href, {
        share: navigator.share?.bind(navigator),
        writeText: navigator.clipboard?.writeText.bind(navigator.clipboard),
      });
      setFeedback(shareFeedback(result));
    } catch {
      setFeedback({
        tone: "error",
        message: "Could not share this report. Check browser permissions and try again.",
      });
    } finally {
      setSharing(false);
    }
  };

  const handlePrint = () => {
    setFeedback(null);
    printSpeakingReport(() => window.print());
    setFeedback({
      tone: "neutral",
      message: "Print dialog opened. Choose Save as PDF to download a copy.",
    });
  };

  return (
    <section
      className="speaking-report-actions border-b border-border-soft bg-surface-alt px-4 py-4 sm:px-6 md:px-8 lg:px-10"
      aria-label="Speaking report actions"
    >
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-xs leading-relaxed text-muted">
          This is a private link. Only the same BandForge account can open it.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleShare()}
            disabled={sharing}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border-muted bg-white px-4 text-sm font-semibold text-navy transition-colors hover:border-cyan hover:bg-cyan-soft/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
          >
            <Share2 className="size-4" aria-hidden />
            {sharing ? "Sharing…" : "Share privately"}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan motion-reduce:transition-none"
          >
            <Printer className="size-4" aria-hidden />
            Print / Save as PDF
          </button>
        </div>
      </div>
      <p
        className={`mx-auto mt-2 min-h-5 w-full max-w-[1240px] text-xs ${
          feedback?.tone === "error"
            ? "text-danger"
            : feedback?.tone === "success"
              ? "text-success"
              : "text-muted"
        }`}
        role={feedback?.tone === "error" ? "alert" : "status"}
        aria-live="polite"
        aria-atomic="true"
      >
        {feedback?.message ?? ""}
      </p>
    </section>
  );
}
