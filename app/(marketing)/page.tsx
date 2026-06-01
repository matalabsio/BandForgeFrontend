import type { Metadata } from "next";
import { BandForgeLanding } from "@/components/bandforge";

export const metadata: Metadata = {
  title: "BandForge | AI-powered IELTS preparation",
  description:
    "Realistic IELTS mocks, instant Reading and Listening scores, and AI feedback for Writing and Speaking.",
};

/** BandForge marketing landing at `/`. */
export default function Home() {
  return <BandForgeLanding />;
}
