import { redirect } from "next/navigation";
import { resolveAuthRedirectPath } from "@/lib/auth";
import {
  M01_MOCK_TEST_ID,
  M02_MOCK_TEST_ID,
  getMockMeta,
  type MockSlug,
} from "@/lib/mock-catalog";
import { parseSkillContext } from "@/lib/practice-submit";
import type { PlanTaskKind } from "@/lib/plan-task-flow";
import { writingTestHubPath } from "@/lib/writing-test";
import { getCachedCookieHeader, getCachedServerSession } from "@/lib/server-cache";
import { WritingPage } from "@/modules/writing/components/writing-page";

type Props = {
  params: Promise<{ part: string }>;
  searchParams: Promise<{
    mock_attempt?: string;
    auto?: string;
    skill_context?: string;
    from?: string;
    task?: string;
    taskId?: string;
    hubId?: string;
    mock?: string;
  }>;
};

function parsePlanTask(value: string | undefined): PlanTaskKind | null {
  if (value === "watch" || value === "practice" || value === "submit") return value;
  return null;
}

function resolveMockSlug(raw: string | undefined): MockSlug {
  return raw === "m02" ? "m02" : "m01";
}

export default async function WritingTaskPage({ params, searchParams }: Props) {
  const { part: partRaw } = await params;
  const sp = await searchParams;
  const part = Number.parseInt(partRaw, 10);
  if (part !== 1 && part !== 2) {
    redirect(writingTestHubPath());
  }

  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  if (!user) {
    const qs = new URLSearchParams();
    if (sp.mock_attempt) qs.set("mock_attempt", sp.mock_attempt);
    if (sp.from) qs.set("from", sp.from);
    if (sp.task) qs.set("task", sp.task);
    if (sp.taskId) qs.set("taskId", sp.taskId);
    if (sp.hubId) qs.set("hubId", sp.hubId);
    if (sp.mock) qs.set("mock", sp.mock);
    const q = qs.toString();
    redirect(
      resolveAuthRedirectPath(
        `/test/writing/task/${part}${q ? `?${q}` : ""}`,
        cookieHeader,
      ),
    );
  }

  const skillContext = parseSkillContext(sp.skill_context);
  const mockSlug = resolveMockSlug(sp.mock);
  const mockTestId = mockSlug === "m02" ? M02_MOCK_TEST_ID : M01_MOCK_TEST_ID;
  const fromPlan = sp.from === "plan";

  return (
    <WritingPage
      mockTestId={mockTestId}
      mockSlug={mockSlug}
      mockMeta={getMockMeta(mockSlug)}
      part={part}
      autoStart={sp.auto === "1" || sp.auto === "true" || fromPlan}
      skillContext={skillContext}
      fromPlan={fromPlan}
      planTask={parsePlanTask(sp.task)}
      planTaskId={sp.taskId ?? null}
      planHubId={sp.hubId ?? null}
    />
  );
}
