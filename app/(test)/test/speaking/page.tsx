import type { Metadata } from "next";
import { TestSpeakingView } from "@/components/test/test-speaking-view";

export const metadata: Metadata = {
  title: "Speaking — Mock Test",
  robots: { index: false, follow: false },
};

export default function SpeakingTestPage() {
  return <TestSpeakingView />;
}
