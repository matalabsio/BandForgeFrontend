import { IeltsExamSkeleton } from "@/components/exam/ielts-exam-skeleton";

/** Part exam boot — not the mock hub card grid. */
export default function TestListeningLoading() {
  return (
    <IeltsExamSkeleton
      light
      title="Loading Listening…"
      subtitle="Preparing questions and audio."
    />
  );
}
