import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DiagnosticInterstitialExperience } from "@/components/diagnostic/diagnostic-interstitial-experience";
import { isDiagnosticTransitionSlug } from "@/lib/diagnostic-transitions";

export const metadata: Metadata = {
  title: "Diagnostic · BandForge",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function DiagnosticTransitionPage({ params }: Props) {
  const { slug } = await params;
  if (!isDiagnosticTransitionSlug(slug)) {
    notFound();
  }
  return <DiagnosticInterstitialExperience slug={slug} />;
}
