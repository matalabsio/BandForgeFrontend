"use client";

import { SectionInstructionsModal } from "@/modules/shared/components/section-instructions-modal";

type Props = {
  onBegin: () => void;
  busy?: boolean;
  agreed: boolean;
  onAgreeChange: (checked: boolean) => void;
};

export function ListeningIntroCard({
  onBegin,
  busy = false,
  agreed,
  onAgreeChange,
}: Props) {
  return (
    <SectionInstructionsModal
      title="Listening Test Instructions"
      instructions={[
        "Listening is the first module in this Test 1 flow and includes 4 parts.",
        "Each part audio is played only once.",
        "Questions are shown after the current part audio finishes.",
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
