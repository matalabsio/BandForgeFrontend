import type { Metadata } from "next";
import { BandForgeLanding } from "@/components/bandforge";

export const metadata: Metadata = {
  title: "BandForge | AI-powered IELTS preparation",
  description:
    "Realistic IELTS mocks, instant Reading and Listening scores, and AI feedback for Writing and Speaking.",
};

/** Fresh session check for hero/header CTAs (avoid stale ISR auth). */
export const dynamic = "force-dynamic";

/** BandForge marketing landing at `/`. */
export default function Home() {
  return <BandForgeLanding />;
}
