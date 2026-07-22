import type { SpeakingFeedback } from "@/modules/speaking/types";
import { ReportAnalysis } from "@/modules/speaking/components/report/report-analysis";
import { ReportFindings } from "@/modules/speaking/components/report/report-findings";
import { ReportSummaryRail } from "@/modules/speaking/components/report/report-summary-rail";
import { SpeakingMockFooterCta } from "@/modules/speaking/components/report/speaking-mock-footer-cta";
import { SpeakingReportHero } from "@/modules/speaking/components/report/speaking-report-hero";
import { SpeakingReportShell } from "@/modules/speaking/components/report/speaking-report-shell";
import { ieltsDescriptor } from "@/modules/speaking/lib/build-speaking-feedback";

type Props = {
  testNumber: number;
  feedback: SpeakingFeedback;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  backHref?: string | null;
  backLabel?: string;
  fallbackHref?: string | null;
};

function dateLabel(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
}

export function SpeakingFeedbackView({
  testNumber,
  feedback,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  backHref,
  backLabel,
  fallbackHref,
}: Props) {
  const title =
    feedback.attempt.mock_title?.trim() ||
    `Mock Test ${feedback.attempt.test_number ?? testNumber}`;
  const reviewer = feedback.release.reviewer;
  const releasedAtLabel = feedback.release.released_at
    ? `Released ${dateLabel(feedback.release.released_at)} · Approval v${feedback.release.approval_version}`
    : null;

  return (
    <SpeakingReportShell
      metaLabel={`${title} · Speaking · ${dateLabel(feedback.attempt.submitted_at)}`}
      backHref={backHref}
      backLabel={backLabel}
      fallbackHref={fallbackHref}
      footer={
        primaryActionLabel && onPrimaryAction ? (
          <SpeakingMockFooterCta
            label={primaryActionLabel}
            onClick={onPrimaryAction}
            secondaryLabel={secondaryActionLabel}
            onSecondary={onSecondaryAction}
          />
        ) : null
      }
    >
      <SpeakingReportHero
        band={feedback.overallBand}
        descriptor={feedback.descriptor || ieltsDescriptor(feedback.overallBand)}
        mode="human"
        reviewer={reviewer}
        releasedAtLabel={releasedAtLabel}
      />

      <div className="mx-auto grid w-full max-w-[1240px] gap-8 px-4 py-8 sm:px-6 md:px-8 lg:grid-cols-[minmax(280px,380px)_minmax(0,1fr)] lg:items-start lg:px-10 lg:py-10">
        <ReportSummaryRail feedback={feedback} />
        <div className="min-w-0">
          <ReportAnalysis parts={feedback.parts} />
          <ReportFindings feedback={feedback} />
        </div>
      </div>
    </SpeakingReportShell>
  );
}
