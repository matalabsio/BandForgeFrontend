import { notFound, redirect } from "next/navigation";
import { redirectIfUnauthenticated } from "@/lib/auth-guard-server";
import { ensurePlanShortLink } from "@/lib/learning-server";
import { isUuid } from "@/lib/mock-ids";
import {
  isPlanShortTaskKind,
  parsePlanShortSkillCode,
  planShortPath,
} from "@/lib/plan-short-path";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    /** Skill letter (l|r|w|s) — must share the name `code` with /p/[code]. */
    code: string;
    hubId: string;
    task: string;
    taskId: string;
  }>;
};

/**
 * Legacy bridge: /p/{l|r|w|s}/{hubId}/{task}/{taskId} → /p/{opaqueCode}
 * First segment is named `code` to satisfy Next.js (same slug as /p/[code]).
 */
export default async function LegacyPlanShortBridgePage({ params }: PageProps) {
  const { code: skillCode, hubId, task: taskRaw, taskId: taskIdRaw } =
    await params;
  const skill = parsePlanShortSkillCode(skillCode);
  const taskId = taskIdRaw?.trim() ?? "";
  if (!skill || !isUuid(hubId) || !isPlanShortTaskKind(taskRaw) || !taskId) {
    notFound();
  }

  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  redirectIfUnauthenticated(
    user,
    `/p/${skillCode}/${hubId}/${taskRaw}/${taskId}`,
    cookieHeader,
  );

  const ensured = await ensurePlanShortLink(cookieHeader, {
    skill,
    hub_id: hubId,
    task_type: taskRaw,
    task_id: taskId,
  });
  if (ensured?.href) {
    redirect(ensured.href);
  }
  redirect(planShortPath({ skill, hubId, task: taskRaw, taskId }));
}
