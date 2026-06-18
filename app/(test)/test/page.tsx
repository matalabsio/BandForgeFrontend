import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { authBootstrapPath } from "@/lib/auth";
import {
  buildCatalogPanel,
  defaultCatalogTestNumber,
  slotByNumber,
} from "@/lib/mock-catalog-api";
import { mockTestNumberPath, mockTestsIndexPath } from "@/lib/mock-catalog";
import { fetchMockCatalogServer, fetchMockSessionServer } from "@/lib/mock-server";
import { perfLog } from "@/lib/performance";
import { getCachedCookieHeader, getCachedServerUser } from "@/lib/server-cache";
import { MockLayout } from "@/modules/mock/components/mock-layout";
import { MockTestsUnified } from "@/modules/mock/components/mock-tests-unified";

export const metadata: Metadata = {
  title: "Full mock tests · BandForge",
  description: "Choose an IELTS Academic full mock test.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ test?: string; mock_attempt?: string }>;
};

export default async function MockTestsIndexPage({ searchParams }: Props) {
  const pageStart = performance.now();
  const sp = await searchParams;

  let t0 = performance.now();
  const cookieHeader = await getCachedCookieHeader();
  perfLog("test-page-ssr", {
    step: "cookie-header",
    duration_ms: Math.round(performance.now() - t0),
    test: sp.test ?? null,
  });

  t0 = performance.now();
  const user = await getCachedServerUser(cookieHeader);
  perfLog("test-page-ssr", {
    step: "user-fetch",
    duration_ms: Math.round(performance.now() - t0),
    test: sp.test ?? null,
  });

  if (!user) {
    redirect(authBootstrapPath(mockTestsIndexPath()));
  }

  t0 = performance.now();
  const catalog = await fetchMockCatalogServer(cookieHeader);
  const catalogFetchMs = Math.round(performance.now() - t0);
  perfLog("test-page-ssr", {
    step: "catalog-fetch",
    duration_ms: catalogFetchMs,
    test: sp.test ?? null,
  });

  const panel = buildCatalogPanel(catalog);

  let number: number;
  if (sp.test === undefined || sp.test === "") {
    number = defaultCatalogTestNumber(panel);
    redirect(mockTestNumberPath(number, sp.mock_attempt ?? undefined));
  } else {
    number = Number.parseInt(sp.test, 10);
    if (!Number.isFinite(number) || number < 1) {
      notFound();
    }
  }

  const slot = slotByNumber(panel, number);
  if (!slot) {
    notFound();
  }

  // Baseline: measure parallel catalog+session (does not change SSR execution order).
  const parallelStart = performance.now();
  await Promise.all([
    fetchMockCatalogServer(cookieHeader),
    slot.available && slot.id
      ? fetchMockSessionServer(cookieHeader, slot.id)
      : Promise.resolve(null),
  ]);
  perfLog("test-page-ssr", {
    step: "parallel-fetch-baseline",
    duration_ms: Math.round(performance.now() - parallelStart),
    test: number,
    note: "catalog+session in parallel; SSR still runs sequentially",
  });

  t0 = performance.now();
  const initialProgress =
    slot.available && slot.id
      ? await fetchMockSessionServer(cookieHeader, slot.id)
      : null;
  const sessionFetchMs = Math.round(performance.now() - t0);
  perfLog("test-page-ssr", {
    step: "session-fetch",
    duration_ms: sessionFetchMs,
    test: number,
  });

  perfLog("test-page-ssr", {
    step: "page-total",
    duration_ms: Math.round(performance.now() - pageStart),
    test: number,
    catalog_fetch_ms: catalogFetchMs,
    session_fetch_ms: sessionFetchMs,
  });

  return (
    <MockLayout>
      <MockTestsUnified
        catalogSlots={panel}
        activeNumber={number}
        selectedSlot={slot}
        initialProgress={initialProgress}
      />
    </MockLayout>
  );
}
