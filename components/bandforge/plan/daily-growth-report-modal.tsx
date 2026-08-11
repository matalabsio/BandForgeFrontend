"use client";

import { useRef, useState } from "react";
import { Download, FileText, Share2, X } from "lucide-react";
import { FaTelegram, FaWhatsapp } from "react-icons/fa";
import { DailyGrowthReportCard } from "@/components/bandforge/plan/daily-growth-report-card";
import { DASH_EASE } from "@/components/bandforge/dashboard/motion";
import {
  BF_PRIMARY_CTA_GRADIENT,
  BF_PRIMARY_CTA_HOVER,
} from "@/components/bandforge/bf-primary-cta-styles";
import type { LearningStudyTask, SkillHubProgress } from "@/lib/learning-types";
import {
  buildDailyReportPngFile,
  downloadDailyReportPdf,
  downloadDailyReportPng,
} from "@/lib/daily-report-export";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  studentName: string;
  reportDate: Date;
  tasks: LearningStudyTask[];
  hubProgress?: Record<string, SkillHubProgress>;
  currentBand?: number | null;
  targetBand?: number | null;
  overallPlanPct?: number;
};

export function DailyGrowthReportModal({
  open,
  onClose,
  studentName,
  reportDate,
  tasks,
  hubProgress,
  currentBand,
  targetBand,
  overallPlanPct,
}: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"png" | "pdf" | "share" | null>(null);
  const [shareHint, setShareHint] = useState<string | null>(null);

  if (!open) return null;

  const exportPng = async () => {
    if (!reportRef.current || busy) return;
    const card = reportRef.current.querySelector(
      "[data-daily-report-card]",
    ) as HTMLElement | null;
    if (!card) return;
    setBusy("png");
    try {
      await downloadDailyReportPng(card);
    } finally {
      setBusy(null);
    }
  };

  const exportPdf = async () => {
    if (!reportRef.current || busy) return;
    const card = reportRef.current.querySelector(
      "[data-daily-report-card]",
    ) as HTMLElement | null;
    if (!card) return;
    setBusy("pdf");
    try {
      await downloadDailyReportPdf(card);
    } finally {
      setBusy(null);
    }
  };

  const shareText = `BandForge Daily Growth Report\nStudent: ${studentName}\nDate: ${new Intl.DateTimeFormat(
    "en-GB",
    { day: "2-digit", month: "short", year: "numeric" },
  ).format(reportDate)}\nBuilding IELTS consistency daily with BandForge.`;

  const openShareUrl = (base: string, text: string) => {
    const url = `${base}${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareNative = async () => {
    if (!reportRef.current || busy) return;
    const card = reportRef.current.querySelector(
      "[data-daily-report-card]",
    ) as HTMLElement | null;
    if (!card) return;
    setBusy("share");
    setShareHint(null);
    try {
      const file = await buildDailyReportPngFile(card);
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };
      if (navigator.share && nav.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "BandForge Daily Growth Report",
          text: shareText,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: "BandForge Daily Growth Report",
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setShareHint("Copied report text. Use WhatsApp/X buttons to post.");
      }
    } catch {
      setShareHint("Share canceled or unavailable on this browser.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close report"
        onClick={onClose}
        className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Daily growth report card"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: DASH_EASE }}
        className="relative z-10 flex max-h-[min(100dvh-1rem,860px)] w-full max-w-[400px] flex-col overflow-hidden rounded-[22px] border border-white/70 bg-white shadow-[0_30px_90px_rgba(2,8,23,0.38)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-ink/[0.06] px-4 py-3">
          <p className="text-[13px] font-semibold text-ink">
            Daily growth report
          </p>
          <button
            type="button"
            aria-label="Close report modal"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <div
          ref={reportRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 sm:py-4"
        >
          <DailyGrowthReportCard
            studentName={studentName}
            reportDate={reportDate}
            tasks={tasks}
            hubProgress={hubProgress}
            currentBand={currentBand}
            targetBand={targetBand}
            overallPlanPct={overallPlanPct}
          />
        </div>

        <div className="grid shrink-0 grid-cols-3 gap-2 border-t border-ink/[0.06] bg-white px-4 py-3">
          <button
            type="button"
            onClick={() => void shareNative()}
            disabled={busy !== null}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-ink/10 bg-white px-2 py-2 text-[12px] font-semibold text-ink transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Share2 className="size-3.5 shrink-0" />
            Share
          </button>
          <button
            type="button"
            onClick={() =>
              openShareUrl(
                "https://wa.me/?text=",
                `${shareText}\n#BandForge #IELTS`,
              )
            }
            className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-ink/10 bg-white px-2 py-2 text-[12px] font-semibold text-ink transition-colors hover:bg-[#25D366]/10"
          >
            <FaWhatsapp className="size-3.5 shrink-0 text-[#25D366]" aria-hidden />
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() =>
              openShareUrl(
                "https://t.me/share/url?text=",
                `${shareText}\n#BandForge #IELTS`,
              )
            }
            className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-ink/10 bg-white px-2 py-2 text-[12px] font-semibold text-ink transition-colors hover:bg-[#229ED9]/10"
          >
            <FaTelegram className="size-3.5 shrink-0 text-[#229ED9]" aria-hidden />
            Telegram
          </button>
        </div>
        {shareHint ? (
          <p className="shrink-0 px-4 pb-1 text-[11px] text-muted">{shareHint}</p>
        ) : null}

        <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-ink/[0.06] bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={exportPng}
            disabled={busy !== null}
            className={cn(
              "group inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-full border border-transparent px-3 py-2 text-[13px] font-semibold text-white shadow-[0_8px_22px_rgb(0_151_167/0.28)] disabled:cursor-not-allowed disabled:opacity-60",
              BF_PRIMARY_CTA_GRADIENT,
              BF_PRIMARY_CTA_HOVER,
            )}
          >
            <Download className="relative z-[1] size-4 shrink-0" />
            <span className="relative z-[1]">
              {busy === "png" ? "Exporting…" : "PNG"}
            </span>
          </button>
          <button
            type="button"
            onClick={exportPdf}
            disabled={busy !== null}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FileText className="size-4 shrink-0" />
            {busy === "pdf" ? "Exporting…" : "PDF"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
