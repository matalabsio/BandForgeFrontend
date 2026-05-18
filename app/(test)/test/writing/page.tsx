import type { Metadata } from "next";
import { TestWritingView } from "@/components/test/test-writing-view";

export const metadata: Metadata = {
  title: "Writing — Mock Test",
  robots: { index: false, follow: false },
};

export default function WritingTestPage() {
  return <TestWritingView />;
}
