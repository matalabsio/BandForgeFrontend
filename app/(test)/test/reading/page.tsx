import type { Metadata } from "next";
import { TestReadingView } from "@/components/test/test-reading-view";

export const metadata: Metadata = {
  title: "Reading — Mock Test",
  robots: { index: false, follow: false },
};

export default function ReadingTestPage() {
  return <TestReadingView />;
}
