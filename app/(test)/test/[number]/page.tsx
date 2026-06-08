import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { authBootstrapPath } from "@/lib/auth";
import {
  MOCK_CATALOG,
  getMockPanelSlot,
  mockTestNumberPath,
  type MockSlug,
} from "@/lib/mock-catalog";
import { getCachedCookieHeader, getCachedServerUser } from "@/lib/server-cache";
import { fetchMockSessionServer } from "@/lib/mock-server";
import { MockLayout } from "@/modules/mock/components/mock-layout";
import { MockTestComingSoon } from "@/modules/mock/components/mock-test-coming-soon";
import { MockTestHub } from "@/modules/mock/components/mock-test-hub";

type Props = {
  params: Promise<{ number: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number } = await params;
  const slot = getMockPanelSlot(Number.parseInt(number, 10));
  return {
    title: `${slot?.displayLabel ?? "Mock test"} · BandForge`,
    robots: { index: false, follow: false },
  };
}

export default async function TestNumberHubPage({ params }: Props) {
  const { number: numberRaw } = await params;
  const number = Number.parseInt(numberRaw, 10);
  const slot = getMockPanelSlot(number);

  if (!slot) {
    notFound();
  }

  const cookieHeader = await getCachedCookieHeader();

  if (!slot.available || !slot.slug) {
    const user = await getCachedServerUser(cookieHeader);
    if (!user) {
      redirect(authBootstrapPath(mockTestNumberPath(number)));
    }

    return (
      <MockLayout>
        <MockTestComingSoon slot={slot} />
      </MockLayout>
    );
  }

  const mockSlug = slot.slug as MockSlug;
  const catalog = MOCK_CATALOG[mockSlug];
  const [user, initialProgress] = await Promise.all([
    getCachedServerUser(cookieHeader),
    fetchMockSessionServer(cookieHeader, catalog.id),
  ]);

  if (!user) {
    redirect(authBootstrapPath(mockTestNumberPath(number)));
  }

  return (
    <MockLayout>
      <MockTestHub
        mockSlug={mockSlug}
        mockTestId={catalog.id}
        title={slot.displayLabel}
        initialProgress={initialProgress}
      />
    </MockLayout>
  );
}
