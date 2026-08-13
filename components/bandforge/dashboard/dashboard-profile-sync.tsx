"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";
import { readDiagnosticLeadLoose } from "@/lib/diagnostic-lead";
import { updateProfile } from "@/lib/profile";

type Props = {
  ieltsPurpose?: string | null;
  ieltsGoal?: string | null;
};

/** Re-fetch dashboard server data when profile is saved elsewhere in the app. */
export function DashboardProfileSync({
  ieltsPurpose = null,
  ieltsGoal = null,
}: Props) {
  const { refresh } = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backfillStarted = useRef(false);

  useEffect(() => {
    const onUpdated = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        refresh();
      }, 300);
    };
    window.addEventListener("bf-profile-updated", onUpdated);
    return () => {
      window.removeEventListener("bf-profile-updated", onUpdated);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [refresh]);

  useEffect(() => {
    if (backfillStarted.current) return;
    const lead = readDiagnosticLeadLoose();
    const purpose = lead?.purpose;
    const goal = lead?.goal;
    const needsPurpose = !ieltsPurpose && Boolean(purpose);
    const needsGoal = !ieltsGoal && Boolean(goal);
    if (!needsPurpose && !needsGoal) return;

    const fullName = (lead?.fullName ?? "").trim();
    backfillStarted.current = true;

    void (async () => {
      const user = await getMe().catch(() => null);
      if (!user || user.role === "guest") return;
      const name = (user.full_name ?? fullName).trim();
      if (!name) return;
      await updateProfile({
        full_name: name,
        phone: user.phone ?? lead?.phone ?? null,
        target_band: user.target_band ?? lead?.targetBand ?? null,
        exam_date: lead?.examDate ?? null,
        ...(needsPurpose && purpose ? { ielts_purpose: purpose } : {}),
        ...(needsGoal && goal ? { ielts_goal: goal } : {}),
      });
      window.dispatchEvent(new CustomEvent("bf-profile-updated"));
    })().catch(() => undefined);
  }, [ieltsPurpose, ieltsGoal]);

  return null;
}
