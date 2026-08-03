import { IeltsExamSkeleton } from "@/components/exam/ielts-exam-skeleton";

export default function WritingTaskLoading() {
  return (
    <IeltsExamSkeleton
      light
      title="Loading Writing…"
      subtitle="Fetching your task prompt."
    />
  );
}
