import { ReadingExamSkeleton } from "@/modules/reading/components/reading-exam-skeleton";

export default function TestReadingLoading() {
  return (
    <ReadingExamSkeleton
      light
      title="Loading Reading…"
      subtitle="Preparing passage and questions."
    />
  );
}
