"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { examPathForMockStart } from "@/lib/mock-catalog";
import { writingMockUnavailableCopy } from "@/lib/writing-skill-course";
import { mockApi } from "@/modules/mock/services/mock-api";

type Props = {
  mockTestId: string;
};

/** Starts the Writing Skill allotted mock (server-authorized mock_test_id). */
export function WritingSkillMockLaunch({ mockTestId }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await mockApi.start(mockTestId);
        if (cancelled) return;
        const path = examPathForMockStart(mockTestId, {
          mock_attempt_id: res.mock_attempt_id,
          current_module: res.current_module,
          part: res.part,
        });
        router.replace(path);
      } catch {
        if (!cancelled) setError(writingMockUnavailableCopy());
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
          href="/practice/writing"
          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-navy px-5 text-[13px] font-bold text-white"
        >
          Back to course
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-[28px] border border-white/60 bg-white/55 px-5 py-10 text-center backdrop-blur-xl">
      <p className="text-sm text-muted">Starting your Writing Mock…</p>
    </div>
  );
}
