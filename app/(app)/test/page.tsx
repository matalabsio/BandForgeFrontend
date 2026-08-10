import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProductionAuthConfigError } from "@/components/auth/production-auth-config-error";
import {
  isProductionAuthMisconfigured,
  redirectIfUnauthenticated,
} from "@/lib/auth-guard-server";
import {
  buildCatalogPanel,
  defaultCatalogTestNumber,
  slotByNumber,
} from "@/lib/mock-catalog-api";
import { mockTestNumberPath, mockTestsIndexPath } from "@/lib/mock-catalog";
import { M01_MOCK_TEST_ID, M02_MOCK_TEST_ID } from "@/lib/mock-ids";
import { fetchMockCatalogServer, fetchMockSessionServer } from "@/lib/mock-server";
import { perfLog } from "@/lib/performance";
import { getCachedCookieHeader, getCachedServerSession } from "@/lib/server-cache";
import { MockTestsUnified } from "@/modules/mock/components/mock-tests-unified";

export const metadata: Metadata = {
  title: "Full mock tests · BandForge",
  description: "Choose an IELTS Academic full mock test.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ test?: string; mock_attempt?: string }>;
};

/** Static IDs for Test 1/2 so session can load in parallel with catalog. */
const KNOWN_MOCK_ID_BY_NUMBER: Record<number, string> = {
  1: M01_MOCK_TEST_ID,
  2: M02_MOCK_TEST_ID,
};

export default async function MockTestsIndexPage({ searchParams }: Props) {
  if (isProductionAuthMisconfigured()) {
    return <ProductionAuthConfigError />;
  }

  const pageStart = performance.now();
  const sp = await searchParams;

  let t0 = performance.now();
  const cookieHeader = await getCachedCookieHeader();
  perfLog("test-page-ssr", {
    step: "cookie-header",
    duration_ms: Math.round(performance.now() - t0),
    test: sp.test ?? null,
  });

  const requestedNumber =
    sp.test !== undefined && sp.test !== ""
      ? Number.parseInt(sp.test, 10)
      : null;
  if (
    requestedNumber !== null &&
    (!Number.isFinite(requestedNumber) || requestedNumber < 1)
  ) {
    notFound();
  }

  const knownId =
    requestedNumber !== null
      ? (KNOWN_MOCK_ID_BY_NUMBER[requestedNumber] ?? null)
      : null;

  t0 = performance.now();
  const userPromise = getCachedServerSession(cookieHeader);
  const dataPromise = Promise.all([
    fetchMockCatalogServer(cookieHeader),
    knownId
      ? fetchMockSessionServer(cookieHeader, knownId)
      : Promise.resolve(null),
  ]);

  const user = await userPromise;
  perfLog("test-page-ssr", {
    step: "user-fetch",
    duration_ms: Math.round(performance.now() - t0),
    test: sp.test ?? null,
  });

  redirectIfUnauthenticated(user, mockTestsIndexPath(), cookieHeader);

  const [catalog, parallelSession] = await dataPromise;
  const catalogFetchMs = Math.round(performance.now() - t0);
  perfLog("test-page-ssr", {
    step: "catalog-session-fetch",
    duration_ms: catalogFetchMs,
    test: requestedNumber,
    parallel_session: Boolean(knownId),
  });

  const panel = buildCatalogPanel(catalog);

  let number: number;
  if (requestedNumber === null) {
    number = defaultCatalogTestNumber(panel);
    redirect(mockTestNumberPath(number, sp.mock_attempt ?? undefined));
  } else {
    number = requestedNumber;
  }

  const slot = slotByNumber(panel, number);
  if (!slot) {
    notFound();
  }

  t0 = performance.now();
  let initialProgress = parallelSession;
  if (slot.available && slot.id && (!knownId || knownId !== slot.id)) {
    initialProgress = await fetchMockSessionServer(cookieHeader, slot.id);
  } else if (!slot.available || !slot.id) {
    initialProgress = null;
  }
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
    <MockTestsUnified
      catalogSlots={panel}
      activeNumber={number}
      selectedSlot={slot}
      initialProgress={initialProgress}
    />
  );
}
