import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { mockTestNumberPath } from "@/lib/mock-catalog";
import { isLiveCatalogNumber } from "@/lib/mock-catalog-api";

export const metadata: Metadata = {
  title: "Reading review · BandForge",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ number: string }>;
};

/** Legacy module-review URL — per-section results replaced this flow. */
export default async function ReadingReviewPage({ params }: Props) {
  const { number: numberRaw } = await params;
  const testNumber = Number.parseInt(numberRaw, 10);
  if (!Number.isFinite(testNumber) || testNumber < 1 || !isLiveCatalogNumber(testNumber)) {
    notFound();
  }
  redirect(mockTestNumberPath(testNumber));
}
