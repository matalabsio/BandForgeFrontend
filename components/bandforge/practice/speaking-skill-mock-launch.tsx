"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  speakingMockUnavailableCopy,
} from "@/lib/speaking-skill-course";
import { speakingSkillMockExamPath } from "@/lib/speaking-skill-mock-path";
import { speakingApi } from "@/modules/speaking/services/speaking-api";

type Props = {
  mockTestId: string;
};

/** Starts the Speaking Skill allotted mock (server-authorized mock_test_id). */
export function SpeakingSkillMockLaunch({ mockTestId }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await speakingApi.start(mockTestId);
        if (cancelled) return;
        router.replace(speakingSkillMockExamPath(mockTestId, res.part));
      } catch {
        if (!cancelled) setError(speakingMockUnavailableCopy());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mockTestId, router]);

  if (error) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-[28px] border border-amber-200/80 bg-amber-50/90 px-5 py-8 text-center">
        <p className="text-[14px] text-amber-950">{error}</p>
        <Link
          href="/practice/speaking"
          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-navy px-5 text-[13px] font-bold text-white"
        >
          Back to course
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-[28px] border border-white/60 bg-white/55 px-5 py-10 text-center backdrop-blur-xl">
      <p className="text-sm text-muted">Starting your Speaking Mock…</p>
    </div>
  );
}
