import type { MockCatalogSlot } from "@/lib/mock-catalog-api";
import type { MockAttemptProgress } from "@/modules/mock/services/mock-api";
import { MockTestHub, type MockHubMeta } from "@/modules/mock/components/mock-test-hub";
import { MockTestHubShell } from "@/modules/mock/components/mock-test-hub-shell";
import { MockTestComingSoon } from "@/modules/mock/components/mock-test-coming-soon";

type Props = {
  catalogSlots: MockCatalogSlot[];
  activeNumber: number;
  selectedSlot: MockCatalogSlot;
  initialProgress?: MockAttemptProgress | null;
};

function slotToHubMeta(slot: MockCatalogSlot): MockHubMeta {
  return {
    displayLabel: slot.displayLabel,
    examTitle: slot.examTitle,
    listeningPartCount: slot.listeningPartCount,
    readingPassageCount: slot.readingPassageCount,
    writingTaskCount: slot.writingTaskCount,
    listeningMinutes: slot.listeningMinutes,
    readingMinutes: slot.readingMinutes,
    writingMinutes: slot.writingMinutes,
    totalMinutes: slot.totalMinutes,
    flowHint: slot.flowHint,
  };
}

export function MockTestsUnified({
  catalogSlots,
  activeNumber,
  selectedSlot,
  initialProgress = null,
}: Props) {
  const isAvailable = selectedSlot.available && Boolean(selectedSlot.id);

  return (
    <MockTestHubShell
      activeNumber={activeNumber}
      title="Mock tests"
      catalogSlots={catalogSlots}
    >
      {isAvailable ? (
        <MockTestHub
          mockSlug={selectedSlot.id}
          mockTestId={selectedSlot.id}
          title={selectedSlot.displayLabel}
          hubMeta={slotToHubMeta(selectedSlot)}
          initialProgress={initialProgress}
          variant="embedded"
        />
      ) : (
        <MockTestComingSoon
          embedded
          slot={{
            number: selectedSlot.number as 1 | 2 | 3 | 4 | 5,
            slug: null,
            displayLabel: selectedSlot.displayLabel,
            examTitle: selectedSlot.examTitle,
            available: false,
          }}
          catalogSlots={catalogSlots}
        />
      )}
    </MockTestHubShell>
  );
}
