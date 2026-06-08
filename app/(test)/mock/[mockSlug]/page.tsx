import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { testHubPath } from "@/lib/mock-catalog";
import { ensureCanonicalMockHub } from "@/lib/mock-route-guard";

export const metadata: Metadata = {
  title: "Mock test · BandForge",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ mockSlug: string }>;
  searchParams: Promise<{ mock_attempt?: string }>;
};

export default async function MockTestPage({ params, searchParams }: Props) {
  const { mockSlug } = await params;
  const sp = await searchParams;
  ensureCanonicalMockHub(mockSlug);

  redirect(testHubPath(mockSlug, sp.mock_attempt ?? undefined));
}
