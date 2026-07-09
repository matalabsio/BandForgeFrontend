"use client";

import { getMockMeta, type MockMeta } from "@/lib/mock-catalog";
import { SectionInstructionsModal } from "@/modules/shared/components/section-instructions-modal";

type Props = {
  mockSlug?: string;
  mockMeta?: MockMeta;
  onBegin: () => void;
  busy?: boolean;
  agreed: boolean;
  onAgreeChange: (checked: boolean) => void;
};

export function ListeningIntroCard({
  mockSlug = "m01",
  mockMeta: mockMetaProp,
  onBegin,
  busy = false,
  agreed,
  onAgreeChange,
}: Props) {
  const meta = mockMetaProp ?? getMockMeta(mockSlug);
  return (
    <SectionInstructionsModal
      badge={`IELTS Academic · ${meta.displayLabel}`}
      title="Listening Test Instructions"
      instructions={[
        `Listening is the first module in this ${meta.displayLabel} flow and includes ${meta.listeningPartCount} parts.`,
        "Each part audio is played only once.",
        "You have 30 seconds to read the questions before each recording starts.",
        "You can browse and answer questions while the recording plays.",
        "Submit each part to move to the next section.",
        "Use headphones before you begin.",
      ]}
      ctaLabel="Begin Test"
      busy={busy}
      agreed={agreed}
      onAgreeChange={onAgreeChange}
      onContinue={onBegin}
    />
  );
}
