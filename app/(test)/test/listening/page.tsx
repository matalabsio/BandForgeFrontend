import type { Metadata } from "next";
import { TestListeningView } from "@/components/test/test-listening-view";

export const metadata: Metadata = {
  title: "Listening — Mock Test",
  robots: { index: false, follow: false },
};

export default function ListeningTestPage() {
  return <TestListeningView />;
}
