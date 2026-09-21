import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  canonicalMockSlug,
  shortModuleExamPath,
} from "@/lib/mock-catalog";
import { isLiveCatalogNumber } from "@/lib/mock-catalog-api";
import { isUuid } from "@/lib/mock-ids";
import {
  planExerciseHref,
  type PlanTaskKind,
} from "@/lib/plan-task-flow";
import { parseSkillContext } from "@/lib/practice-submit";
import { guardMockModulePage } from "@/lib/mock-page-auth";
import { getCachedCookieHeader } from "@/lib/server-cache";
import { resolveCatalogSlotServer } from "@/lib/mock-server";
import { ListeningPage } from "@/modules/listening/components/listening-page";
import { MockLayout } from "@/modules/mock/components/mock-layout";

export const metadata: Metadata = {
  title: "Listening · BandForge",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ number: string }>;
  searchParams: Promise<{
    part?: string;
    skill_context?: string;
    from?: string;
    task?: string;
    taskId?: string;
    hubId?: string;
    auto?: string;
  }>;
};

function parsePlanTask(value: string | undefined): PlanTaskKind | null {
  if (value === "watch" || value === "practice" || value === "submit") return value;
  return null;
}

export default async function TestListeningPage({ params, searchParams }: Props) {
  const { number: numberRaw } = await params;
  const sp = await searchParams;
  const testNumber = Number.parseInt(numberRaw, 10);
  if (!Number.isFinite(testNumber) || testNumber < 1 || !isLiveCatalogNumber(testNumber)) {
    notFound();
  }

  const part = sp.part ? Number.parseInt(sp.part, 10) : 1;
  const skillContext = parseSkillContext(sp.skill_context);
  const fromPlan = sp.from === "plan";
  const planTask = parsePlanTask(sp.task) ?? "practice";
  const planHubId = sp.hubId ?? null;
  const returnPath = shortModuleExamPath(testNumber, "listening", { part });

  const cookieHeader = await getCachedCookieHeader();
  await guardMockModulePage(cookieHeader, returnPath);

  // All listening practice hubs are bank-type; catalog Tests 1–2 have no
  // listening questions. Stale plan links still hit /test/N/listening.
  if (fromPlan && planHubId && isUuid(planHubId)) {
    redirect(
      planExerciseHref({
        skill: "listening",
        hubId: planHubId,
        task: planTask,
        taskId: sp.taskId ?? null,
      }),
    );
  }

  const resolved = await resolveCatalogSlotServer(cookieHeader, testNumber);
  if (!resolved) notFound();
  const { mockTestId, mockMeta } = resolved;
  const mockSlug = canonicalMockSlug(mockTestId);

  return (
    <MockLayout>
      <ListeningPage
        testId={mockTestId}
        mockSlug={mockSlug}
        mockMeta={mockMeta}
        part={part}
        variant="exam"
        testNumber={testNumber}
        skillContext={skillContext}
        fromPlan={fromPlan}
        planTask={parsePlanTask(sp.task)}
        planTaskId={sp.taskId ?? null}
        planHubId={planHubId}
      />
    </MockLayout>
  );
}
