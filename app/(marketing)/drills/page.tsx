import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { pageMetadata } from "@/lib/seo/metadata";

const DrillsExperience = dynamic(
  () =>
    import("@/components/bandforge/drills/drills-experience").then(
      (m) => m.DrillsExperience,
    ),
  {
    loading: () => (
      <div className="min-h-dvh bg-white" aria-busy="true" aria-label="Loading">
        <div className="bf-container py-24">
          <div className="h-3 w-24 animate-pulse rounded bg-cyan/20" />
          <div className="mt-6 h-14 w-full max-w-lg animate-pulse rounded-xl bg-navy/8" />
          <div className="mt-4 h-4 w-full max-w-md animate-pulse rounded bg-navy/6" />
          <div className="mt-4 h-4 w-2/3 max-w-sm animate-pulse rounded bg-navy/6" />
        </div>
      </div>
    ),
  },
);

export const metadata: Metadata = pageMetadata({
  title: "The Drills — Listening, Reading, Writing & Speaking Practice",
  description:
    "Four IELTS skill drills built from real exam formats. Timed practice aimed at the gap your diagnostic finds — Listening, Reading, Writing, and Speaking.",
  path: "/drills",
});

export default function DrillsPage() {
  return <DrillsExperience />;
}
